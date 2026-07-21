const { QdrantClient } = require("@qdrant/js-client-rest");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const qUrl = (process.env.QDRANT_URL || "").replace(/^"|"$/g, '').trim();
const qKey = (process.env.QDRANT_API_KEY || "").replace(/^"|"$/g, '').trim();

const client = new QdrantClient({
  url: qUrl,
  apiKey: qKey,
  port: qUrl.startsWith("https") ? 443 : 6333,
});

module.exports = client;