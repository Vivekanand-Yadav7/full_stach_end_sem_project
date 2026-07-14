const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const product = await prisma.product.create({
      data: {
        name: 'Test',
        price: 12.99,
        category: 'Burger',
        quantity: 10,
        description: 'Test',
        imageUrl: 'url',
        seller: 'Test Seller',
        ingredients: [],
        nutrition: []
      }
    });
    console.log(product);
  } catch (e) {
    console.error(e);
  }
}
main();
