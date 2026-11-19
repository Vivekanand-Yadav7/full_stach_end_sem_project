/**
 * check-images.js — tests all product image URLs and reports broken ones
 */
const prisma = require('./config/prisma');

async function checkImages() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, imageUrl: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\n🔍 Checking ${products.length} product images...\n`);

  const broken = [];
  for (const p of products) {
    if (!p.imageUrl) {
      console.log(`  ❌ NO URL   : ${p.name}`);
      broken.push(p);
      continue;
    }
    try {
      const res = await fetch(p.imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        console.log(`  ✅ OK (${res.status}): ${p.name}`);
      } else {
        console.log(`  ❌ ${res.status}       : ${p.name}  →  ${p.imageUrl}`);
        broken.push(p);
      }
    } catch (e) {
      console.log(`  ❌ ERR      : ${p.name}  →  ${e.message}`);
      broken.push(p);
    }
  }

  console.log(`\n📋 Summary: ${broken.length} broken out of ${products.length}`);
  if (broken.length) {
    console.log('\nBroken products:');
    broken.forEach(p => console.log(`  - ${p.name}: ${p.imageUrl}`));
  }
  await prisma.$disconnect();
}

checkImages().catch(e => { console.error(e); process.exit(1); });

