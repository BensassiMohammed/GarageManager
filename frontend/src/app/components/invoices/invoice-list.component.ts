import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Invoice } from '../../models/models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Invoices</h2>
    </div>

    <div class="card">
      <p style="padding: 20px; color: #666;">
        Invoice management will be available in the next phase.
        This module will allow you to create and manage invoices for clients and companies.
      </p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Company</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of invoices; track invoice.id) {
              <tr>
                <td>{{ invoice.id }}</td>
                <td>{{ invoice.client ? invoice.client.firstName + ' ' + invoice.client.lastName : '-' }}</td>
                <td>{{ invoice.company?.name || '-' }}</td>
                <td>{{ invoice.date }}</td>
                <td><span class="badge badge-info">{{ invoice.status }}</span></td>
                <td>{{ invoice.totalAmount | currency }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No invoices found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getInvoices().subscribe(data => this.invoices = data);
  }
}
