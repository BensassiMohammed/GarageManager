export interface Company {
  id?: number;
  name: string;
  ice?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id?: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  company?: Company;
  notes?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id?: number;
  registrationNumber: string;
  brand?: string;
  model?: string;
  type?: string;
  year?: number;
  mileage?: number;
  color?: string;
  currentOwner?: Client;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id?: number;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  estimatedDeliveryDays?: number;
  workingDays?: string;
  notes?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  parentCategory?: Category;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: number;
  name: string;
  barcode?: string;
  brand?: string;
  category?: Category;
  buyingPrice?: number;
  sellingPrice?: number;
  vehiclesCompatibility?: string;
  expirationDate?: string;
  volume?: number;
  volumeUnit?: string;
  minStock?: number;
  currentStock?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id?: number;
  name: string;
  category?: Category;
  sellingPrice?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseCategory {
  id?: number;
  name: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: number;
  date: string;
  expenseCategory?: ExpenseCategory;
  label: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierOrder {
  id?: number;
  supplier?: Supplier;
  orderDate: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrder {
  id?: number;
  client?: Client;
  vehicle?: Vehicle;
  date: string;
  status?: string;
  totalAmount?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id?: number;
  client?: Client;
  company?: Company;
  workOrder?: WorkOrder;
  date: string;
  status?: string;
  totalAmount?: number;
  remainingBalance?: number;
  lines?: InvoiceLine[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id?: number;
  payerType: 'CLIENT' | 'COMPANY';
  payerId: number;
  date: string;
  method?: string;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id?: number;
  product?: Product;
  date: string;
  quantityDelta: number;
  type: 'PURCHASE' | 'ADJUSTMENT' | 'CONSUMPTION';
  reason?: string;
  sourceType?: string;
  sourceId?: number;
  createdAt?: string;
}

export interface ProductPriceHistory {
  id?: number;
  product?: Product;
  priceType?: 'SELLING' | 'BUYING';
  startDate: string;
  endDate?: string;
  price: number;
  createdAt?: string;
}

export interface ServicePriceHistory {
  id?: number;
  service?: ServiceItem;
  startDate: string;
  endDate?: string;
  price: number;
  createdAt?: string;
}

export interface WorkOrderProductLine {
  id?: number;
  workOrder?: WorkOrder;
  product?: Product;
  quantity: number;
  standardPrice?: number;
  discountPercent?: number;
  finalUnitPrice?: number;
  lineTotal?: number;
}

export interface WorkOrderServiceLine {
  id?: number;
  workOrder?: WorkOrder;
  service?: ServiceItem;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface WorkOrderTotals {
  servicesSubtotal: number;
  productsBeforeDiscount: number;
  productsDiscountTotal: number;
  productsAfterDiscount: number;
  grandTotal: number;
}

export interface SupplierOrderLine {
  id?: number;
  supplierOrder?: SupplierOrder;
  product?: Product;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface InvoiceLine {
  id?: number;
  invoice?: Invoice;
  product?: Product;
  service?: ServiceItem;
  description?: string;
  quantity: number;
  standardPrice?: number;
  discountPercent?: number;
  finalUnitPrice?: number;
  lineTotal?: number;
}

export interface PaymentAllocation {
  id?: number;
  payment?: Payment;
  invoice?: Invoice;
  allocatedAmount: number;
}

export interface DashboardStats {
  openWorkOrders: number;
  outstandingAmount: number;
  lowStockProducts: number;
  monthlyExpenses: number;
  totalCompanies: number;
  totalClients: number;
  totalVehicles: number;
  totalProducts: number;
  totalServices: number;
  totalSuppliers: number;
}

export interface ApplyPaymentRequest {
  payerType: 'CLIENT' | 'COMPANY';
  payerId: number;
  totalAmount: number;
  method?: string;
  date?: string;
  notes?: string;
  allocations?: { invoiceId: number; amount: number }[];
}
