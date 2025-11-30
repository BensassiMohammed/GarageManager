import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Products</h2>
      <a routerLink="/products/new" class="btn btn-primary">New Product</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products; track product.id) {
              <tr>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.category?.name || '-' }}</td>
                <td>{{ product.sellingPrice | currency }}</td>
                <td>
                  <span [class]="(product.currentStock || 0) <= (product.minStock || 0) ? 'badge badge-danger' : 'badge badge-success'">
                    {{ product.currentStock || 0 }}
                  </span>
                </td>
                <td>
                  <span [class]="product.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ product.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/products', product.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(product)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">No products found</td>
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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getProducts().subscribe(data => this.products = data);
  }

  delete(product: Product) {
    if (confirm(`Delete ${product.name}?`)) {
      this.api.deleteProduct(product.id!).subscribe(() => this.load());
    }
  }
}
