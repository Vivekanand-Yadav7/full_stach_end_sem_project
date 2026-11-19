/**
 * fix-remaining-images.js — fixes all broken/404 image URLs in the database
 */
require('dotenv').config();
const prisma = require('./config/prisma');

const updates = [
  {
    name: 'Desi Samosa',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
  },
  {
    name: 'Double Bacon Burger',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
  },
  {
    name: 'Palak Paneer',
    imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=500&q=80',
  },
  {
    name: 'Paneer Tikka',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80',
  },
  {
    name: 'Salmon Nigiri (8 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
  },
  {
    name: 'Vegetable Maki (6 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80',
  },
];

async function run() {
  console.log('\n🔧 Updating broken images in database...\n');
  for (const item of updates) {
    const res = await prisma.product.updateMany({
      where: { name: item.name },
      data: { imageUrl: item.imageUrl },
    });
    console.log(`  ✅ Updated ${item.name} (${res.count} record(s))`);
  }
  console.log('\n🎉 All broken image URLs updated successfully!\n');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
