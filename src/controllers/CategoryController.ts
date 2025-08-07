import { Request, Response } from 'express';
import CategoryService, {
  CreateCategoryData,
  UpdateCategoryData,
} from '../services/CategoryService.js';

class CategoryController {
  /**
   * Get all categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }

      const category = await CategoryService.getCategoryById(id);
      res.json(category);
    } catch (error) {
      console.error('❌ Error fetching category:', error);
      if (error instanceof Error && error.message === 'Category not found') {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  /**
   * Create a new category
   */
  async createCategory(req: Request, res: Response) {
    try {
      const categoryData: CreateCategoryData = req.body;

      if (!categoryData.name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const category = await CategoryService.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('❌ Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  /**
   * Update a category
   */
  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateCategoryData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }

      const category = await CategoryService.updateCategory(id, updateData);
      res.json(category);
    } catch (error) {
      console.error('❌ Error updating category:', error);
      if (error instanceof Error && error.message === 'Category not found') {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }

      const result = await CategoryService.deleteCategory(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          return res.status(404).json({ error: 'Category not found' });
        }
        if (error.message.includes('Cannot delete category')) {
          return res.status(400).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy(req: Request, res: Response) {
    try {
      const hierarchy = await CategoryService.getCategoryHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error('❌ Error fetching category hierarchy:', error);
      res.status(500).json({ error: 'Failed to fetch category hierarchy' });
    }
  }
}

export default new CategoryController();
