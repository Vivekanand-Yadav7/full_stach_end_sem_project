const createProductDocument = (product) => {
    return `
Product Name: ${product.name}

Description:
${product.description || "Not provided"}

Ingredients:
${product.ingredients?.join("\n") || "Not provided"}

Nutrition:
${product.nutrition?.join("\n") || "Not provided"}

Category:
${product.category || "Not provided"}

Tags:
${product.tags?.join("\n") || "Not provided"}

Price:
₹${product.price}
`.trim();
};

module.exports = { createProductDocument };