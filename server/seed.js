const prisma = require('./config/prisma');

const products = [
  { name: 'Classic Cheeseburger', price: 8.99, category: 'Burger', quantity: 50, description: 'Juicy beef patty with melted cheddar.', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', ingredients: ['beef', 'cheese', 'bun'] },
  { name: 'Double Bacon Burger', price: 12.50, category: 'Burger', quantity: 30, description: 'Two patties and crispy bacon.', imageUrl: 'https://images.unsplash.com/photo-1594212202615-b50f78cc6342?w=500&q=80', ingredients: ['beef', 'bacon', 'cheese'] },
  { name: 'Spicy Chicken Sandwich', price: 9.99, category: 'Burger', quantity: 40, description: 'Crispy chicken with spicy mayo.', imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80', ingredients: ['chicken', 'spices', 'bun'] },
  { name: 'Margherita Pizza', price: 14.00, category: 'Pizza', quantity: 20, description: 'Classic tomato and fresh basil.', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', ingredients: ['dough', 'tomato', 'basil', 'mozzarella'] },
  { name: 'Pepperoni Feast', price: 16.50, category: 'Pizza', quantity: 25, description: 'Loaded with spicy pepperoni.', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', ingredients: ['dough', 'pepperoni', 'cheese'] },
  { name: 'Vegetarian Supreme', price: 15.00, category: 'Pizza', quantity: 15, description: 'Bell peppers, onions, and mushrooms.', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', ingredients: ['dough', 'peppers', 'mushrooms', 'cheese'] },
  { name: 'Grilled Salmon', price: 22.00, category: 'Sea Food', quantity: 10, description: 'Fresh salmon with lemon butter.', imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500&q=80', ingredients: ['salmon', 'lemon', 'butter'] },
  { name: 'Shrimp Scampi', price: 19.50, category: 'Sea Food', quantity: 15, description: 'Garlic butter shrimp over pasta.', imageUrl: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=500&q=80', ingredients: ['shrimp', 'garlic', 'pasta', 'butter'] },
  { name: 'Fish and Chips', price: 16.00, category: 'Sea Food', quantity: 20, description: 'Crispy battered fish with fries.', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80', ingredients: ['cod', 'potatoes', 'batter'] },
  { name: 'Ribeye Steak', price: 35.00, category: 'Steak', quantity: 8, description: '12oz prime ribeye cooked to perfection.', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80', ingredients: ['beef', 'salt', 'pepper'] },
  { name: 'Filet Mignon', price: 40.00, category: 'Steak', quantity: 5, description: 'Tender 8oz filet with red wine reduction.', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80', ingredients: ['beef', 'wine', 'butter'] },
  { name: 'New York Strip', price: 32.00, category: 'Steak', quantity: 10, description: 'Classic cut with great marbling.', imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=500&q=80', ingredients: ['beef', 'seasoning'] },
  { name: 'Chocolate Lava Cake', price: 8.50, category: 'Dessert', quantity: 30, description: 'Warm cake with a gooey center.', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80', ingredients: ['chocolate', 'flour', 'sugar'] },
  { name: 'New York Cheesecake', price: 7.50, category: 'Dessert', quantity: 20, description: 'Rich and creamy with graham crust.', imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80', ingredients: ['cream cheese', 'sugar', 'graham crackers'] },
  { name: 'Tiramisu', price: 9.00, category: 'Dessert', quantity: 15, description: 'Coffee flavored Italian dessert.', imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80', ingredients: ['coffee', 'mascarpone', 'cocoa'] },
  { name: 'Veggie Burger', price: 10.50, category: 'Burger', quantity: 25, description: 'Plant-based patty with avocado.', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80', ingredients: ['black beans', 'avocado', 'bun'] },
  { name: 'BBQ Bacon Burger', price: 13.00, category: 'Burger', quantity: 20, description: 'Smoky BBQ sauce and onion rings.', imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80', ingredients: ['beef', 'bacon', 'bbq sauce'] },
  { name: 'Hawaiian Pizza', price: 15.50, category: 'Pizza', quantity: 20, description: 'Ham and pineapple.', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', ingredients: ['dough', 'ham', 'pineapple', 'cheese'] },
  { name: 'Lobster Tail', price: 45.00, category: 'Sea Food', quantity: 5, description: 'Broiled lobster tail with butter.', imageUrl: 'https://images.unsplash.com/photo-1553659971-f01207815844?w=500&q=80', ingredients: ['lobster', 'butter'] },
  { name: 'Apple Pie', price: 6.50, category: 'Dessert', quantity: 25, description: 'Traditional pie with cinnamon.', imageUrl: 'https://images.unsplash.com/photo-1562007908-17c67e878c88?w=500&q=80', ingredients: ['apples', 'cinnamon', 'flour'] }
];

async function seed() {
  console.log('Seeding products...');
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log('Done!');
}
seed();
