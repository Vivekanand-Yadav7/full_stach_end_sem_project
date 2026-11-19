require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { generateShoppingRecommendation } = require('./rag/config/qwen.js');
const { buildChatMessages, buildPrompt } = require('./rag/retrieve/prompt.js');

async function testPipeline() {
  console.log("🚀 Testing InvenOrder RAG Shopping Assistant Pipeline with Fine-Tuned Qwen Model...\n");

  const sampleProducts = [
    {
      name: "Classic Cheeseburger",
      category: "Burger",
      price: 8.99,
      description: "Juicy beef patty with melted cheddar.",
      quantity: 50,
      productId: "prod-1"
    },
    {
      name: "Double Bacon Burger",
      category: "Burger",
      price: 12.50,
      description: "Two patties and crispy bacon.",
      quantity: 0, // Out of stock to test substitution!
      productId: "prod-2"
    },
    {
      name: "Spicy Chicken Sandwich",
      category: "Burger",
      price: 9.99,
      description: "Crispy chicken with spicy mayo.",
      quantity: 40,
      productId: "prod-3"
    }
  ];

  const userQuery = "Can I order the Double Bacon Burger, or what do you recommend?";
  console.log(`👤 User Query: "${userQuery}"\n`);
  console.log("📦 Injected Store Inventory (Retrieved context):");
  sampleProducts.forEach(p => console.log(`   - ${p.name} ($${p.price.toFixed(2)}) — ${p.quantity > 0 ? `In Stock (${p.quantity})` : 'Out of Stock'}`));

  const messages = buildChatMessages(userQuery, sampleProducts);
  const rawPrompt = buildPrompt(userQuery, sampleProducts);

  console.log("\n⏳ Querying fine-tuned Qwen model server at http://localhost:8000/v1/chat/completions...");
  const startTime = Date.now();
  const result = await generateShoppingRecommendation(messages, rawPrompt);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Completed in ${elapsed}s via [${result.source.toUpperCase()}]`);
  console.log("\n🤖 Assistant Response:");
  console.log("--------------------------------------------------");
  console.log(result.text);
  console.log("--------------------------------------------------");
}

testPipeline().catch(err => console.error("Test failed:", err));
