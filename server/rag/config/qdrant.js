const { QdrantClient } = require("@qdrant/js-client-rest");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  port: process.env.QDRANT_URL && process.env.QDRANT_URL.startsWith("https") ? 443 : 6333,
});

module.exports = client;