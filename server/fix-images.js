/**
 * fix-images.js — updates image URLs for products that had wrong photos
 * Run with: node server/fix-images.js
 */
const prisma = require('./config/prisma');

const fixes = [
  // ── Items with verified correct Unsplash photo IDs ──────────────────

  // Grilled Chicken Wrap was showing furniture
  {
    name: 'Grilled Chicken Wrap',
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
  },

  // Gulab Jamun was showing samosa (reused wrong photo)
  {
    name: 'Gulab Jamun (6 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=500&q=80',
  },

  // Jalebi was showing a veg thali (reused wrong photo)
  {
    name: 'Jalebi',
    imageUrl: 'https://images.unsplash.com/photo-1778448806608-4b2d5817eff2?w=500&q=80',
  },

  // Samosa was showing palak paneer (reused photo-1601050690597)
  {
    name: 'Samosa (4 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1772729219154-2f5d5ddd732b?w=500&q=80',
  },

  // Palak Paneer also had the same wrong ID — fix with a green curry photo
  {
    name: 'Palak Paneer',
    imageUrl: 'https://images.unsplash.com/photo-1645696301019-35adcc18cff9?w=500&q=80',
  },

  // Dal Makhani shared wrong ID — fix with a lentil curry photo
  {
    name: 'Dal Makhani',
    imageUrl: 'https://images.unsplash.com/photo-1788603092417-a01e665e0ab2?w=500&q=80',
  },

  // Rasgulla — fix with correct photo
  {
    name: 'Rasgulla (4 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1714799263412-2e0c1f875959?w=500&q=80',
  },

  // Paneer Kathi Roll shared same photo as Paneer Tikka — fix with wrap photo
  {
    name: 'Paneer Kathi Roll',
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
  },

  // Strawberry Milkshake was using a burger photo — fix with actual milkshake
  {
    name: 'Strawberry Milkshake',
    imageUrl: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=500&q=80',
  },

  // Club Sandwich — better image
  {
    name: 'Club Sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80',
  },
];

async function fixImages() {
  console.log('\n🔧 Fixing product image URLs...\n');
  let fixed = 0;
  for (const { name, imageUrl } of fixes) {
    const result = await prisma.product.updateMany({
      where: { name },
      data: { imageUrl },
    });
    if (result.count > 0) {
      console.log(`  ✅ Fixed: ${name}`);
      fixed++;
    } else {
      console.log(`  ⚠️  Not found: ${name}`);
    }
  }
  console.log(`\n🎉 Done! Fixed ${fixed} product images.\n`);
  await prisma.$disconnect();
}

fixImages().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

