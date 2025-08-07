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

class CategoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all categories
   */
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
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
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryData) {
    const category = await this.prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    return category;
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: UpdateCategoryData) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    return updatedCategory;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
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

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy() {
    const categories = await this.prisma.category.findMany({
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
  }
}

export default new CategoryService();
