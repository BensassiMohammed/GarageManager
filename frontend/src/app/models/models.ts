export interface Company {
  id?: number;
  name: string;
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
  currentOwner?: Client;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
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
  code: string;
  name: string;
  category?: Category;
  sellingPrice?: number;
  minStock?: number;
  currentStock?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id?: number;
  code: string;
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
  date: string;
  status?: string;
  totalAmount?: number;
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
