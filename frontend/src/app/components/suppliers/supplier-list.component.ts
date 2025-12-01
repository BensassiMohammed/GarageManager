import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Supplier } from '../../models/models';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'suppliers.title' | translate }}</h2>
      <a routerLink="/suppliers/new" class="btn btn-primary">{{ 'suppliers.newSupplier' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'suppliers.city' | translate }}</th>
              <th>{{ 'common.email' | translate }}</th>
              <th>{{ 'common.phone' | translate }}</th>
              <th>{{ 'suppliers.estimatedDeliveryDays' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (supplier of suppliers; track supplier.id) {
              <tr>
                <td>{{ supplier.name }}</td>
                <td>{{ supplier.city || '-' }}</td>
                <td>{{ supplier.email || '-' }}</td>
                <td>{{ supplier.phone || '-' }}</td>
                <td>{{ supplier.estimatedDeliveryDays || '-' }}</td>
                <td>
                  <span [class]="supplier.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (supplier.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/suppliers', supplier.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(supplier)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">{{ 'suppliers.noSuppliers' | translate }}</td>
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

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getSuppliers().subscribe(data => {
      this.suppliers = data;
      this.cdr.detectChanges();
    });
  }

  delete(supplier: Supplier) {
    if (confirm(`Delete ${supplier.name}?`)) {
      this.api.deleteSupplier(supplier.id!).subscribe(() => this.load());
    }
  }
}
