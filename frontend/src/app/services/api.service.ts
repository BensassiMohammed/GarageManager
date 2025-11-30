import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Company, Client, Vehicle, Supplier, Category, 
  Product, ServiceItem, ExpenseCategory, Expense,
  SupplierOrder, WorkOrder, Invoice, Payment, StockMovement 
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/companies/${id}`);
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/companies`, company);
  }

  updateCompany(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/companies/${id}`, company);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/companies/${id}`);
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client);
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles`);
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/vehicles/${id}`);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  updateVehicle(id: number, vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.baseUrl}/vehicles/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`);
  }

  getSupplier(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/suppliers/${id}`);
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/suppliers`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/suppliers/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.baseUrl}/services`);
  }

  getService(id: number): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${this.baseUrl}/services/${id}`);
  }

  createService(service: ServiceItem): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${this.baseUrl}/services`, service);
  }

  updateService(id: number, service: ServiceItem): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${this.baseUrl}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`);
  }

  getExpenseCategories(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.baseUrl}/expense-categories`);
  }

  getExpenseCategory(id: number): Observable<ExpenseCategory> {
    return this.http.get<ExpenseCategory>(`${this.baseUrl}/expense-categories/${id}`);
  }

  createExpenseCategory(category: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(`${this.baseUrl}/expense-categories`, category);
  }

  updateExpenseCategory(id: number, category: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.put<ExpenseCategory>(`${this.baseUrl}/expense-categories/${id}`, category);
  }

  deleteExpenseCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expense-categories/${id}`);
  }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.baseUrl}/expenses`);
  }

  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/expenses/${id}`);
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, expense);
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/expenses/${id}`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expenses/${id}`);
  }

  getSupplierOrders(): Observable<SupplierOrder[]> {
    return this.http.get<SupplierOrder[]>(`${this.baseUrl}/supplier-orders`);
  }

  getSupplierOrder(id: number): Observable<SupplierOrder> {
    return this.http.get<SupplierOrder>(`${this.baseUrl}/supplier-orders/${id}`);
  }

  createSupplierOrder(order: SupplierOrder): Observable<SupplierOrder> {
    return this.http.post<SupplierOrder>(`${this.baseUrl}/supplier-orders`, order);
  }

  updateSupplierOrder(id: number, order: SupplierOrder): Observable<SupplierOrder> {
    return this.http.put<SupplierOrder>(`${this.baseUrl}/supplier-orders/${id}`, order);
  }

  deleteSupplierOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/supplier-orders/${id}`);
  }

  getWorkOrders(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/work-orders`);
  }

  getWorkOrder(id: number): Observable<WorkOrder> {
    return this.http.get<WorkOrder>(`${this.baseUrl}/work-orders/${id}`);
  }

  createWorkOrder(order: WorkOrder): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(`${this.baseUrl}/work-orders`, order);
  }

  updateWorkOrder(id: number, order: WorkOrder): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.baseUrl}/work-orders/${id}`, order);
  }

  deleteWorkOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/work-orders/${id}`);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`);
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, invoice);
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${id}`, invoice);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`);
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`);
  }

  getPayment(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/${id}`);
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, payment);
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.baseUrl}/payments/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/payments/${id}`);
  }

  getStockMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.baseUrl}/stock-movements`);
  }
}
