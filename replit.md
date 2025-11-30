# Garage Management System

## Overview
A complete full-stack web application for managing a small garage business. The application handles clients, vehicles, inventory (products and services), work orders, invoicing, payments, and expenses.

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
│   │   ├── entity/             # JPA entities (20 entities)
│   │   ├── repository/         # Spring Data JPA repositories
│   │   └── controller/         # REST controllers
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                   # Angular frontend application
│   ├── src/app/
│   │   ├── components/         # Angular components
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
- **Products**: Inventory items with stock tracking and pricing
- **Services**: Service items with pricing
- **Suppliers**: Manage supplier contacts

### Operations
- **Work Orders**: Create work orders for clients/vehicles (placeholder)
- **Supplier Orders**: Purchase orders from suppliers (placeholder)
- **Inventory**: View stock levels and movements

### Finance
- **Invoices**: Client billing (placeholder)
- **Payments**: Payment recording (placeholder)
- **Expense Categories**: Categorize business expenses
- **Expenses**: Track business expenses

## API Endpoints
All endpoints are prefixed with `/api`:
- `/api/companies` - Company management
- `/api/clients` - Client management
- `/api/vehicles` - Vehicle management
- `/api/suppliers` - Supplier management
- `/api/categories` - Category management
- `/api/products` - Product management
- `/api/services` - Service management
- `/api/expense-categories` - Expense category management
- `/api/expenses` - Expense management
- `/api/work-orders` - Work order management
- `/api/invoices` - Invoice management
- `/api/payments` - Payment management
- `/api/supplier-orders` - Supplier order management
- `/api/stock-movements` - Stock movement tracking

## Database Schema
The SQLite database contains the following main entities:
- Company, Client, Vehicle (customer domain)
- Supplier, Category, Product, ServiceEntity (inventory domain)
- WorkOrder, WorkOrderServiceLine, WorkOrderProductLine (operations)
- Invoice, InvoiceLine, Payment, PaymentAllocation (finance)
- SupplierOrder, SupplierOrderLine, StockMovement (purchasing)
- ExpenseCategory, Expense (expense tracking)

## Recent Changes
- 2025-11-30: Initial implementation with complete backend and frontend
- Full CRUD operations for core entities (Companies, Clients, Vehicles, Suppliers, Categories, Products, Services, Expense Categories, Expenses)
- Dashboard with entity statistics
- Placeholder pages for Work Orders, Invoices, Payments, and Supplier Orders

## Future Enhancements
- Complete Work Order management with service and product lines
- Full Invoice generation from work orders
- Payment allocation system
- Supplier order and stock management
- Reports and analytics dashboard
