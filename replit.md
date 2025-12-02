# Garage Management System

## Overview
A complete full-stack web application for managing a small garage business. The application handles clients, vehicles, inventory (products and services) with price history, work orders with product discounts, invoicing with payment allocation, and expenses. Now includes JWT-based authentication with role-based access control.

## Tech Stack
- **Backend**: Spring Boot 3.2 with Java 17, Maven, SQLite database, Spring Security + JWT
- **Frontend**: Angular 21 with TypeScript
- **Database**: SQLite (stored in `backend/garage.db`)
- **Authentication**: JWT tokens with 15-minute expiration, sliding renewal

## Project Structure
```
workspace/
├── backend/                    # Spring Boot backend application
│   ├── src/main/java/com/garage/management/
│   │   ├── GarageManagementApplication.java
│   │   ├── config/             # CORS, Security, DataInitializer
│   │   ├── entity/             # JPA entities (25+ entities incl. auth)
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── service/            # Business logic services
│   │   ├── security/           # JWT utilities, filters, user details
│   │   ├── dto/                # Data transfer objects
│   │   └── controller/         # REST controllers
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                   # Angular frontend application
│   ├── src/app/
│   │   ├── components/         # Angular components (with tabs and modals)
│   │   │   ├── auth/           # Login, change-password components
│   │   │   └── users/          # User management (admin-only)
│   │   ├── services/           # API and Auth services
│   │   ├── guards/             # Route guards (auth, admin, module)
│   │   ├── interceptors/       # HTTP interceptor for JWT
│   │   └── models/             # TypeScript interfaces
│   ├── angular.json
│   └── package.json
└── replit.md                   # This file
```

## Running the Application
- **Backend**: Runs on port 8080 (`./mvnw spring-boot:run`)
- **Frontend**: Runs on port 5000 (`npm start`) with proxy to backend

## Authentication System

### Default Credentials
- **Username**: admin
- **Password**: 123456
- **Note**: Must change password on first login

### Roles
- **ADMIN**: Full access to all modules including user management
- **MANAGER**: Access to dashboard, customers, inventory, operations, finance
- **STAFF**: Access to dashboard, customers, operations

### Module Permissions
- **dashboard**: Main dashboard with KPIs
- **customers**: Companies, clients, vehicles
- **inventory**: Products, services, categories, suppliers
- **operations**: Work orders, supplier orders, stock management
- **finance**: Invoices, payments, expenses
- **users**: User administration (admin-only)

### Authentication Flow
1. User logs in at `/login` with username/password
2. Backend validates credentials and returns JWT token
3. Frontend stores token and attaches it to all API requests
4. If `mustChangePassword=true`, user is redirected to `/change-password`
5. Token auto-renews when less than 5 minutes remaining

## Features

### Customers
- **Companies**: Manage company accounts with contact details
- **Clients**: Manage individual clients, optionally linked to companies
- **Vehicles**: Track vehicles with owner associations and status

### Inventory
- **Categories**: Product and service categories with hierarchy support
- **Products**: Inventory items with stock tracking, pricing, and price history
- **Services**: Service items with pricing and price history
- **Suppliers**: Manage supplier contacts

### Operations
- **Work Orders**: Full work order management with service/product lines, discounts, and invoice generation
- **Supplier Orders**: Purchase orders from suppliers with RECEIVED status to update stock
- **Stock Management**: Tabbed interface with Stock Overview, Movements History, and New Adjustment tabs
  - Stock Overview: View all products with current stock, min stock, and low stock warnings
  - Movements History: View all stock movements sorted by date with type badges
  - New Adjustment: Record stock adjustments with product, movement type, quantity change, reason, and notes

### Finance
- **Invoices**: Generated from work orders with remaining balance tracking and status management (DRAFT, ISSUED, PAID, PARTIALLY_PAID, CANCELLED)
- **Payments**: Payment recording with manual or auto-allocation to oldest unpaid invoices
- **Expense Categories**: Categorize business expenses
- **Expenses**: Track business expenses with date and category filtering

### Dashboard
- **KPIs**: Open Work Orders count, Outstanding Balance total, Low Stock Products count, Monthly Expenses total
- **Quick Stats**: Companies, Clients, Vehicles, Products, Services, Suppliers counts
- **Recent Activity**: Recent Open Work Orders and Unpaid Invoices with quick navigation

## API Endpoints

### Authentication Endpoints (Public)
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)

### Admin-Only Endpoints
- `/api/users` - User CRUD operations
- `/api/roles` - List available roles

### Protected Endpoints (require authentication)
- `/api/companies` - Company management
- `/api/clients` - Client management
- `/api/vehicles` - Vehicle management
- `/api/suppliers` - Supplier management
- `/api/categories` - Category management
- `/api/products` - Product management with price history (`/api/products/{id}/prices`) and computed stock (`/api/products/{id}/computed-stock`)
- `/api/services` - Service management with price history (`/api/services/{id}/prices`)
- `/api/expense-categories` - Expense category management
- `/api/expenses` - Expense management with filtering
- `/api/work-orders` - Work order management with invoice generation (`POST /{id}/generate-invoice`)
- `/api/invoices` - Invoice management with status updates
- `/api/payments` - Payment management with auto-allocation (`POST /apply`)
- `/api/supplier-orders` - Supplier order management with receive functionality (`POST /{id}/receive`)
- `/api/stock-movements` - Stock movement tracking
- `/api/dashboard/stats` - Dashboard KPI statistics

