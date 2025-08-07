import { Request, Response } from 'express';
import {
  getCategories as getCategoriesService,
  getCategoryById as getCategoryByIdService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  getCategoryHierarchy as getCategoryHierarchyService,
  CreateCategoryData,
  UpdateCategoryData,
} from '../services/CategoryService.js';

/**
 * Get all categories
 */
export const getCategories = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const categories = await getCategoriesService();
    return res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const category = await getCategoryByIdService(id);
    return res.json(category);
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    if (error instanceof Error && error.message === 'Category not found') {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const categoryData: CreateCategoryData = req.body;

    if (!categoryData.name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await createCategoryService(categoryData);
    return res.status(201).json(category);
  } catch (error) {
    console.error('❌ Error creating category:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData: UpdateCategoryData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const category = await updateCategoryService(id, updateData);
    return res.json(category);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    if (error instanceof Error && error.message === 'Category not found') {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(500).json({ error: 'Failed to update category' });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const result = await deleteCategoryService(id);
    return res.json(result);
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
    return res.status(500).json({ error: 'Failed to delete category' });
  }
};

/**
 * Get category hierarchy
 */
export const getCategoryHierarchy = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const hierarchy = await getCategoryHierarchyService();
    return res.json(hierarchy);
  } catch (error) {
    console.error('❌ Error fetching category hierarchy:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch category hierarchy' });
  }
};
