# Garage Management System

## Overview
A full-stack web application designed to manage small garage businesses. It encompasses client and vehicle management, inventory (products and services with price history), work orders with discounting, invoicing with payment allocation, and expense tracking. The system includes JWT-based authentication with role-based access control.

## User Preferences
I prefer iterative development with clear, concise explanations for each step. Please ask for my approval before making any major architectural changes or implementing complex features. I value well-structured and readable code. I want to be informed about the implications of any changes made, especially concerning data models or API contracts.

## System Architecture

### UI/UX Decisions
The frontend is built with Angular 21 and TypeScript, featuring a tabbed interface and modals for enhanced user interaction. It supports multi-language interfaces (English, French, Arabic) with full RTL (right-to-left) layout support for Arabic, implemented using ngx-translate.

### Technical Implementations
- **Backend**: Spring Boot 3.2, Java 17, Maven. Uses PostgreSQL as the database with Flyway for schema migrations, and Spring Security with JWT for authentication.
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
- **PostgreSQL**: Relational database for data persistence (configured via environment variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`).
- **Flyway**: Database migration tool for schema versioning (migrations in `backend/src/main/resources/db/migration/`).
- **Angular**: Frontend framework.
- **TypeScript**: Superset of JavaScript for frontend development.
- **ngx-translate v17**: Angular library for internationalization.
- **Docker**: Multi-environment containerization for VPS deployment.
- **Nginx**: Production frontend server with API proxy.

## Database Configuration
The application connects to PostgreSQL using environment variables:
- `PGHOST` - Database host
- `PGPORT` - Database port  
- `PGDATABASE` - Database name
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

Schema migrations are managed by Flyway with `spring.jpa.hibernate.ddl-auto=none` to prevent Hibernate auto-DDL. Migration files should be placed in `backend/src/main/resources/db/migration/` following the naming convention `V{version}__{description}.sql`.

## Docker Deployment Configuration

### Environments
Three Docker environments are configured for deployment:

| Environment | Compose File | Frontend Port | Backend Port | Database |
|-------------|--------------|---------------|--------------|----------|
| Development | `backend/docker/dev/docker-compose-dev.yml` | 8050 | 8090 | Internal |
| Staging | `backend/docker/staging/docker-compose-staging.yml` | 8051 | Internal | Internal |
| Production | `backend/docker/prod/docker-compose.yml` | 8050 | Internal | Internal |

### Network Isolation
- `garage-backend`: Internal network for postgres-backend communication (isolated from external access)
- `garage-frontend`: Network for frontend-backend communication

### Environment Variables Required
Before deploying, update the `.env.prod` or `.env.staging` files with:
- `POSTGRES_PASSWORD`: Strong database password
- `JWT_SECRET`: Secure 256-bit (32+ character) JWT signing key

### Deployment Commands
```bash
# Development
cd backend/docker/dev
docker-compose -f docker-compose-dev.yml up -d

# Staging
cd backend/docker/staging
docker-compose --env-file .env.staging -f docker-compose-staging.yml up -d

# Production
cd backend/docker/prod
docker-compose --env-file .env.prod -f docker-compose.yml up -d
```

### Port Configuration
All environments use port 8090 for the backend API. The frontend uses nginx to proxy `/api` requests to the backend container.

## Recent Changes (December 2025)
- Added Docker configuration for dev/staging/production environments
- Configured network isolation for container security
- Updated application properties to use environment variables (no hardcoded credentials)
- Added JWT_SECRET environment variable support
- Aligned all ports to use 8090 for backend
- Updated nginx.conf with API proxy configuration
- Fixed Angular 21 configuration for proper building
