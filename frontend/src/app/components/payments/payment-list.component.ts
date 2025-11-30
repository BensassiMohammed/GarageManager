import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Payment, PaymentAllocation, Client, Company, Invoice, ApplyPaymentRequest } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'payments.title' | translate }}</h2>
      <button class="btn btn-primary" (click)="openRecordPayment()">{{ 'payments.recordPayment' | translate }}</button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ 'payments.client' | translate }}</th>
              <th>{{ 'payments.paymentDate' | translate }}</th>
              <th>{{ 'payments.paymentMethod' | translate }}</th>
              <th>{{ 'common.amount' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (payment of payments; track payment.id) {
              <tr>
                <td>{{ payment.id }}</td>
                <td>
                  {{ payment.payerType }}: {{ getPayerName(payment) }}
                </td>
                <td>{{ payment.date }}</td>
                <td>{{ getPaymentMethodLabel(payment.method) | translate }}</td>
                <td>{{ payment.totalAmount | currency }}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" (click)="viewAllocations(payment)">{{ 'payments.allocations' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">{{ 'payments.noPayments' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showRecordPayment) {
      <div class="modal-overlay" (click)="showRecordPayment = false">
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'payments.recordPayment' | translate }}</h3>
            <button class="btn-close" (click)="showRecordPayment = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="required">{{ 'common.type' | translate }}</label>
                <select [(ngModel)]="newPayment.payerType" (change)="onPayerTypeChange()" class="form-control">
                  <option value="CLIENT">{{ 'clients.title' | translate }}</option>
                  <option value="COMPANY">{{ 'companies.title' | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="required">{{ 'payments.client' | translate }}</label>
                <select [(ngModel)]="newPayment.payerId" (change)="loadPayerInvoices()" class="form-control">
                  <option [ngValue]="null">{{ 'common.select' | translate }}</option>
                  @if (newPayment.payerType === 'CLIENT') {
                    @for (client of clients; track client.id) {
                      <option [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }}</option>
                    }
                  } @else {
                    @for (company of companies; track company.id) {
                      <option [ngValue]="company.id">{{ company.name }}</option>
                    }
                  }
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="required">{{ 'common.amount' | translate }}</label>
                <input type="number" step="0.01" [(ngModel)]="newPayment.totalAmount" class="form-control">
              </div>
              <div class="form-group">
                <label>{{ 'payments.paymentMethod' | translate }}</label>
                <select [(ngModel)]="newPayment.method" class="form-control">
                  <option value="">{{ 'common.select' | translate }}</option>
                  <option value="CASH">{{ 'payments.cash' | translate }}</option>
                  <option value="CARD">{{ 'payments.card' | translate }}</option>
                  <option value="TRANSFER">{{ 'payments.bankTransfer' | translate }}</option>
                  <option value="CHECK">{{ 'payments.check' | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="required">{{ 'payments.paymentDate' | translate }}</label>
                <input type="date" [(ngModel)]="newPayment.date" class="form-control">
              </div>
            </div>

            <div class="form-group">
              <label>{{ 'common.notes' | translate }}</label>
              <textarea [(ngModel)]="newPayment.notes" class="form-control" rows="2"></textarea>
            </div>

            @if (payerInvoices.length > 0) {
              <h4>{{ 'payments.allocations' | translate }}</h4>
              <p class="help-text">{{ 'payments.autoAllocate' | translate }}</p>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'invoices.invoiceNumber' | translate }}</th>
                      <th>{{ 'common.date' | translate }}</th>
                      <th>{{ 'common.total' | translate }}</th>
                      <th>{{ 'invoices.remainingBalance' | translate }}</th>
                      <th>{{ 'payments.allocatedAmount' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (inv of payerInvoices; track inv.id; let i = $index) {
                      <tr>
                        <td>#{{ inv.id }}</td>
                        <td>{{ inv.date }}</td>
                        <td>{{ inv.totalAmount | currency }}</td>
                        <td class="text-danger">{{ inv.remainingBalance | currency }}</td>
                        <td>
                          <input type="number" step="0.01" min="0" [max]="inv.remainingBalance || 0"
                            [(ngModel)]="allocations[i].amount" class="form-control form-control-sm">
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="allocation-summary">
                <span>{{ 'payments.allocatedAmount' | translate }}: {{ getTotalAllocated() | currency }}</span>
                <span>{{ 'payments.unallocated' | translate }}: {{ newPayment.totalAmount - getTotalAllocated() | currency }}</span>
              </div>
            }

            <div class="form-actions">
              <button class="btn btn-primary" (click)="submitPayment()" 
                [disabled]="!newPayment.payerId || !newPayment.totalAmount || !newPayment.date">
                {{ 'payments.recordPayment' | translate }}
              </button>
              <button class="btn btn-secondary" (click)="showRecordPayment = false">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showAllocations && selectedPayment) {
      <div class="modal-overlay" (click)="showAllocations = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'payments.title' | translate }} #{{ selectedPayment.id }} {{ 'payments.allocations' | translate }}</h3>
            <button class="btn-close" (click)="showAllocations = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="payment-info">
              <div class="info-group">
                <label>{{ 'invoices.totalAmount' | translate }}:</label>
                <span>{{ selectedPayment.totalAmount | currency }}</span>
              </div>
              <div class="info-group">
                <label>{{ 'payments.paymentDate' | translate }}:</label>
                <span>{{ selectedPayment.date }}</span>
              </div>
              <div class="info-group">
                <label>{{ 'payments.paymentMethod' | translate }}:</label>
                <span>{{ getPaymentMethodLabel(selectedPayment.method) | translate }}</span>
              </div>
            </div>

            <h4>{{ 'payments.allocations' | translate }}</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'invoices.invoiceNumber' | translate }}</th>
                    <th>{{ 'common.amount' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (alloc of paymentAllocations; track alloc.id) {
                    <tr>
                      <td>{{ 'invoices.invoiceNumber' | translate }} #{{ alloc.invoice?.id }}</td>
                      <td>{{ alloc.allocatedAmount | currency }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="2" class="empty-state">{{ 'payments.noPayments' | translate }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-lg {
      max-width: 800px;
    }
    .form-control-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
    .text-danger {
      color: var(--danger);
    }
    .help-text {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .allocation-summary {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: var(--surface);
      border-radius: 8px;
      margin-top: 1rem;
    }
    .payment-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
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
    h4 {
      margin: 1.5rem 0 1rem;
    }
  `]
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  clients: Client[] = [];
  companies: Company[] = [];
  payerInvoices: Invoice[] = [];
  allocations: { invoiceId: number; amount: number }[] = [];
  
  showRecordPayment = false;
  showAllocations = false;
  selectedPayment: Payment | null = null;
  paymentAllocations: PaymentAllocation[] = [];
  
  newPayment: ApplyPaymentRequest = {
    payerType: 'CLIENT',
    payerId: 0,
    totalAmount: 0,
    method: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPayments().subscribe(data => {
      this.payments = data;
      this.cdr.detectChanges();
    });
    this.api.getClients().subscribe(data => {
      this.clients = data;
      this.cdr.detectChanges();
    });
    this.api.getCompanies().subscribe(data => {
      this.companies = data;
      this.cdr.detectChanges();
    });
  }

  getPayerName(payment: Payment): string {
    if (payment.payerType === 'CLIENT') {
      const client = this.clients.find(c => c.id === payment.payerId);
      return client ? `${client.firstName} ${client.lastName}` : `Client #${payment.payerId}`;
    } else {
      const company = this.companies.find(c => c.id === payment.payerId);
      return company ? company.name : `Company #${payment.payerId}`;
    }
  }

  getPaymentMethodLabel(method?: string): string {
    const labels: { [key: string]: string } = {
      'CASH': 'payments.cash',
      'CARD': 'payments.card',
      'TRANSFER': 'payments.bankTransfer',
      'CHECK': 'payments.check'
    };
    return labels[method || ''] || 'payments.other';
  }

  openRecordPayment() {
    this.newPayment = {
      payerType: 'CLIENT',
      payerId: 0,
      totalAmount: 0,
      method: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    };
    this.payerInvoices = [];
    this.allocations = [];
    this.showRecordPayment = true;
  }

  onPayerTypeChange() {
    this.newPayment.payerId = 0;
    this.payerInvoices = [];
    this.allocations = [];
  }

  loadPayerInvoices() {
    if (!this.newPayment.payerId) {
      this.payerInvoices = [];
      this.allocations = [];
      return;
    }
    
    this.api.getUnpaidInvoices().subscribe(invoices => {
      this.payerInvoices = invoices.filter(inv => {
        if (this.newPayment.payerType === 'CLIENT') {
          return inv.client?.id === this.newPayment.payerId;
        } else {
          return inv.company?.id === this.newPayment.payerId;
        }
      });
      
      this.allocations = this.payerInvoices.map(inv => ({
        invoiceId: inv.id!,
        amount: 0
      }));
      this.cdr.detectChanges();
    });
  }

  getTotalAllocated(): number {
    return this.allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
  }

  submitPayment() {
    const request: ApplyPaymentRequest = {
      ...this.newPayment,
      allocations: this.allocations.filter(a => a.amount > 0)
    };
    
    this.api.applyPayment(request).subscribe({
      next: () => {
        this.showRecordPayment = false;
        this.loadData();
        alert('Payment recorded successfully!');
      },
      error: (err) => {
        alert('Error recording payment: ' + (err.error?.message || err.message));
      }
    });
  }

  viewAllocations(payment: Payment) {
    this.selectedPayment = payment;
    this.showAllocations = true;
    
    if (payment.id) {
      this.api.getPaymentAllocations(payment.id).subscribe(data => {
        this.paymentAllocations = data;
        this.cdr.detectChanges();
      });
    }
  }
}
