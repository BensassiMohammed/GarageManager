import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SupplierOrder } from '../../models/models';

@Component({
  selector: 'app-supplier-order-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Supplier Orders</h2>
    </div>

    <div class="card">
      <p style="padding: 20px; color: #666;">
        Supplier Orders management will be available in the next phase.
        This module will allow you to create purchase orders to suppliers and track inventory.
      </p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders; track order.id) {
              <tr>
                <td>{{ order.id }}</td>
                <td>{{ order.supplier?.name || '-' }}</td>
                <td>{{ order.orderDate }}</td>
                <td><span class="badge badge-info">{{ order.status }}</span></td>
                <td>{{ order.totalAmount | currency }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">No supplier orders found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SupplierOrderListComponent implements OnInit {
  orders: SupplierOrder[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getSupplierOrders().subscribe(data => this.orders = data);
  }
}
