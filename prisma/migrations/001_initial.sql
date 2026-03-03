-- Sales Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    sales_rep VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_customer_name ON sales(customer_name);
CREATE INDEX idx_sales_customer_email ON sales(customer_email);
CREATE INDEX idx_sales_product_name ON sales(product_name);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_sales_rep ON sales(sales_rep);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add check constraints
ALTER TABLE sales ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0);
ALTER TABLE sales ADD CONSTRAINT check_unit_price_positive CHECK (unit_price >= 0);
ALTER TABLE sales ADD CONSTRAINT check_total_amount_positive CHECK (total_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT check_discount_percent CHECK (discount_percent >= 0 AND discount_percent <= 100);
ALTER TABLE sales ADD CONSTRAINT check_tax_amount CHECK (tax_amount >= 0);
ALTER TABLE sales ADD CONSTRAINT check_status CHECK (status IN ('completed', 'pending', 'cancelled', 'refunded'));