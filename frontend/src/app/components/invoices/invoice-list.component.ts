import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Invoice, InvoiceLine } from '../../models/models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Invoices</h2>
    </div>

    <div class="filter-bar">
      <select [(ngModel)]="statusFilter" (change)="filterInvoices()" class="form-control">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="ISSUED">Issued</option>
        <option value="SENT">Sent</option>
        <option value="PARTIAL">Partial Payment</option>
        <option value="PAID">Paid</option>
      </select>
      <button class="btn btn-secondary" (click)="showUnpaid()">Show Unpaid Only</button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client / Company</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of filteredInvoices; track invoice.id) {
              <tr [class.selected]="selectedInvoice?.id === invoice.id">
                <td>{{ invoice.id }}</td>
                <td>
                  @if (invoice.company) {
                    {{ invoice.company.name }}
                  } @else if (invoice.client) {
                    {{ invoice.client.firstName }} {{ invoice.client.lastName }}
                  } @else {
                    -
                  }
                </td>
                <td>{{ invoice.date }}</td>
                <td>
                  <span [class]="getStatusClass(invoice.status)">{{ invoice.status }}</span>
                </td>
                <td>{{ invoice.totalAmount | currency }}</td>
                <td>
                  @if ((invoice.remainingBalance || 0) > 0) {
                    <span class="text-danger">{{ invoice.remainingBalance | currency }}</span>
                  } @else {
                    <span class="text-success">Paid</span>
                  }
                </td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" (click)="viewDetails(invoice)">Details</button>
                  @if (invoice.status === 'DRAFT') {
                    <button class="btn btn-sm btn-primary" (click)="issueInvoice(invoice)">Issue</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">No invoices found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showDetails && selectedInvoice) {
      <div class="modal-overlay" (click)="showDetails = false">
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Invoice #{{ selectedInvoice.id }}</h3>
            <button class="btn-close" (click)="showDetails = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="invoice-info">
              <div class="info-group">
                <label>Bill To:</label>
                <span>
                  @if (selectedInvoice.company) {
                    {{ selectedInvoice.company.name }}
                  } @else if (selectedInvoice.client) {
                    {{ selectedInvoice.client.firstName }} {{ selectedInvoice.client.lastName }}
                  }
                </span>
              </div>
              <div class="info-group">
                <label>Date:</label>
                <span>{{ selectedInvoice.date }}</span>
              </div>
              <div class="info-group">
                <label>Status:</label>
                <span [class]="getStatusClass(selectedInvoice.status)">{{ selectedInvoice.status }}</span>
              </div>
              @if (selectedInvoice.workOrder) {
                <div class="info-group">
                  <label>Work Order:</label>
                  <span>#{{ selectedInvoice.workOrder.id }}</span>
                </div>
              }
            </div>

            <h4>Invoice Lines</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Standard Price</th>
                    <th>Discount %</th>
                    <th>Final Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of invoiceLines; track line.id) {
                    <tr>
                      <td>
                        {{ line.description || line.product?.name || line.service?.name || '-' }}
                      </td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ line.standardPrice | currency }}</td>
                      <td>
                        @if (line.discountPercent && line.discountPercent > 0) {
                          <span class="badge badge-success">{{ line.discountPercent }}%</span>
                        } @else {
                          -
                        }
                      </td>
                      <td>{{ line.finalUnitPrice | currency }}</td>
                      <td>{{ line.lineTotal | currency }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="empty-state">No invoice lines</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="invoice-totals">
              <div class="totals-row">
                <span>Total Amount:</span>
                <span>{{ selectedInvoice.totalAmount | currency }}</span>
              </div>
              <div class="totals-row">
                <span>Paid:</span>
                <span class="text-success">{{ (selectedInvoice.totalAmount || 0) - (selectedInvoice.remainingBalance || 0) | currency }}</span>
              </div>
              <div class="totals-row balance">
                <span>Remaining Balance:</span>
                <span [class]="(selectedInvoice.remainingBalance || 0) > 0 ? 'text-danger' : 'text-success'">
                  {{ selectedInvoice.remainingBalance | currency }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .filter-bar select {
      max-width: 200px;
    }
    .selected {
      background: var(--surface-hover);
    }
    .text-danger {
      color: var(--danger);
      font-weight: 500;
    }
    .text-success {
      color: var(--success);
      font-weight: 500;
    }
    .invoice-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--surface);
      border-radius: 8px;
    }
    .info-group {
      display: flex;
      flex-direction: column;
    }
    .info-group label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .invoice-totals {
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--surface);
      border-radius: 8px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }
    .totals-row:last-child {
      border-bottom: none;
    }
    .totals-row.balance {
      font-weight: bold;
      font-size: 1.25rem;
    }
    .modal-lg {
      max-width: 900px;
    }
    h4 {
      margin: 1.5rem 0 1rem;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  invoiceLines: InvoiceLine[] = [];
  statusFilter = '';
  showDetails = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.api.getInvoices().subscribe(data => {
      this.invoices = data;
      this.filterInvoices();
      this.cdr.detectChanges();
    });
  }

  filterInvoices() {
    this.filteredInvoices = this.statusFilter 
      ? this.invoices.filter(i => i.status === this.statusFilter)
      : this.invoices;
  }

  showUnpaid() {
    this.api.getUnpaidInvoices().subscribe(data => {
      this.filteredInvoices = data;
      this.statusFilter = '';
    });
  }

  getStatusClass(status?: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'badge badge-secondary',
      'ISSUED': 'badge badge-info',
      'SENT': 'badge badge-primary',
      'PARTIAL': 'badge badge-warning',
      'PAID': 'badge badge-success',
      'CANCELLED': 'badge badge-danger'
    };
    return classes[status || ''] || 'badge badge-secondary';
  }

  viewDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showDetails = true;
    
    if (invoice.id) {
      this.api.getInvoiceLines(invoice.id).subscribe(data => this.invoiceLines = data);
    }
  }

  issueInvoice(invoice: Invoice) {
    if (invoice.id && confirm('Issue this invoice? This will mark it as ready for payment.')) {
      this.api.issueInvoice(invoice.id).subscribe({
        next: () => this.loadInvoices(),
        error: (err) => alert('Error issuing invoice: ' + (err.error?.message || err.message))
      });
    }
  }
}
