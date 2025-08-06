import express from 'express';
import { prisma } from '../lib/prisma.js';
const router = express.Router();
// Get all categories
router.get('/', async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.json({ categories });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            error: 'Failed to fetch categories',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                products: {
                    where: { isActive: true },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ category });
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            error: 'Failed to fetch category',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Create new category
router.post('/', async (req, res) => {
    try {
        const { name, description, parentId } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        // Check if parent exists (if provided)
        if (parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                return res.status(400).json({ error: 'Parent category not found' });
            }
        }
        const category = await prisma.category.create({
            data: {
                name,
                description,
                parentId,
            },
            include: {
                parent: true,
                children: true,
            },
        });
        res.status(201).json({ category });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            error: 'Failed to create category',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, parentId } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
        const category = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(parentId !== undefined && { parentId }),
            },
            include: {
                parent: true,
                children: true,
            },
        });
        res.json({ category });
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            error: 'Failed to update category',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
        // Check if category has products
        const productsCount = await prisma.product.count({
            where: { categoryId: id, isActive: true },
        });
        if (productsCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete category with active products',
                productsCount,
            });
        }
        await prisma.category.delete({
            where: { id },
        });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            error: 'Failed to delete category',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
export default router;
//# sourceMappingURL=categories.js.map