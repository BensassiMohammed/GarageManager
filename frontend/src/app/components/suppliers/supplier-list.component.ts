import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Supplier } from '../../models/models';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Suppliers</h2>
      <a routerLink="/suppliers/new" class="btn btn-primary">New Supplier</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (supplier of suppliers; track supplier.id) {
              <tr>
                <td>{{ supplier.name }}</td>
                <td>{{ supplier.email || '-' }}</td>
                <td>{{ supplier.phone || '-' }}</td>
                <td>
                  <span [class]="supplier.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ supplier.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/suppliers', supplier.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(supplier)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">No suppliers found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getSuppliers().subscribe(data => this.suppliers = data);
  }

  delete(supplier: Supplier) {
    if (confirm(`Delete ${supplier.name}?`)) {
      this.api.deleteSupplier(supplier.id!).subscribe(() => this.load());
    }
  }
}
