import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
    },
  });

  const smartphones = await prisma.category.upsert({
    where: { name: 'Smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: {
      name: 'Laptops',
      description: 'Portable computers',
      parentId: electronics.id,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      description: 'Apparel and fashion items',
    },
  });

  const books = await prisma.category.upsert({
    where: { name: 'Books' },
    update: {},
    create: {
      name: 'Books',
      description: 'Books and educational materials',
    },
  });

  console.log('📁 Categories created');

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with Pro features',
      price: 999.99,
      categoryId: smartphones.id,
      inventoryCount: 50,
      sku: 'IPHONE15PRO',
      tags: ['apple', 'smartphone', 'ios'],
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Flagship Android smartphone',
      price: 899.99,
      categoryId: smartphones.id,
      inventoryCount: 30,
      sku: 'GALAXYS24',
      tags: ['samsung', 'android', 'smartphone'],
    },
    {
      name: 'MacBook Pro 16"',
      description: 'Professional laptop for creative work',
      price: 2499.99,
      categoryId: laptops.id,
      inventoryCount: 15,
      sku: 'MBP16',
      tags: ['apple', 'macbook', 'laptop'],
    },
    {
      name: 'Dell XPS 13',
      description: 'Ultra-portable Windows laptop',
      price: 1299.99,
      categoryId: laptops.id,
      inventoryCount: 25,
      sku: 'DELLXPS13',
      tags: ['dell', 'windows', 'ultrabook'],
    },
    {
      name: 'Classic T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 19.99,
      categoryId: clothing.id,
      inventoryCount: 100,
      sku: 'TSHIRT001',
      tags: ['clothing', 'cotton', 'casual'],
    },
    {
      name: 'JavaScript: The Good Parts',
      description: 'Essential JavaScript programming book',
      price: 29.99,
      categoryId: books.id,
      inventoryCount: 40,
      sku: 'JSBOOK001',
      tags: ['programming', 'javascript', 'education'],
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });
  }

  console.log('📦 Products created');

  // Create some sample analytics data
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const allProducts = await prisma.product.findMany();

  for (const product of allProducts) {
    // Create analytics for yesterday
    await prisma.productAnalytics.upsert({
      where: {
        productId_date: {
          productId: product.id,
          date: yesterday,
        },
      },
      update: {},
      create: {
        productId: product.id,
        date: yesterday,
        views: Math.floor(Math.random() * 100) + 10,
        uniqueViews: Math.floor(Math.random() * 50) + 5,
        searches: Math.floor(Math.random() * 20) + 1,
        addToCarts: Math.floor(Math.random() * 10) + 1,
        purchases: Math.floor(Math.random() * 5) + 1,
        revenue: parseFloat((Math.random() * 1000).toFixed(2)),
        conversionRate: parseFloat((Math.random() * 0.1).toFixed(4)),
      },
    });

    // Create analytics for today
    await prisma.productAnalytics.upsert({
      where: {
        productId_date: {
          productId: product.id,
          date: today,
        },
      },
      update: {},
      create: {
        productId: product.id,
        date: today,
        views: Math.floor(Math.random() * 50) + 5,
        uniqueViews: Math.floor(Math.random() * 25) + 3,
        searches: Math.floor(Math.random() * 10) + 1,
        addToCarts: Math.floor(Math.random() * 5) + 1,
        purchases: Math.floor(Math.random() * 3) + 1,
        revenue: parseFloat((Math.random() * 500).toFixed(2)),
        conversionRate: parseFloat((Math.random() * 0.08).toFixed(4)),
      },
    });
  }

  console.log('📊 Analytics data created');

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
