-- =============================================================================
-- Garage Management System - PostgreSQL Schema
-- Flyway Baseline Migration V1
-- Converted from SQLite schema for PostgreSQL compatibility
-- =============================================================================

-- -----------------------------------------------------------------------------
-- AUTHENTICATION & AUTHORIZATION TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE module_permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE role_modules (
    role_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, module_id),
    CONSTRAINT fk_role_modules_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_role_modules_module FOREIGN KEY (module_id) REFERENCES module_permissions(id)
);

CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES app_users(id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- -----------------------------------------------------------------------------
-- CUSTOMER MANAGEMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ice VARCHAR(255),
    city VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    email VARCHAR(255),
    city VARCHAR(255),
    address VARCHAR(255),
    company_id INTEGER,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_clients_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(255) NOT NULL UNIQUE,
    brand VARCHAR(255),
    model VARCHAR(255),
    type VARCHAR(255),
    year INTEGER,
    mileage INTEGER,
    color VARCHAR(255),
    current_owner_id INTEGER,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_vehicles_owner FOREIGN KEY (current_owner_id) REFERENCES clients(id)
);

-- -----------------------------------------------------------------------------
-- INVENTORY MANAGEMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    parent_category_id INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_category_id) REFERENCES categories(id)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(255),
    brand VARCHAR(255),
    category_id INTEGER,
    buying_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    vehicle_compatibility VARCHAR(255),
    expiration_date DATE,
    volume VARCHAR(255),
    min_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER,
    selling_price DECIMAL(10, 2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    estimated_delivery_time INTEGER,
    working_days VARCHAR(255),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- PRICE HISTORY TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE product_price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_product_price_history_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE product_buying_price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_product_buying_price_history_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE service_price_history (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_service_price_history_service FOREIGN KEY (service_id) REFERENCES services(id)
);

-- -----------------------------------------------------------------------------
-- STOCK MANAGEMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    quantity_delta INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    source_type VARCHAR(255),
    source_id INTEGER,
    created_at TIMESTAMP,
    CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------------------------------------
-- SUPPLIER ORDER TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE supplier_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_supplier_orders_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE supplier_order_lines (
    id SERIAL PRIMARY KEY,
    supplier_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    CONSTRAINT fk_supplier_order_lines_order FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(id),
    CONSTRAINT fk_supplier_order_lines_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------------------------------------
-- WORK ORDER TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    description VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_work_orders_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_work_orders_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE work_order_service_lines (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    CONSTRAINT fk_work_order_service_lines_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_work_order_service_lines_service FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE work_order_product_lines (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    standard_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    CONSTRAINT fk_work_order_product_lines_order FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_work_order_product_lines_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------------------------------------
-- INVOICE TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER,
    company_id INTEGER,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    remaining_balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_invoices_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    service_id INTEGER,
    description VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    standard_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    CONSTRAINT fk_invoice_lines_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    CONSTRAINT fk_invoice_lines_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_invoice_lines_service FOREIGN KEY (service_id) REFERENCES services(id)
);

-- -----------------------------------------------------------------------------
-- PAYMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payer_type VARCHAR(50) NOT NULL,
    payer_id INTEGER NOT NULL,
    date DATE NOT NULL,
    method VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE payment_allocations (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL,
    invoice_id INTEGER NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_payment_allocations_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    CONSTRAINT fk_payment_allocations_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- -----------------------------------------------------------------------------
-- EXPENSE TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    expense_category_id INTEGER,
    label VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_expenses_category FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id)
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------

CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_vehicles_owner ON vehicles(current_owner_id);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_product_price_history_product ON product_price_history(product_id);
CREATE INDEX idx_product_buying_price_history_product ON product_buying_price_history(product_id);
CREATE INDEX idx_service_price_history_service ON service_price_history(service_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(date);
CREATE INDEX idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX idx_supplier_order_lines_order ON supplier_order_lines(supplier_order_id);
CREATE INDEX idx_supplier_order_lines_product ON supplier_order_lines(product_id);
CREATE INDEX idx_work_orders_client ON work_orders(client_id);
CREATE INDEX idx_work_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_order_service_lines_order ON work_order_service_lines(work_order_id);
CREATE INDEX idx_work_order_product_lines_order ON work_order_product_lines(work_order_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX idx_payments_payer ON payments(payer_type, payer_id);
CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice ON payment_allocations(invoice_id);
CREATE INDEX idx_expenses_category ON expenses(expense_category_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- =============================================================================
-- ENUM VALUE REFERENCE (stored as VARCHAR in PostgreSQL)
-- =============================================================================
-- CategoryType: PRODUCT, SERVICE
-- InvoiceStatus: DRAFT, ISSUED, SENT, PAID, PARTIAL, CANCELLED
-- OrderStatus: PENDING, ORDERED, RECEIVED, CANCELLED
-- PayerType: CLIENT, COMPANY
-- PaymentMethod: CASH, CARD, BANK_TRANSFER, CHECK, OTHER
-- StockMovementType: PURCHASE, ADJUSTMENT, CONSUMPTION
-- VehicleStatus: ACTIVE, IN_SERVICE, SOLD, SCRAPPED
-- WorkOrderStatus: DRAFT, OPEN, IN_PROGRESS, COMPLETED, INVOICED, CANCELLED
-- =============================================================================
