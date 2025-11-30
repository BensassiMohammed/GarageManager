import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', section: 'main' },
    { path: '/companies', label: 'Companies', section: 'customers' },
    { path: '/clients', label: 'Clients', section: 'customers' },
    { path: '/vehicles', label: 'Vehicles', section: 'customers' },
    { path: '/suppliers', label: 'Suppliers', section: 'inventory' },
    { path: '/categories', label: 'Categories', section: 'inventory' },
    { path: '/products', label: 'Products', section: 'inventory' },
    { path: '/services', label: 'Services', section: 'inventory' },
    { path: '/supplier-orders', label: 'Supplier Orders', section: 'operations' },
    { path: '/inventory', label: 'Inventory', section: 'operations' },
    { path: '/work-orders', label: 'Work Orders', section: 'operations' },
    { path: '/invoices', label: 'Invoices', section: 'finance' },
    { path: '/payments', label: 'Payments', section: 'finance' },
    { path: '/expense-categories', label: 'Expense Categories', section: 'finance' },
    { path: '/expenses', label: 'Expenses', section: 'finance' }
  ];
}
