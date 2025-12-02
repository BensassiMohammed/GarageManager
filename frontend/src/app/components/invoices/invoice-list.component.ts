import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Invoice, InvoiceLine } from '../../models/models';
import { MadCurrencyPipe } from '../../pipes/mad-currency.pipe';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MadCurrencyPipe],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'invoices.title' | translate }}</h2>
    </div>

    <div class="filter-bar">
      <select [(ngModel)]="statusFilter" (change)="filterInvoices()" class="form-control">
        <option value="">{{ 'common.all' | translate }} {{ 'common.status' | translate }}</option>
        <option value="DRAFT">{{ 'invoices.draft' | translate }}</option>
        <option value="ISSUED">{{ 'invoices.issued' | translate }}</option>
        <option value="SENT">Sent</option>
        <option value="PARTIAL">{{ 'invoices.partiallyPaid' | translate }}</option>
        <option value="PAID">{{ 'invoices.paid' | translate }}</option>
      </select>
      <button class="btn btn-secondary" (click)="showUnpaid()">{{ 'dashboard.unpaidInvoices' | translate }}</button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'invoices.invoiceNumber' | translate }}</th>
              <th>{{ 'invoices.client' | translate }}</th>
              <th>{{ 'common.date' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.total' | translate }}</th>
              <th>{{ 'invoices.remainingBalance' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
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
                  <span [class]="getStatusClass(invoice.status)">{{ getStatusLabel(invoice.status) | translate }}</span>
                </td>
                <td>{{ invoice.totalAmount | madCurrency }}</td>
                <td>
                  @if ((invoice.remainingBalance || 0) > 0) {
                    <span class="text-danger">{{ invoice.remainingBalance | madCurrency }}</span>
                  } @else {
                    <span class="text-success">{{ 'invoices.paid' | translate }}</span>
                  }
                </td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" (click)="viewDetails(invoice)">{{ 'common.details' | translate }}</button>
                  @if (invoice.status === 'DRAFT') {
                    <button class="btn btn-sm btn-primary" (click)="issueInvoice(invoice)">{{ 'invoices.markAsIssued' | translate }}</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">{{ 'invoices.noInvoices' | translate }}</td>
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
            <h3>{{ 'invoices.invoiceNumber' | translate }} #{{ selectedInvoice.id }}</h3>
            <button class="btn-close" (click)="showDetails = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="invoice-info">
              <div class="info-group">
                <label>{{ 'invoices.client' | translate }}:</label>
                <span>
                  @if (selectedInvoice.company) {
                    {{ selectedInvoice.company.name }}
                  } @else if (selectedInvoice.client) {
                    {{ selectedInvoice.client.firstName }} {{ selectedInvoice.client.lastName }}
                  }
                </span>
              </div>
              <div class="info-group">
                <label>{{ 'common.date' | translate }}:</label>
                <span>{{ selectedInvoice.date }}</span>
              </div>
              <div class="info-group">
                <label>{{ 'common.status' | translate }}:</label>
                <span [class]="getStatusClass(selectedInvoice.status)">{{ getStatusLabel(selectedInvoice.status) | translate }}</span>
              </div>
              @if (selectedInvoice.workOrder) {
                <div class="info-group">
                  <label>{{ 'invoices.workOrder' | translate }}:</label>
                  <span>#{{ selectedInvoice.workOrder.id }}</span>
                </div>
              }
            </div>

            <h4>{{ 'invoices.invoiceLines' | translate }}</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'common.description' | translate }}</th>
                    <th>{{ 'common.quantity' | translate }}</th>
                    <th>{{ 'workOrders.stdPrice' | translate }}</th>
                    <th>{{ 'workOrders.discount' | translate }}</th>
                    <th>{{ 'workOrders.finalPrice' | translate }}</th>
                    <th>{{ 'workOrders.lineTotal' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of invoiceLines; track line.id) {
                    <tr>
                      <td>
                        {{ line.description || line.product?.name || line.service?.name || '-' }}
                      </td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ line.standardPrice | madCurrency }}</td>
                      <td>
                        @if (line.discountPercent && line.discountPercent > 0) {
                          <span class="badge badge-success">{{ line.discountPercent }}%</span>
                        } @else {
                          -
                        }
                      </td>
                      <td>{{ line.finalUnitPrice | madCurrency }}</td>
                      <td>{{ line.lineTotal | madCurrency }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="empty-state">{{ 'invoices.noInvoices' | translate }}</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="invoice-totals">
              <div class="totals-row">
                <span>{{ 'invoices.totalAmount' | translate }}:</span>
                <span>{{ selectedInvoice.totalAmount | madCurrency }}</span>
              </div>
              <div class="totals-row">
                <span>{{ 'invoices.paidAmount' | translate }}:</span>
                <span class="text-success">{{ (selectedInvoice.totalAmount || 0) - (selectedInvoice.remainingBalance || 0) | madCurrency }}</span>
              </div>
              <div class="totals-row balance">
                <span>{{ 'invoices.remainingBalance' | translate }}:</span>
                <span [class]="(selectedInvoice.remainingBalance || 0) > 0 ? 'text-danger' : 'text-success'">
                  {{ selectedInvoice.remainingBalance | madCurrency }}
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
      this.cdr.detectChanges();
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

  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'invoices.draft',
      'ISSUED': 'invoices.issued',
      'SENT': 'invoices.issued',
      'PARTIAL': 'invoices.partiallyPaid',
      'PAID': 'invoices.paid',
      'CANCELLED': 'invoices.cancelled'
    };
    return labels[status || ''] || 'invoices.draft';
  }

  viewDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showDetails = true;
    
    if (invoice.id) {
      this.api.getInvoiceLines(invoice.id).subscribe(data => {
        this.invoiceLines = data;
        this.cdr.detectChanges();
      });
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
