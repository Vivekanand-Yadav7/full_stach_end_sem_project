function buildPrompt(query, products) {

    return `
You are a food recommendation assistant.

User Query:
${query}

Retrieved Products:

${JSON.stringify(products, null, 2)}

Recommend the most relevant products.
`;
}

module.exports = { buildPrompt };