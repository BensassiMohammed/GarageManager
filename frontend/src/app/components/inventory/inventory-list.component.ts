import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Product, StockMovement } from '../../models/models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Inventory</h2>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 15px;">Product Stock Levels</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products; track product.id) {
              <tr>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.currentStock || 0 }}</td>
                <td>{{ product.minStock || 0 }}</td>
                <td>
                  @if ((product.currentStock || 0) <= (product.minStock || 0)) {
                    <span class="badge badge-danger">Low Stock</span>
                  } @else {
                    <span class="badge badge-success">In Stock</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">No products found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 15px;">Recent Stock Movements</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            @for (movement of movements; track movement.id) {
              <tr>
                <td>{{ movement.date }}</td>
                <td>{{ movement.product?.name || '-' }}</td>
                <td>
                  <span [class]="movement.type === 'PURCHASE' ? 'badge badge-success' : (movement.type === 'CONSUMPTION' ? 'badge badge-warning' : 'badge badge-info')">
                    {{ movement.type }}
                  </span>
                </td>
                <td>{{ movement.quantityDelta > 0 ? '+' : '' }}{{ movement.quantityDelta }}</td>
                <td>{{ movement.reason || '-' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">No stock movements found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  products: Product[] = [];
  movements: StockMovement[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getProducts().subscribe({
      next: data => {
        this.products = data || [];
        this.cdr.detectChanges();
      },
      error: () => this.products = []
    });
    this.api.getStockMovements().subscribe({
      next: data => {
        this.movements = data || [];
        this.cdr.detectChanges();
      },
      error: () => this.movements = []
    });
  }
}
