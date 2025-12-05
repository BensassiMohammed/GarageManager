-- =============================================================================
-- Garage Management System - SQLite Schema
-- Generated from JPA/Hibernate entities
-- Database: SQLite with Hibernate Community Dialect
-- =============================================================================

-- -----------------------------------------------------------------------------
-- AUTHENTICATION & AUTHORIZATION TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS module_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_modules (
    role_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, module_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (module_id) REFERENCES module_permissions(id)
);

CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT 1,
    must_change_password BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES app_users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- -----------------------------------------------------------------------------
-- CUSTOMER MANAGEMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    ice VARCHAR(255),
    city VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    notes TEXT,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    email VARCHAR(255),
    city VARCHAR(255),
    address VARCHAR(255),
    company_id INTEGER,
    notes TEXT,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    FOREIGN KEY (current_owner_id) REFERENCES clients(id)
);

-- -----------------------------------------------------------------------------
-- INVENTORY MANAGEMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    parent_category_id INTEGER,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER,
    selling_price DECIMAL(10, 2),
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    estimated_delivery_time INTEGER,
    working_days VARCHAR(255),
    notes TEXT,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- PRICE HISTORY TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS product_buying_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS service_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- -----------------------------------------------------------------------------
-- STOCK MANAGEMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    quantity_delta INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    source_type VARCHAR(255),
    source_id INTEGER,
    created_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------------------------------------
-- SUPPLIER ORDER TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS supplier_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS supplier_order_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------------------------------------
-- WORK ORDER TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    description VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS work_order_service_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS work_order_product_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    standard_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------------------------------------
-- INVOICE TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    company_id INTEGER,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    remaining_balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    service_id INTEGER,
    description VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    standard_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    final_unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- -----------------------------------------------------------------------------
-- PAYMENT TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payer_type VARCHAR(50) NOT NULL,
    payer_id INTEGER NOT NULL,
    date DATE NOT NULL,
    method VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    invoice_id INTEGER NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- -----------------------------------------------------------------------------
-- EXPENSE TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    expense_category_id INTEGER,
    label VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id)
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(current_owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_product ON product_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_buying_price_history_product ON product_buying_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_service_price_history_service ON service_price_history(service_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_lines_order ON supplier_order_lines(supplier_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_lines_product ON supplier_order_lines(product_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_client ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_order_service_lines_order ON work_order_service_lines(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_product_lines_order ON work_order_product_lines(work_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_type, payer_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_invoice ON payment_allocations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- =============================================================================
-- ENUM VALUE REFERENCE (stored as VARCHAR in SQLite)
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
