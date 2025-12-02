import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/models';
import { MadCurrencyPipe } from '../../pipes/mad-currency.pipe';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, MadCurrencyPipe],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'products.title' | translate }}</h2>
      <a routerLink="/products/new" class="btn btn-primary">{{ 'products.newProduct' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'products.code' | translate }}</th>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'products.brand' | translate }}</th>
              <th>{{ 'common.category' | translate }}</th>
              <th>{{ 'products.buyingPrice' | translate }}</th>
              <th>{{ 'products.sellingPrice' | translate }}</th>
              <th>{{ 'products.currentStock' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products; track product.id) {
              <tr>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.brand || '-' }}</td>
                <td>{{ product.category?.name || '-' }}</td>
                <td>{{ product.buyingPrice ? (product.buyingPrice | madCurrency) : '-' }}</td>
                <td>{{ product.sellingPrice | madCurrency }}</td>
                <td>
                  <span [class]="(product.currentStock || 0) <= (product.minStock || 0) ? 'badge badge-danger' : 'badge badge-success'">
                    {{ product.currentStock || 0 }}
                  </span>
                </td>
                <td>
                  <span [class]="product.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (product.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/products', product.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(product)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-state">{{ 'products.noProducts' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getProducts().subscribe(data => {
      this.products = data;
      this.cdr.detectChanges();
    });
  }

  delete(product: Product) {
    if (confirm(`Delete ${product.name}?`)) {
      this.api.deleteProduct(product.id!).subscribe(() => this.load());
    }
  }
}
