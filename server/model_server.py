import os
import sys
import time
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Optimize CPU threads
torch.set_num_threads(int(os.getenv("TORCH_NUM_THREADS", "8")))

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADAPTER_PATH = os.path.join(BASE_DIR, "invenorder-qwen3.5-2b-lora")
BASE_MODEL_NAME = os.getenv("BASE_MODEL_NAME", "unsloth/Qwen3.5-2B")

print(f"🔧 Starting InvenOrder Fine-Tuned Model Server...")
print(f"📁 Adapter path: {ADAPTER_PATH}")
print(f"🧠 Base model: {BASE_MODEL_NAME}")

app = FastAPI(title="InvenOrder Fine-Tuned Qwen Inference API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model & tokenizer
tokenizer = None
model = None
is_ready = False

def load_model():
    global tokenizer, model, is_ready
    from transformers import AutoTokenizer, Qwen3_5ForConditionalGeneration
    from peft import PeftModel

    print(f"⏳ Loading tokenizer from {ADAPTER_PATH}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(ADAPTER_PATH, trust_remote_code=True)
    except Exception as e:
        print(f"⚠️ Could not load tokenizer from adapter dir ({e}), trying {BASE_MODEL_NAME}...")
        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME, trust_remote_code=True)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print(f"⏳ Loading Qwen3.5 base model '{BASE_MODEL_NAME}' in bfloat16...")
    base_model = Qwen3_5ForConditionalGeneration.from_pretrained(
        BASE_MODEL_NAME,
        dtype=torch.bfloat16,
        device_map="cpu",
        low_cpu_mem_usage=True,
        local_files_only=True
    )

    print(f"⏳ Attaching PEFT LoRA adapter from {ADAPTER_PATH}...")
    model = PeftModel.from_pretrained(base_model, ADAPTER_PATH, is_trainable=False)
    model.eval()
    is_ready = True
    print("✅ Model successfully loaded and ready for inference!")

@app.on_event("startup")
def startup_event():
    try:
        load_model()
    except Exception as e:
        print(f"❌ Error loading model on startup: {e}", file=sys.stderr)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = "invenorder-qwen3.5-2b-lora"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.1
    max_tokens: Optional[int] = 60
    stream: Optional[bool] = False

class SimplePromptRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 60
    temperature: Optional[float] = 0.1

@app.get("/health")
def health():
    return {
        "status": "ready" if is_ready else "loading",
        "model": "invenorder-qwen3.5-2b-lora",
        "base_model": BASE_MODEL_NAME
    }

@app.post("/v1/chat/completions")
def chat_completions(req: ChatCompletionRequest):
    if not is_ready or model is None:
        raise HTTPException(status_code=503, detail="Model is still loading or failed to load")

    # Format messages using chat template
    messages_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
    
    try:
        prompt_text = tokenizer.apply_chat_template(
            messages_dicts,
            tokenize=False,
            add_generation_prompt=True
        )
    except Exception as e:
        prompt_text = ""
        for m in req.messages:
            prompt_text += f"<|im_start|>{m.role}\n{m.content}<|im_end|>\n"
        prompt_text += "<|im_start|>assistant\n"

    inputs = tokenizer(prompt_text, return_tensors="pt").to("cpu")
    input_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=req.max_tokens,
            do_sample=req.temperature > 0,
            temperature=req.temperature if req.temperature > 0 else 1.0,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    new_tokens = output_ids[0][input_len:]
    generated_text = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    return {
        "id": f"chatcmpl-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": generated_text
                },
                "finish_reason": "stop"
            }
        ]
    }

@app.post("/generate")
def generate(req: SimplePromptRequest):
    if not is_ready or model is None:
        raise HTTPException(status_code=503, detail="Model is still loading or failed to load")

    inputs = tokenizer(req.prompt, return_tensors="pt").to("cpu")
    input_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=req.max_tokens,
            do_sample=req.temperature > 0,
            temperature=req.temperature if req.temperature > 0 else 1.0,
            use_cache=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    new_tokens = output_ids[0][input_len:]
    generated_text = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
    return {"text": generated_text}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MODEL_PORT", "8000"))
    uvicorn.run("model_server:app", host="0.0.0.0", port=port, reload=False)
