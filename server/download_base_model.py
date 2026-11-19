import os
import sys
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADAPTER_PATH = os.path.join(BASE_DIR, "invenorder-qwen3.5-2b-lora")
BASE_MODEL_NAME = os.getenv("BASE_MODEL_NAME", "unsloth/Qwen3.5-2B")

print(f"📥 Verifying / Downloading Base Model: {BASE_MODEL_NAME}...")
print(f"📁 Adapter path: {ADAPTER_PATH}")

try:
    print("⏳ Downloading / verifying tokenizer...")
    tok = AutoTokenizer.from_pretrained(BASE_MODEL_NAME, trust_remote_code=True)
    print("✅ Tokenizer ready.")

    print(f"⏳ Downloading / caching model weights for '{BASE_MODEL_NAME}' (~4.3 GB)...")
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_NAME,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
        trust_remote_code=True
    )
    print("✅ Base model loaded into cache.")

    print(f"⏳ Verifying PEFT LoRA adapter from '{ADAPTER_PATH}'...")
    peft_model = PeftModel.from_pretrained(model, ADAPTER_PATH)
    print("✅ PEFT LoRA adapter successfully attached to base model!")
    print("🎉 Everything is downloaded and ready for model_server.py!")

except Exception as e:
    print(f"❌ Error during model preparation: {e}", file=sys.stderr)
    sys.exit(1)

