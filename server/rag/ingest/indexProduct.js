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
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            description: product.description,
            seller: product.seller
        }
    );
}

module.exports = { indexProduct };