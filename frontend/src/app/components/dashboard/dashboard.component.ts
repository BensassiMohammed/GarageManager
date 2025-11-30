import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats, WorkOrder, Invoice, Product } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Dashboard</h2>
    </div>
    
    <div class="kpi-grid">
      <div class="kpi-card kpi-warning" routerLink="/work-orders" style="cursor: pointer">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ stats.openWorkOrders }}</div>
          <div class="kpi-label">Open Work Orders</div>
        </div>
      </div>

      <div class="kpi-card kpi-danger" routerLink="/invoices" style="cursor: pointer">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ stats.outstandingAmount | currency }}</div>
          <div class="kpi-label">Outstanding Balance</div>
        </div>
      </div>

      <div class="kpi-card kpi-alert" routerLink="/products" style="cursor: pointer">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ stats.lowStockProducts }}</div>
          <div class="kpi-label">Low Stock Products</div>
        </div>
      </div>

      <div class="kpi-card kpi-info" routerLink="/expenses" style="cursor: pointer">
        <div class="kpi-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">{{ stats.monthlyExpenses | currency }}</div>
          <div class="kpi-label">Monthly Expenses</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" routerLink="/companies" style="cursor: pointer">
        <div class="stat-value">{{ stats.totalCompanies }}</div>
        <div class="stat-label">Companies</div>
      </div>
      <div class="stat-card" routerLink="/clients" style="cursor: pointer">
        <div class="stat-value">{{ stats.totalClients }}</div>
        <div class="stat-label">Clients</div>
      </div>
      <div class="stat-card" routerLink="/vehicles" style="cursor: pointer">
        <div class="stat-value">{{ stats.totalVehicles }}</div>
        <div class="stat-label">Vehicles</div>
      </div>
      <div class="stat-card" routerLink="/products" style="cursor: pointer">
        <div class="stat-value">{{ stats.totalProducts }}</div>
        <div class="stat-label">Products</div>
      </div>
      <div class="stat-card" routerLink="/services" style="cursor: pointer">
        <div class="stat-value">{{ stats.totalServices }}</div>
        <div class="stat-label">Services</div>
      </div>
      <div class="stat-card" routerLink="/suppliers" style="cursor: pointer">
        <div class="stat-value">{{ stats.totalSuppliers }}</div>
        <div class="stat-label">Suppliers</div>
      </div>
    </div>

    <div class="dashboard-panels">
      <div class="panel">
        <div class="panel-header">
          <h3>Recent Open Work Orders</h3>
          <a routerLink="/work-orders" class="btn btn-sm btn-secondary">View All</a>
        </div>
        <div class="panel-content">
          @if (recentWorkOrders.length === 0) {
            <p class="empty-message">No open work orders</p>
          } @else {
            <ul class="item-list">
              @for (wo of recentWorkOrders; track wo.id) {
                <li class="item">
                  <div class="item-main">
                    <span class="item-title">{{ wo.client?.firstName }} {{ wo.client?.lastName }}</span>
                    <span class="item-subtitle">{{ wo.vehicle?.registrationNumber || '-' }}</span>
                  </div>
                  <div class="item-meta">
                    <span class="badge badge-warning">{{ wo.status }}</span>
                    <span class="item-amount">{{ wo.totalAmount | currency }}</span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Unpaid Invoices</h3>
          <a routerLink="/invoices" class="btn btn-sm btn-secondary">View All</a>
        </div>
        <div class="panel-content">
          @if (unpaidInvoices.length === 0) {
            <p class="empty-message">No unpaid invoices</p>
          } @else {
            <ul class="item-list">
              @for (inv of unpaidInvoices; track inv.id) {
                <li class="item">
                  <div class="item-main">
                    <span class="item-title">{{ inv.client?.firstName || inv.company?.name }}</span>
                    <span class="item-subtitle">{{ inv.date }}</span>
                  </div>
                  <div class="item-meta">
                    <span class="badge badge-danger">{{ inv.remainingBalance | currency }}</span>
                    <span class="item-total">of {{ inv.totalAmount | currency }}</span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Low Stock Products</h3>
          <a routerLink="/products" class="btn btn-sm btn-secondary">View All</a>
        </div>
        <div class="panel-content">
          @if (lowStockProducts.length === 0) {
            <p class="empty-message">All products are well stocked</p>
          } @else {
            <ul class="item-list">
              @for (prod of lowStockProducts; track prod.id) {
                <li class="item">
                  <div class="item-main">
                    <span class="item-title">{{ prod.name }}</span>
                    <span class="item-subtitle">{{ prod.code }}</span>
                  </div>
                  <div class="item-meta">
                    <span class="badge badge-danger">{{ prod.currentStock || 0 }} in stock</span>
                    <span class="item-min">Min: {{ prod.minStock }}</span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      background: var(--card);
      border-radius: 12px;
      padding: 1.5rem;
      gap: 1rem;
      border-left: 4px solid;
    }
    .kpi-warning { border-color: #f59e0b; }
    .kpi-danger { border-color: #ef4444; }
    .kpi-alert { border-color: #f97316; }
    .kpi-info { border-color: #3b82f6; }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-warning .kpi-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .kpi-danger .kpi-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .kpi-alert .kpi-icon { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .kpi-info .kpi-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
    }
    .kpi-label {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .dashboard-panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .panel {
      background: var(--card);
      border-radius: 12px;
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .panel-header h3 {
      margin: 0;
      font-size: 1rem;
    }
    .panel-content {
      padding: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }
    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-main {
      display: flex;
      flex-direction: column;
    }
    .item-title {
      font-weight: 500;
    }
    .item-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .item-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .item-amount, .item-total, .item-min {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .empty-message {
      text-align: center;
      color: var(--text-muted);
      padding: 2rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    openWorkOrders: 0,
    outstandingAmount: 0,
    lowStockProducts: 0,
    monthlyExpenses: 0,
    totalCompanies: 0,
    totalClients: 0,
    totalVehicles: 0,
    totalProducts: 0,
    totalServices: 0,
    totalSuppliers: 0
  };

  recentWorkOrders: WorkOrder[] = [];
  unpaidInvoices: Invoice[] = [];
  lowStockProducts: Product[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.api.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadStatsManually();
      }
    });

    this.api.getOpenWorkOrders().subscribe({
      next: (data) => {
        this.recentWorkOrders = data.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => this.recentWorkOrders = []
    });

    this.api.getUnpaidInvoices().subscribe({
      next: (data) => {
        this.unpaidInvoices = data.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => this.unpaidInvoices = []
    });

    this.api.getProducts().subscribe({
      next: (data) => {
        this.lowStockProducts = data
          .filter(p => (p.currentStock || 0) <= (p.minStock || 0))
          .slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => this.lowStockProducts = []
    });
  }

  loadStatsManually() {
    forkJoin({
      companies: this.api.getCompanies(),
      clients: this.api.getClients(),
      vehicles: this.api.getVehicles(),
      products: this.api.getProducts(),
      services: this.api.getServices(),
      suppliers: this.api.getSuppliers()
    }).subscribe({
      next: (data) => {
        this.stats.totalCompanies = data.companies?.length || 0;
        this.stats.totalClients = data.clients?.length || 0;
        this.stats.totalVehicles = data.vehicles?.length || 0;
        this.stats.totalProducts = data.products?.length || 0;
        this.stats.totalServices = data.services?.length || 0;
        this.stats.totalSuppliers = data.suppliers?.length || 0;
        this.stats.lowStockProducts = data.products?.filter(
          p => (p.currentStock || 0) <= (p.minStock || 0)
        ).length || 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
