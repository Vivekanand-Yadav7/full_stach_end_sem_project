const { OllamaEmbeddings, ChatOllama } = require("@langchain/ollama");

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
});

const llm = new ChatOllama({
    model: "llama3.1:latest",
    baseUrl: "http://localhost:11434",
    temperature: 0,
});

module.exports = { embeddings, llm };