-- Initialize E-commerce Analytics Database
-- This script runs automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas for different microservices
CREATE SCHEMA IF NOT EXISTS products;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS notifications;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA products TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA notifications TO postgres;

-- Create initial tables (we'll expand this with Prisma later)
CREATE TABLE IF NOT EXISTS products.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES products.categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES products.categories(id),
    inventory_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products.categories (name, description) VALUES 
    ('Electronics', 'Electronic devices and gadgets'),
    ('Clothing', 'Apparel and fashion items'),
    ('Books', 'Books and educational materials')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products.products(created_at);

-- Create a simple view for product analytics
CREATE OR REPLACE VIEW analytics.product_overview AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.inventory_count,
    c.name as category_name,
    p.created_at
FROM products.products p
LEFT JOIN products.categories c ON p.category_id = c.id
WHERE p.is_active = true;