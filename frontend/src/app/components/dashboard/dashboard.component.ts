import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Dashboard</h2>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.companies }}</div>
        <div class="stat-label">Companies</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.clients }}</div>
        <div class="stat-label">Clients</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.vehicles }}</div>
        <div class="stat-label">Vehicles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.products }}</div>
        <div class="stat-label">Products</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.services }}</div>
        <div class="stat-label">Services</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.suppliers }}</div>
        <div class="stat-label">Suppliers</div>
      </div>
    </div>

    <div class="card">
      <h3>Welcome to Garage Management System</h3>
      <p style="margin-top: 10px; color: #666;">
        Use the sidebar to navigate between different sections of the application.
        Manage your companies, clients, vehicles, products, services, and more.
      </p>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = {
    companies: 0,
    clients: 0,
    vehicles: 0,
    products: 0,
    services: 0,
    suppliers: 0
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.getCompanies().subscribe({
      next: data => this.stats.companies = data?.length || 0,
      error: () => this.stats.companies = 0
    });
    this.api.getClients().subscribe({
      next: data => this.stats.clients = data?.length || 0,
      error: () => this.stats.clients = 0
    });
    this.api.getVehicles().subscribe({
      next: data => this.stats.vehicles = data?.length || 0,
      error: () => this.stats.vehicles = 0
    });
    this.api.getProducts().subscribe({
      next: data => this.stats.products = data?.length || 0,
      error: () => this.stats.products = 0
    });
    this.api.getServices().subscribe({
      next: data => this.stats.services = data?.length || 0,
      error: () => this.stats.services = 0
    });
    this.api.getSuppliers().subscribe({
      next: data => this.stats.suppliers = data?.length || 0,
      error: () => this.stats.suppliers = 0
    });
  }
}
