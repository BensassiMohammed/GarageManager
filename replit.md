# Garage Management System

## Overview
A full-stack web application designed to manage small garage businesses. It encompasses client and vehicle management, inventory (products and services with price history), work orders with discounting, invoicing with payment allocation, and expense tracking. The system includes JWT-based authentication with role-based access control.

## User Preferences
I prefer iterative development with clear, concise explanations for each step. Please ask for my approval before making any major architectural changes or implementing complex features. I value well-structured and readable code. I want to be informed about the implications of any changes made, especially concerning data models or API contracts.

## System Architecture

### UI/UX Decisions
The frontend is built with Angular 21 and TypeScript, featuring a tabbed interface and modals for enhanced user interaction. It supports multi-language interfaces (English, French, Arabic) with full RTL (right-to-left) layout support for Arabic, implemented using ngx-translate.

### Technical Implementations
- **Backend**: Spring Boot 3.2, Java 17, Maven. Uses SQLite as the database and Spring Security with JWT for authentication.
- **Frontend**: Angular 21, TypeScript. Includes services for API interaction, authentication guards, and HTTP interceptors for JWT handling.
- **Authentication**: JWT tokens with a 15-minute expiration and sliding renewal. Supports role-based access control (ADMIN, MANAGER, STAFF) with default admin credentials (`admin`/`123456`) requiring a password change on first login.
- **Module Permissions**: Granular permissions for `dashboard`, `customers`, `inventory`, `operations`, `finance`, and `users`.
- **Internationalization**: Implemented using ngx-translate v17. Translation files (`en.json`, `fr.json`, `ar.json`) are located in `frontend/src/assets/i18n/`. A `LanguageService` manages language selection, persistence, and RTL handling.
- **Currency**: Configured to use Moroccan Dirham (MAD) as the default currency throughout the application.

### Feature Specifications
- **Customers**: Manage companies (with ICE, city, address), clients (individual, linked to companies, with city and address), and vehicles (with owner, status, mileage, and color).
- **Inventory**: Manage categories (hierarchical), products (stock tracking, pricing, price history, barcode, brand, buying price, vehicle compatibility, expiration date, volume), services (pricing, price history), and suppliers (with city, address, estimated delivery time, working days).
- **Operations**: Comprehensive work order management (service/product lines, discounts, invoice generation), supplier orders (with stock update on receipt), and stock management (overview, movement history, adjustments).
- **Finance**: Invoicing (generated from work orders, tracking balance, various statuses), payment recording (manual or auto-allocation), expense categories, and expense tracking.
- **Dashboard**: Displays key performance indicators (KPIs) like open work orders, outstanding balance, low stock products, monthly expenses, quick stats, and recent activity.

### System Design Choices
- **Layered Architecture**: Clear separation between controllers, services, repositories, and entities in the backend.
- **Data Transfer Objects (DTOs)**: Used for efficient data exchange between frontend and backend.
- **Price History**: Dual price history tracking for products with separate entities (`ProductPriceHistory` for selling prices, `ProductBuyingPriceHistory` for buying prices). Services have `ServicePriceHistory` for selling price tracking. The product form includes a tabbed interface to view and manage both selling and buying price histories independently.
- **Stock Management**: `StockMovementService` ensures atomic updates to product stock.
- **Payment Allocation**: `PaymentService` includes logic for auto-allocating payments to outstanding invoices.

## External Dependencies
- **Spring Boot**: For building the backend API.
- **Spring Security**: For authentication and authorization.
- **JSON Web Tokens (JWT)**: For secure API authentication.
- **Maven**: Project build automation tool for Java.
- **SQLite**: Embedded database for data persistence (`backend/garage.db`).
- **Angular**: Frontend framework.
- **TypeScript**: Superset of JavaScript for frontend development.
- **ngx-translate v17**: Angular library for internationalization.