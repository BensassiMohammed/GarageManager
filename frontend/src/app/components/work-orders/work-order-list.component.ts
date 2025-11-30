import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WorkOrder } from '../../models/models';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Work Orders</h2>
    </div>

    <div class="card">
      <p style="padding: 20px; color: #666;">
        Work Orders management will be available in the next phase.
        This module will allow you to create work orders linked to clients and vehicles with service and product lines.
      </p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders; track order.id) {
              <tr>
                <td>{{ order.id }}</td>
                <td>{{ order.client ? order.client.firstName + ' ' + order.client.lastName : '-' }}</td>
                <td>{{ order.vehicle?.registrationNumber || '-' }}</td>
                <td>{{ order.date }}</td>
                <td><span class="badge badge-info">{{ order.status }}</span></td>
                <td>{{ order.totalAmount | currency }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No work orders found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class WorkOrderListComponent implements OnInit {
  orders: WorkOrder[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getWorkOrders().subscribe(data => this.orders = data);
  }
}
