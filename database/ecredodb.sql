<--- Customers Table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

<-- Products TABLE
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    category VARCHAR(50), -- e.g. phone, laptop, accessory
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

<-- Orders TABLE
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, lay-by, cancelled
    total_amount NUMERIC(12,2) NOT NULL
);

<-- Order items
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    price NUMERIC(12,2) NOT NULL
);

<-- CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    amount NUMERIC(12,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(20) -- cash, mobile money, bank transfer
);

<-- Lay-By Plans
CREATE TABLE layby_plans (
    layby_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    deposit NUMERIC(12,2) NOT NULL,
    installment_amount NUMERIC(12,2) NOT NULL,
    installment_frequency VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly
    total_installments INT NOT NULL,
    installments_paid INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' -- active, completed, cancelled
);

<-- Lay-By Payments
CREATE TABLE layby_payments (
    layby_payment_id SERIAL PRIMARY KEY,
    layby_id INT REFERENCES layby_plans(layby_id),
    amount NUMERIC(12,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
