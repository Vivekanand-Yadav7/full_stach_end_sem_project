const { createProductDocument } = require("./documentBuilder.js");
const { generateEmbedding } = require("./embeddings.js");
const { saveProductVector } = require("./vectorStore.js");

async function indexProduct(product) {

    const document = createProductDocument(product);

    const embedding = await generateEmbedding(document);

    await saveProductVector(
        product.id,
        embedding,
        {
            productId: product.id,
            sellerId: product.sellerId,
            restaurantId: product.restaurantId,
            category: product.category,
            name: product.name,
            veg: product.veg,
            available: product.available
        }
    );
}

module.exports = { indexProduct };