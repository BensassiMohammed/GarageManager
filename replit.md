# Garage Management System

## Overview
A complete full-stack web application for managing a small garage business. The application handles clients, vehicles, inventory (products and services) with price history, work orders with product discounts, invoicing with payment allocation, and expenses for a small garage business.

## Tech Stack
- **Backend**: Spring Boot 3.2 with Java 17, Maven, SQLite database
- **Frontend**: Angular 21 with TypeScript
- **Database**: SQLite (stored in `backend/garage.db`)

## Project Structure
```
workspace/
├── backend/                    # Spring Boot backend application
│   ├── src/main/java/com/garage/management/
│   │   ├── GarageManagementApplication.java
│   │   ├── config/             # CORS configuration
│   │   ├── entity/             # JPA entities (22 entities)
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── service/            # Business logic services
│   │   └── controller/         # REST controllers
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                   # Angular frontend application
│   ├── src/app/
│   │   ├── components/         # Angular components (with tabs and modals)
│   │   ├── services/           # API service
│   │   └── models/             # TypeScript interfaces
│   ├── angular.json
│   └── package.json
└── replit.md                   # This file
```

## Running the Application
- **Backend**: Runs on port 8080 (`./mvnw spring-boot:run`)
- **Frontend**: Runs on port 5000 (`npm start`) with proxy to backend

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
All endpoints are prefixed with `/api`:
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

## Recent Changes
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

- 2025-11-30: Rebuilt Work Order form to match reference design
  - Created dedicated work-order-form.component with full page layout
  - Header section: Client, Vehicle, Date, Status, Description fields
  - Services section: Table with Service, Qty, Std Price, Discount %, Final Price, Total + Add Service modal
  - Parts section: Table with Product, Qty, Std Price, Discount %, Final Price, Total + Add Product modal
  - Totals section: Services Subtotal, Services Discount, Parts Subtotal, Parts Discount Total, Grand Total
  - Notes textarea at bottom
  - Save persists work order then adds all service/product lines to backend
  - Added routes: /work-orders/new and /work-orders/:id for create/edit

- 2025-11-30: Added Price field to New Product and New Service forms
  - Price is now required when creating new products/services
  - Automatically creates initial price history entry with today's date
  - Price field only shows on create (edit uses Price History tab)

- 2025-11-30: Fixed API endpoint mismatches between frontend and backend
  - Corrected price history endpoints from `/price-history` to `/prices`
  - Fixed request format to use JSON body instead of query parameters
  - Added missing `/computed-stock` endpoint to ProductController

- 2025-11-30: Fixed Angular 21 lazy loading change detection issue
  - Added ChangeDetectorRef.detectChanges() to all list components after async data loads
  - Fixed "double-click to show data" bug caused by Angular 21 lazy loading timing
  - Added withFetch() to HttpClient configuration for better Fetch API timing
  - Updated 15+ list components with explicit change detection after API calls
  
- 2025-11-30: Enhanced with complete feature set
  - Added ProductPriceHistory and ServicePriceHistory entities for price tracking
  - Implemented StockService for computing stock from movements
  - Added WorkOrderService with invoice generation from work orders
  - Implemented PaymentService with auto-allocation to invoices
  - Added DashboardService for KPI aggregation
  - Enhanced Product/Service forms with tabs for Details, Price History, and Stock Info
  - Work Order UI with discount columns, subtotals, and invoice generation
  - Invoice UI with remaining balance tracking and status management
  - Payment UI with Record Payment modal and allocation to invoices
  - Expense UI with category and date filters
  - Supplier Order UI with Receive functionality for stock updates
  - Dashboard with KPIs and quick navigation

## Recommended Next Steps
1. Add unit/integration tests for PaymentService.applyPayment and WorkOrderService.generateInvoice
2. Execute end-to-end UI smoke tests for price changes, work order invoicing, and payment allocation
3. Monitor expense filtering performance for large datasets
4. Add reports and analytics features
