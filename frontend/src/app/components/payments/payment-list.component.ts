import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Payment } from '../../models/models';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Payments</h2>
    </div>

    <div class="card">
      <p style="padding: 20px; color: #666;">
        Payment management will be available in the next phase.
        This module will allow you to record payments and allocate them to invoices.
      </p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Payer Type</th>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            @for (payment of payments; track payment.id) {
              <tr>
                <td>{{ payment.id }}</td>
                <td>{{ payment.payerType }}</td>
                <td>{{ payment.date }}</td>
                <td>{{ payment.method || '-' }}</td>
                <td>{{ payment.totalAmount | currency }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">No payments found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPayments().subscribe(data => this.payments = data);
  }
}
