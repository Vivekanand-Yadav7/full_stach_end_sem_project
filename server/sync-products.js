const prisma = require('./config/prisma');
const { indexProduct } = require('./rag/ingest/indexProduct');

async function sync() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    console.log("Indexing:", p.name);
    await indexProduct(p);
  }
  console.log("Done syncing", products.length, "products.");
}
sync();
