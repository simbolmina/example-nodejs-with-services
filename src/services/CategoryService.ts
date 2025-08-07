import { PrismaClient } from '@prisma/client';

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string;
}

const prisma = new PrismaClient();

/**
 * Get all categories
 */
export const getCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
    },
    orderBy: { name: 'asc' },
  });

  return categories;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

/**
 * Create a new category
 */
export const createCategory = async (data: CreateCategoryData) => {
  const category = await prisma.category.create({
    data,
    include: {
      parent: true,
      children: true,
    },
  });

  return category;
};

/**
 * Update a category
 */
export const updateCategory = async (id: string, data: UpdateCategoryData) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data,
    include: {
      parent: true,
      children: true,
    },
  });

  return updatedCategory;
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      products: true,
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Check if category has children
  if (category.children.length > 0) {
    throw new Error('Cannot delete category with subcategories');
  }

  // Check if category has products
  if (category.products.length > 0) {
    throw new Error('Cannot delete category with products');
  }

  await prisma.category.delete({
    where: { id },
  });

  return { message: 'Category deleted successfully' };
};

/**
 * Get category hierarchy
 */
export const getCategoryHierarchy = async () => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories;
};
