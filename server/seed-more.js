/**
 * seed-more.js — adds 30 new products across new categories
 * Run with: node server/seed-more.js
 */
const prisma = require('./config/prisma');

const newProducts = [
  // ── Indian ──────────────────────────────────────────────────────────
  {
    name: 'Butter Chicken',
    price: 14.99,
    category: 'Indian',
    quantity: 35,
    description: 'Tender chicken in a rich, creamy tomato-butter sauce. Served with naan.',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
    ingredients: ['chicken', 'butter', 'tomato', 'cream', 'spices'],
    nutrition: ['Calories: 450', 'Protein: 32g', 'Carbs: 18g'],
  },
  {
    name: 'Paneer Tikka',
    price: 12.50,
    category: 'Indian',
    quantity: 30,
    description: 'Marinated cottage cheese cubes grilled in a tandoor oven with peppers.',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=500&q=80',
    ingredients: ['paneer', 'yogurt', 'spices', 'peppers'],
    nutrition: ['Calories: 320', 'Protein: 22g', 'Carbs: 12g'],
  },
  {
    name: 'Biryani',
    price: 16.00,
    category: 'Indian',
    quantity: 25,
    description: 'Aromatic basmati rice cooked with saffron, spices, and slow-cooked chicken.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
    ingredients: ['basmati rice', 'chicken', 'saffron', 'spices', 'fried onions'],
    nutrition: ['Calories: 620', 'Protein: 38g', 'Carbs: 72g'],
  },
  {
    name: 'Palak Paneer',
    price: 13.00,
    category: 'Indian',
    quantity: 20,
    description: 'Creamy spinach curry with fresh paneer cubes. A vegetarian classic.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
    ingredients: ['spinach', 'paneer', 'cream', 'spices'],
    nutrition: ['Calories: 280', 'Protein: 18g', 'Carbs: 14g'],
  },
  {
    name: 'Samosa (4 pcs)',
    price: 6.00,
    category: 'Indian',
    quantity: 60,
    description: 'Crispy golden pastry filled with spiced potatoes and peas. Served with chutney.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
    ingredients: ['pastry', 'potatoes', 'peas', 'spices'],
    nutrition: ['Calories: 180', 'Protein: 4g', 'Carbs: 24g'],
  },
  {
    name: 'Dal Makhani',
    price: 11.50,
    category: 'Indian',
    quantity: 25,
    description: 'Black lentils slow-cooked overnight in butter and cream. Rich and smoky.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
    ingredients: ['black lentils', 'butter', 'cream', 'tomatoes', 'spices'],
    nutrition: ['Calories: 340', 'Protein: 16g', 'Carbs: 42g'],
  },

  // ── Drinks ──────────────────────────────────────────────────────────
  {
    name: 'Mango Lassi',
    price: 4.50,
    category: 'Drinks',
    quantity: 50,
    description: 'Thick and sweet yogurt-based drink blended with fresh Alphonso mangoes.',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80',
    ingredients: ['yogurt', 'mango', 'sugar', 'cardamom'],
    nutrition: ['Calories: 220', 'Protein: 6g', 'Carbs: 38g'],
  },
  {
    name: 'Fresh Lemonade',
    price: 3.50,
    category: 'Drinks',
    quantity: 80,
    description: 'Hand-squeezed lemons with sparkling water, honey, and fresh mint.',
    imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80',
    ingredients: ['lemon', 'sparkling water', 'honey', 'mint'],
    nutrition: ['Calories: 90', 'Protein: 0g', 'Carbs: 24g'],
  },
  {
    name: 'Cold Brew Coffee',
    price: 5.00,
    category: 'Drinks',
    quantity: 40,
    description: '24-hour cold-steeped coffee. Smooth, low-acid and incredibly refreshing.',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
    ingredients: ['coffee beans', 'cold water'],
    nutrition: ['Calories: 15', 'Protein: 1g', 'Carbs: 0g'],
  },
  {
    name: 'Strawberry Milkshake',
    price: 6.00,
    category: 'Drinks',
    quantity: 35,
    description: 'Thick milkshake with fresh strawberries and a swirl of whipped cream.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    ingredients: ['milk', 'strawberries', 'ice cream', 'sugar'],
    nutrition: ['Calories: 380', 'Protein: 8g', 'Carbs: 56g'],
  },

  // ── Salads ──────────────────────────────────────────────────────────
  {
    name: 'Caesar Salad',
    price: 11.00,
    category: 'Salad',
    quantity: 30,
    description: 'Romaine lettuce, parmesan, croutons and classic Caesar dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
    ingredients: ['romaine', 'parmesan', 'croutons', 'caesar dressing'],
    nutrition: ['Calories: 310', 'Protein: 12g', 'Carbs: 20g'],
  },
  {
    name: 'Greek Salad',
    price: 10.50,
    category: 'Salad',
    quantity: 25,
    description: 'Cucumber, tomatoes, olives, feta and red onion with olive oil dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80',
    ingredients: ['cucumber', 'tomato', 'feta', 'olives', 'red onion'],
    nutrition: ['Calories: 240', 'Protein: 9g', 'Carbs: 16g'],
  },
  {
    name: 'Avocado & Quinoa Bowl',
    price: 13.50,
    category: 'Salad',
    quantity: 20,
    description: 'Protein-packed quinoa with fresh avocado, roasted chickpeas and tahini.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    ingredients: ['quinoa', 'avocado', 'chickpeas', 'tahini', 'lemon'],
    nutrition: ['Calories: 420', 'Protein: 14g', 'Carbs: 48g'],
  },

  // ── Pasta ───────────────────────────────────────────────────────────
  {
    name: 'Spaghetti Carbonara',
    price: 15.00,
    category: 'Pasta',
    quantity: 20,
    description: 'Al dente spaghetti with crispy pancetta, egg yolk and pecorino romano.',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80',
    ingredients: ['spaghetti', 'pancetta', 'egg', 'pecorino', 'black pepper'],
    nutrition: ['Calories: 580', 'Protein: 24g', 'Carbs: 68g'],
  },
  {
    name: 'Penne Arrabbiata',
    price: 13.00,
    category: 'Pasta',
    quantity: 25,
    description: 'Penne in a fiery tomato sauce with garlic and red chilli flakes.',
    imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&q=80',
    ingredients: ['penne', 'tomato', 'garlic', 'chilli', 'olive oil'],
    nutrition: ['Calories: 480', 'Protein: 16g', 'Carbs: 72g'],
  },
  {
    name: 'Fettuccine Alfredo',
    price: 14.50,
    category: 'Pasta',
    quantity: 20,
    description: 'Silky fettuccine coated in a buttery parmesan cream sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80',
    ingredients: ['fettuccine', 'butter', 'parmesan', 'cream'],
    nutrition: ['Calories: 640', 'Protein: 20g', 'Carbs: 70g'],
  },
  {
    name: 'Lasagna Bolognese',
    price: 17.00,
    category: 'Pasta',
    quantity: 15,
    description: 'Layers of pasta, slow-cooked beef ragu and béchamel. Baked golden.',
    imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=500&q=80',
    ingredients: ['pasta sheets', 'beef', 'tomato', 'bechamel', 'mozzarella'],
    nutrition: ['Calories: 720', 'Protein: 34g', 'Carbs: 62g'],
  },

  // ── Sushi ───────────────────────────────────────────────────────────
  {
    name: 'Salmon Nigiri (8 pcs)',
    price: 18.00,
    category: 'Sushi',
    quantity: 15,
    description: 'Hand-pressed sushi rice topped with fresh Atlantic salmon slices.',
    imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=500&q=80',
    ingredients: ['sushi rice', 'salmon', 'wasabi', 'soy sauce'],
    nutrition: ['Calories: 320', 'Protein: 24g', 'Carbs: 36g'],
  },
  {
    name: 'Dragon Roll (8 pcs)',
    price: 22.00,
    category: 'Sushi',
    quantity: 10,
    description: 'Prawn tempura inside, topped with avocado and unagi sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80',
    ingredients: ['prawn', 'avocado', 'rice', 'nori', 'unagi sauce'],
    nutrition: ['Calories: 420', 'Protein: 18g', 'Carbs: 52g'],
  },
  {
    name: 'Vegetable Maki (6 pcs)',
    price: 12.00,
    category: 'Sushi',
    quantity: 20,
    description: 'Cucumber, avocado and pickled radish rolled in nori and rice.',
    imageUrl: 'https://images.unsplash.com/photo-1617196034096-997b8ef2b8a5?w=500&q=80',
    ingredients: ['cucumber', 'avocado', 'radish', 'rice', 'nori'],
    nutrition: ['Calories: 220', 'Protein: 6g', 'Carbs: 40g'],
  },

  // ── Ice Cream & Sweets ──────────────────────────────────────────────
  {
    name: 'Gulab Jamun (6 pcs)',
    price: 5.50,
    category: 'Sweets',
    quantity: 50,
    description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
    ingredients: ['milk solids', 'sugar syrup', 'cardamom', 'rose water'],
    nutrition: ['Calories: 310', 'Protein: 5g', 'Carbs: 56g'],
  },
  {
    name: 'Chocolate Ice Cream',
    price: 5.00,
    category: 'Sweets',
    quantity: 60,
    description: 'Rich double-chocolate ice cream made with Belgian cocoa.',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80',
    ingredients: ['cream', 'Belgian cocoa', 'sugar', 'egg yolk'],
    nutrition: ['Calories: 270', 'Protein: 5g', 'Carbs: 32g'],
  },
  {
    name: 'Mango Sorbet',
    price: 4.50,
    category: 'Sweets',
    quantity: 45,
    description: 'Dairy-free mango sorbet made with 100% Alphonso mango pulp.',
    imageUrl: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&q=80',
    ingredients: ['mango pulp', 'sugar', 'lime juice'],
    nutrition: ['Calories: 180', 'Protein: 1g', 'Carbs: 44g'],
  },
  {
    name: 'Jalebi',
    price: 4.00,
    category: 'Sweets',
    quantity: 55,
    description: 'Crispy spiral sweets made from fermented batter, soaked in sugar syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
    ingredients: ['maida', 'sugar syrup', 'saffron'],
    nutrition: ['Calories: 290', 'Protein: 3g', 'Carbs: 60g'],
  },
  {
    name: 'Rasgulla (4 pcs)',
    price: 5.00,
    category: 'Sweets',
    quantity: 45,
    description: 'Spongy cottage cheese balls cooked in light sugar syrup. Soft and sweet.',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b975?w=500&q=80',
    ingredients: ['chenna', 'sugar', 'cardamom'],
    nutrition: ['Calories: 240', 'Protein: 8g', 'Carbs: 44g'],
  },

  // ── Sandwiches & Wraps ──────────────────────────────────────────────
  {
    name: 'Grilled Chicken Wrap',
    price: 10.00,
    category: 'Sandwich',
    quantity: 35,
    description: 'Seasoned grilled chicken, lettuce, tomato and chipotle mayo in a flour tortilla.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    ingredients: ['chicken', 'tortilla', 'lettuce', 'tomato', 'chipotle mayo'],
    nutrition: ['Calories: 420', 'Protein: 32g', 'Carbs: 38g'],
  },
  {
    name: 'Club Sandwich',
    price: 11.50,
    category: 'Sandwich',
    quantity: 30,
    description: 'Triple-decker with turkey, bacon, egg, lettuce and tomato.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80',
    ingredients: ['turkey', 'bacon', 'egg', 'lettuce', 'tomato', 'bread'],
    nutrition: ['Calories: 540', 'Protein: 36g', 'Carbs: 44g'],
  },
  {
    name: 'Paneer Kathi Roll',
    price: 9.00,
    category: 'Sandwich',
    quantity: 30,
    description: 'Spiced paneer with onions and green chutney wrapped in a paratha.',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=500&q=80',
    ingredients: ['paneer', 'paratha', 'onion', 'chutney', 'spices'],
    nutrition: ['Calories: 390', 'Protein: 18g', 'Carbs: 48g'],
  },
];

async function seedMore() {
  console.log(`\n🌱 Adding ${newProducts.length} new products...\n`);
  let added = 0;
  for (const p of newProducts) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${p.name}`);
      continue;
    }
    await prisma.product.create({ data: p });
    console.log(`  ✅ Added: ${p.name}`);
    added++;
  }
  console.log(`\n🎉 Done! Added ${added} new products.\n`);
  await prisma.$disconnect();
}

seedMore().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