## Database Schema
The SQLite database contains the following main entities:
- AppUser, Role, ModulePermission (authentication)
- Company, Client, Vehicle (customer domain)
- Supplier, Category, Product, ServiceEntity, ProductPriceHistory, ServicePriceHistory (inventory domain)
- WorkOrder, WorkOrderServiceLine, WorkOrderProductLine (operations)
- Invoice, InvoiceLine, Payment, PaymentAllocation (finance)
- SupplierOrder, SupplierOrderLine, StockMovement (purchasing)
- ExpenseCategory, Expense (expense tracking)

## Services
Backend service layer implementing complex business logic:
- **ProductPriceService**: Manage product price history with effective date tracking
- **ServicePriceService**: Manage service price history with effective date tracking
- **StockService**: Compute current stock from movements, identify low stock products
- **StockMovementService**: Create and delete stock movements with atomic product stock updates
- **WorkOrderService**: Generate invoices from completed work orders
- **PaymentService**: Apply payments with auto-allocation to oldest unpaid invoices
- **DashboardService**: Aggregate KPIs (open orders, outstanding balance, low stock, monthly expenses)
- **CustomUserDetailsService**: Load user details for Spring Security authentication

## Internationalization (i18n)
The application supports multi-language interfaces with the following languages:
- **English (en)**: Default language, LTR layout
- **French (fr)**: Full translation, LTR layout
- **Arabic (ar)**: Full translation with RTL (right-to-left) layout support

### i18n Implementation
- **Library**: ngx-translate v17 with standalone Angular configuration
- **Translation Files**: Located in `frontend/src/assets/i18n/` (en.json, fr.json, ar.json)
- **LanguageService**: Manages language selection, localStorage persistence, and RTL handling
- **Language Switcher**: Dropdown in the header for switching languages on the fly
- **RTL Support**: Arabic language triggers RTL layout via document dir attribute and CSS overrides

### Adding New Translations
1. Add new keys to all three translation files (en.json, fr.json, ar.json)
2. Use the translate pipe in templates: `{{ 'KEY.PATH' | translate }}`
3. For RTL components, use `[dir="rtl"]` CSS selectors for layout adjustments

## Recent Changes
- 2025-11-30: Added complete multi-language support (i18n) with English, French, and Arabic
  - Installed ngx-translate v17 with provideTranslateService API
  - Created comprehensive translation files covering all UI text
  - Built LanguageService for language switching and localStorage persistence
  - Added language switcher dropdown in header
  - Implemented RTL support for Arabic with CSS overrides
  - Converted all 24+ components to use translate pipe

- 2025-11-30: Fixed change-password form getting stuck with JSON parsing error
  - Backend change-password endpoint now returns proper JSON response instead of plain text
  - Response includes message, accessToken, and expiresInSeconds
  - Frontend properly handles response, updates token, and redirects to dashboard

- 2025-11-30: Added JWT-based authentication with role-based access control
  - Created AppUser, Role, ModulePermission entities with JPA relationships
  - Implemented JwtUtil for token generation/validation with HS384 algorithm
  - Added SecurityConfig with protected/public endpoints
  - Created auth endpoints: login, me, change-password
  - Added user management (CRUD) for admins
  - Frontend auth service with token storage, interceptor, guards
  - Login page with must-change-password flow
  - Role-based menu visibility using allowedModules
  - Default admin user created on first startup (admin/123456)

- 2025-11-30: Fixed product price not persisting after edit
  - Removed sellingPrice from ProductController.update() so it can only be modified through price history
  - Product price set via Price History now persists correctly after product edits

- 2025-11-30: Fixed product edit resetting currentStock to 0
  - Removed currentStock from ProductController.update() so it can only be modified through stock movements
  - Product view and Inventory view now show consistent stock values

- 2025-11-30: Fixed stock adjustment not updating Product.currentStock
  - Created StockMovementService with createMovement() method that atomically updates product stock
  - When stock adjustments are recorded, Product.currentStock is now correctly updated
  - Delete operations properly reverse the stock delta
  - StockMovementController now delegates to the service layer instead of direct repository calls

- 2025-11-30: Added discount support to Services in Work Orders
  - Services now have Std Price, Discount %, Final Price, and Total columns (same as Products)
  - Add Service modal includes optional Discount % field
  - Backend WorkOrderServiceLine entity extended with discountPercent and finalUnitPrice fields
  - Totals section shows Services Subtotal, Services Discount Total, Parts Subtotal, Parts Discount Total, and Grand Total

## Recommended Next Steps
1. Add unit/integration tests for authentication flows
2. Implement password reset via email
3. Add audit logging for sensitive operations
4. Add reports and analytics features
