import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WorkOrder, WorkOrderProductLine, WorkOrderServiceLine, WorkOrderTotals, Client, Vehicle, Company } from '../../models/models';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Work Orders</h2>
      <button class="btn btn-primary" (click)="showCreateModal = true">New Work Order</button>
    </div>

    <div class="filter-bar">
      <select [(ngModel)]="statusFilter" (change)="filterOrders()" class="form-control">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="INVOICED">Invoiced</option>
      </select>
    </div>

    <div class="card">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (order of filteredOrders; track order.id) {
              <tr [class.selected]="selectedOrder?.id === order.id" (click)="selectOrder(order)">
                <td>{{ order.id }}</td>
                <td>{{ order.client ? order.client.firstName + ' ' + order.client.lastName : '-' }}</td>
                <td>{{ order.vehicle?.registrationNumber || '-' }}</td>
                <td>{{ order.date }}</td>
                <td>
                  <span [class]="getStatusClass(order.status)">{{ order.status }}</span>
                </td>
                <td>{{ order.totalAmount | currency }}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" (click)="viewDetails(order); $event.stopPropagation()">Details</button>
                  @if (order.status === 'COMPLETED') {
                    <button class="btn btn-sm btn-primary" (click)="generateInvoice(order); $event.stopPropagation()">Invoice</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">No work orders found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showDetails && selectedOrder) {
      <div class="modal-overlay" (click)="showDetails = false">
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Work Order #{{ selectedOrder.id }} Details</h3>
            <button class="btn-close" (click)="showDetails = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="order-info">
              <div class="info-group">
                <label>Client:</label>
                <span>{{ selectedOrder.client?.firstName }} {{ selectedOrder.client?.lastName }}</span>
              </div>
              <div class="info-group">
                <label>Vehicle:</label>
                <span>{{ selectedOrder.vehicle?.registrationNumber }} - {{ selectedOrder.vehicle?.brand }} {{ selectedOrder.vehicle?.model }}</span>
              </div>
              <div class="info-group">
                <label>Status:</label>
                <span [class]="getStatusClass(selectedOrder.status)">{{ selectedOrder.status }}</span>
              </div>
            </div>

            <h4>Services</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of serviceLines; track line.id) {
                    <tr>
                      <td>{{ line.service?.name }}</td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ line.unitPrice | currency }}</td>
                      <td>{{ line.lineTotal | currency }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="empty-state">No services</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <h4>Products</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Standard Price</th>
                    <th>Discount %</th>
                    <th>Final Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of productLines; track line.id) {
                    <tr>
                      <td>{{ line.product?.name }}</td>
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
                    <tr><td colspan="6" class="empty-state">No products</td></tr>
                  }
                </tbody>
              </table>
            </div>

            @if (orderTotals) {
              <div class="totals-section">
                <div class="totals-row">
                  <span>Services Subtotal:</span>
                  <span>{{ orderTotals.servicesSubtotal | currency }}</span>
                </div>
                <div class="totals-row">
                  <span>Products (Before Discount):</span>
                  <span>{{ orderTotals.productsBeforeDiscount | currency }}</span>
                </div>
                @if (orderTotals.productsDiscountTotal > 0) {
                  <div class="totals-row discount">
                    <span>Products Discount:</span>
                    <span>-{{ orderTotals.productsDiscountTotal | currency }}</span>
                  </div>
                }
                <div class="totals-row">
                  <span>Products (After Discount):</span>
                  <span>{{ orderTotals.productsAfterDiscount | currency }}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>Grand Total:</span>
                  <span>{{ orderTotals.grandTotal | currency }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }

    @if (showCreateModal) {
      <div class="modal-overlay" (click)="showCreateModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Create Work Order</h3>
            <button class="btn-close" (click)="showCreateModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="required">Client</label>
              <select [(ngModel)]="newOrder.clientId" class="form-control">
                <option [ngValue]="null">-- Select Client --</option>
                @for (client of clients; track client.id) {
                  <option [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Vehicle</label>
              <select [(ngModel)]="newOrder.vehicleId" class="form-control">
                <option [ngValue]="null">-- Select Vehicle --</option>
                @for (vehicle of vehicles; track vehicle.id) {
                  <option [ngValue]="vehicle.id">{{ vehicle.registrationNumber }} - {{ vehicle.brand }} {{ vehicle.model }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="required">Date</label>
              <input type="date" [(ngModel)]="newOrder.date" class="form-control">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newOrder.description" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" (click)="createWorkOrder()" [disabled]="!newOrder.clientId || !newOrder.date">Create</button>
              <button class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showInvoiceModal && selectedOrder) {
      <div class="modal-overlay" (click)="showInvoiceModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Generate Invoice</h3>
            <button class="btn-close" (click)="showInvoiceModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>Generate invoice for Work Order #{{ selectedOrder.id }}?</p>
            <div class="form-group">
              <label>Bill to Company (optional)</label>
              <select [(ngModel)]="invoiceCompanyId" class="form-control">
                <option [ngValue]="null">-- Bill to Client --</option>
                @for (company of companies; track company.id) {
                  <option [ngValue]="company.id">{{ company.name }}</option>
                }
              </select>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" (click)="confirmGenerateInvoice()">Generate Invoice</button>
              <button class="btn btn-secondary" (click)="showInvoiceModal = false">Cancel</button>
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
    .order-info {
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
    .totals-section {
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
    .totals-row.discount {
      color: var(--success);
    }
    .totals-row.grand-total {
      font-weight: bold;
      font-size: 1.25rem;
      color: var(--primary);
    }
    .modal-lg {
      max-width: 900px;
    }
    h4 {
      margin: 1.5rem 0 1rem;
    }
  `]
})
export class WorkOrderListComponent implements OnInit {
  orders: WorkOrder[] = [];
  filteredOrders: WorkOrder[] = [];
  selectedOrder: WorkOrder | null = null;
  statusFilter = '';
  showDetails = false;
  showCreateModal = false;
  showInvoiceModal = false;
  invoiceCompanyId: number | null = null;
  
  productLines: WorkOrderProductLine[] = [];
  serviceLines: WorkOrderServiceLine[] = [];
  orderTotals: WorkOrderTotals | null = null;
  
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  companies: Company[] = [];
  
  newOrder = {
    clientId: null as number | null,
    vehicleId: null as number | null,
    date: new Date().toISOString().split('T')[0],
    description: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getWorkOrders().subscribe(data => {
      this.orders = data;
      this.filterOrders();
    });
    this.api.getClients().subscribe(data => this.clients = data);
    this.api.getVehicles().subscribe(data => this.vehicles = data);
    this.api.getCompanies().subscribe(data => this.companies = data);
  }

  filterOrders() {
    this.filteredOrders = this.statusFilter 
      ? this.orders.filter(o => o.status === this.statusFilter)
      : this.orders;
  }

  getStatusClass(status?: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'badge badge-secondary',
      'OPEN': 'badge badge-info',
      'IN_PROGRESS': 'badge badge-warning',
      'COMPLETED': 'badge badge-success',
      'INVOICED': 'badge badge-primary',
      'CANCELLED': 'badge badge-danger'
    };
    return classes[status || ''] || 'badge badge-secondary';
  }

  selectOrder(order: WorkOrder) {
    this.selectedOrder = order;
  }

  viewDetails(order: WorkOrder) {
    this.selectedOrder = order;
    this.showDetails = true;
    
    if (order.id) {
      this.api.getWorkOrderProductLines(order.id).subscribe(data => this.productLines = data);
      this.api.getWorkOrderServiceLines(order.id).subscribe(data => this.serviceLines = data);
      this.api.getWorkOrderTotals(order.id).subscribe(data => this.orderTotals = data);
    }
  }

  generateInvoice(order: WorkOrder) {
    this.selectedOrder = order;
    this.invoiceCompanyId = null;
    this.showInvoiceModal = true;
  }

  confirmGenerateInvoice() {
    if (this.selectedOrder?.id) {
      this.api.generateInvoiceFromWorkOrder(this.selectedOrder.id, this.invoiceCompanyId || undefined)
        .subscribe({
          next: () => {
            this.showInvoiceModal = false;
            this.loadData();
            alert('Invoice generated successfully!');
          },
          error: (err) => {
            alert('Error generating invoice: ' + (err.error?.message || err.message));
          }
        });
    }
  }

  createWorkOrder() {
    const data: any = {
      date: this.newOrder.date,
      description: this.newOrder.description,
      status: 'DRAFT'
    };
    
    if (this.newOrder.clientId) {
      data.client = { id: this.newOrder.clientId };
    }
    if (this.newOrder.vehicleId) {
      data.vehicle = { id: this.newOrder.vehicleId };
    }
    
    this.api.createWorkOrder(data).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newOrder = {
          clientId: null,
          vehicleId: null,
          date: new Date().toISOString().split('T')[0],
          description: ''
        };
        this.loadData();
      },
      error: (err) => {
        alert('Error creating work order: ' + (err.error?.message || err.message));
      }
    });
  }
}
