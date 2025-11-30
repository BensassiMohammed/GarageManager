import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { WorkOrder, WorkOrderProductLine, WorkOrderServiceLine, WorkOrderTotals, Client, Vehicle, Company, ServiceItem, Product } from '../../models/models';

interface DraftServiceLine {
  serviceId: number | null;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface DraftProductLine {
  productId: number | null;
  productName: string;
  quantity: number;
  standardPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'workOrders.title' | translate }}</h2>
      <a routerLink="/work-orders/new" class="btn btn-primary">{{ 'workOrders.newWorkOrder' | translate }}</a>
    </div>

    <div class="filter-bar">
      <select [(ngModel)]="statusFilter" (change)="filterOrders()" class="form-control">
        <option value="">{{ 'common.all' | translate }} {{ 'common.status' | translate }}</option>
        <option value="DRAFT">{{ 'invoices.draft' | translate }}</option>
        <option value="OPEN">{{ 'workOrders.open' | translate }}</option>
        <option value="IN_PROGRESS">{{ 'workOrders.inProgress' | translate }}</option>
        <option value="COMPLETED">{{ 'workOrders.completed' | translate }}</option>
        <option value="INVOICED">{{ 'workOrders.invoiced' | translate }}</option>
      </select>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'workOrders.orderNumber' | translate }}</th>
              <th>{{ 'workOrders.client' | translate }}</th>
              <th>{{ 'workOrders.vehicle' | translate }}</th>
              <th>{{ 'common.date' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.total' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
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
                  <span [class]="getStatusClass(order.status)">{{ getStatusLabel(order.status) | translate }}</span>
                </td>
                <td>{{ order.totalAmount | currency }}</td>
                <td class="actions">
                  <a [routerLink]="['/work-orders', order.id]" class="btn btn-sm btn-secondary" (click)="$event.stopPropagation()">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-info" (click)="viewDetails(order); $event.stopPropagation()">{{ 'common.details' | translate }}</button>
                  @if (order.status === 'COMPLETED') {
                    <button class="btn btn-sm btn-primary" (click)="generateInvoice(order); $event.stopPropagation()">{{ 'workOrders.generateInvoice' | translate }}</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">{{ 'workOrders.noWorkOrders' | translate }}</td>
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
            <h3>{{ 'workOrders.title' | translate }} #{{ selectedOrder.id }} {{ 'common.details' | translate }}</h3>
            <button class="btn-close" (click)="showDetails = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="order-info">
              <div class="info-group">
                <label>{{ 'workOrders.client' | translate }}:</label>
                <span>{{ selectedOrder.client?.firstName }} {{ selectedOrder.client?.lastName }}</span>
              </div>
              <div class="info-group">
                <label>{{ 'workOrders.vehicle' | translate }}:</label>
                <span>{{ selectedOrder.vehicle?.registrationNumber }} - {{ selectedOrder.vehicle?.brand }} {{ selectedOrder.vehicle?.model }}</span>
              </div>
              <div class="info-group">
                <label>{{ 'common.status' | translate }}:</label>
                <span [class]="getStatusClass(selectedOrder.status)">{{ getStatusLabel(selectedOrder.status) | translate }}</span>
              </div>
            </div>

            <h4>{{ 'workOrders.servicesSection' | translate }}</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'workOrders.service' | translate }}</th>
                    <th>{{ 'common.quantity' | translate }}</th>
                    <th>{{ 'common.price' | translate }}</th>
                    <th>{{ 'workOrders.lineTotal' | translate }}</th>
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
                    <tr><td colspan="4" class="empty-state">{{ 'workOrders.noWorkOrders' | translate }}</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <h4>{{ 'workOrders.partsSection' | translate }}</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'workOrders.product' | translate }}</th>
                    <th>{{ 'common.quantity' | translate }}</th>
                    <th>{{ 'workOrders.stdPrice' | translate }}</th>
                    <th>{{ 'workOrders.discount' | translate }}</th>
                    <th>{{ 'workOrders.finalPrice' | translate }}</th>
                    <th>{{ 'workOrders.lineTotal' | translate }}</th>
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
                    <tr><td colspan="6" class="empty-state">{{ 'workOrders.noWorkOrders' | translate }}</td></tr>
                  }
                </tbody>
              </table>
            </div>

            @if (orderTotals) {
              <div class="totals-section">
                <div class="totals-row">
                  <span>{{ 'workOrders.servicesSubtotal' | translate }}:</span>
                  <span>{{ orderTotals.servicesSubtotal | currency }}</span>
                </div>
                <div class="totals-row">
                  <span>{{ 'workOrders.partsSubtotal' | translate }}:</span>
                  <span>{{ orderTotals.productsBeforeDiscount | currency }}</span>
                </div>
                @if (orderTotals.productsDiscountTotal > 0) {
                  <div class="totals-row discount">
                    <span>{{ 'workOrders.partsDiscount' | translate }}:</span>
                    <span>-{{ orderTotals.productsDiscountTotal | currency }}</span>
                  </div>
                }
                <div class="totals-row">
                  <span>{{ 'workOrders.partsSection' | translate }}:</span>
                  <span>{{ orderTotals.productsAfterDiscount | currency }}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>{{ 'workOrders.grandTotal' | translate }}:</span>
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
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'workOrders.newWorkOrder' | translate }}</h3>
            <button class="btn-close" (click)="showCreateModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="required">{{ 'workOrders.client' | translate }}</label>
                <select [(ngModel)]="newOrder.clientId" class="form-control">
                  <option [ngValue]="null">{{ 'common.select' | translate }}</option>
                  @for (client of clients; track client.id) {
                    <option [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>{{ 'workOrders.vehicle' | translate }}</label>
                <select [(ngModel)]="newOrder.vehicleId" class="form-control">
                  <option [ngValue]="null">{{ 'workOrders.selectVehicle' | translate }}</option>
                  @for (vehicle of vehicles; track vehicle.id) {
                    <option [ngValue]="vehicle.id">{{ vehicle.registrationNumber }} - {{ vehicle.brand }} {{ vehicle.model }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="required">{{ 'common.date' | translate }}</label>
                <input type="date" [(ngModel)]="newOrder.date" class="form-control">
              </div>
              <div class="form-group">
                <label>{{ 'common.description' | translate }}</label>
                <textarea [(ngModel)]="newOrder.description" class="form-control" rows="2"></textarea>
              </div>
            </div>

            <div class="section-divider">
              <h4>{{ 'workOrders.addService' | translate }}</h4>
            </div>
            <div class="add-line-row">
              <select [(ngModel)]="newServiceLine.serviceId" (change)="onServiceSelect()" class="form-control">
                <option [ngValue]="null">{{ 'common.select' | translate }}</option>
                @for (svc of availableServices; track svc.id) {
                  <option [ngValue]="svc.id">{{ svc.name }} ({{ svc.sellingPrice | currency }})</option>
                }
              </select>
              <input type="number" [(ngModel)]="newServiceLine.quantity" min="1" class="form-control qty-input" [placeholder]="'common.quantity' | translate">
              <button class="btn btn-success btn-sm" (click)="addServiceLine()" [disabled]="!newServiceLine.serviceId || newServiceLine.quantity < 1">{{ 'common.add' | translate }}</button>
            </div>
            @if (draftServiceLines.length > 0) {
              <div class="table-container lines-table">
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'workOrders.service' | translate }}</th>
                      <th>{{ 'common.quantity' | translate }}</th>
                      <th>{{ 'common.price' | translate }}</th>
                      <th>{{ 'common.total' | translate }}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (line of draftServiceLines; track $index; let i = $index) {
                      <tr>
                        <td>{{ line.serviceName }}</td>
                        <td>{{ line.quantity }}</td>
                        <td>{{ line.unitPrice | currency }}</td>
                        <td>{{ line.lineTotal | currency }}</td>
                        <td><button class="btn btn-danger btn-sm" (click)="removeServiceLine(i)">&times;</button></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <div class="section-divider">
              <h4>{{ 'workOrders.addProduct' | translate }}</h4>
            </div>
            <div class="add-line-row">
              <select [(ngModel)]="newProductLine.productId" (change)="onProductSelect()" class="form-control">
                <option [ngValue]="null">{{ 'common.select' | translate }}</option>
                @for (prod of availableProducts; track prod.id) {
                  <option [ngValue]="prod.id">{{ prod.name }} ({{ prod.sellingPrice | currency }})</option>
                }
              </select>
              <input type="number" [(ngModel)]="newProductLine.quantity" min="1" class="form-control qty-input" [placeholder]="'common.quantity' | translate">
              <input type="number" [(ngModel)]="newProductLine.discountPercent" min="0" max="100" class="form-control discount-input" [placeholder]="'workOrders.discount' | translate">
              <button class="btn btn-success btn-sm" (click)="addProductLine()" [disabled]="!newProductLine.productId || newProductLine.quantity < 1">{{ 'common.add' | translate }}</button>
            </div>
            @if (draftProductLines.length > 0) {
              <div class="table-container lines-table">
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'workOrders.product' | translate }}</th>
                      <th>{{ 'common.quantity' | translate }}</th>
                      <th>{{ 'common.price' | translate }}</th>
                      <th>{{ 'workOrders.discount' | translate }}</th>
                      <th>{{ 'workOrders.finalPrice' | translate }}</th>
                      <th>{{ 'common.total' | translate }}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (line of draftProductLines; track $index; let i = $index) {
                      <tr>
                        <td>{{ line.productName }}</td>
                        <td>{{ line.quantity }}</td>
                        <td>{{ line.standardPrice | currency }}</td>
                        <td>
                          @if (line.discountPercent > 0) {
                            <span class="badge badge-success">{{ line.discountPercent }}%</span>
                          } @else {
                            -
                          }
                        </td>
                        <td>{{ line.finalUnitPrice | currency }}</td>
                        <td>{{ line.lineTotal | currency }}</td>
                        <td><button class="btn btn-danger btn-sm" (click)="removeProductLine(i)">&times;</button></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            @if (draftServiceLines.length > 0 || draftProductLines.length > 0) {
              <div class="totals-section">
                <div class="totals-row">
                  <span>{{ 'workOrders.servicesSubtotal' | translate }}:</span>
                  <span>{{ getDraftServicesTotal() | currency }}</span>
                </div>
                <div class="totals-row">
                  <span>{{ 'workOrders.partsSubtotal' | translate }}:</span>
                  <span>{{ getDraftProductsBeforeDiscount() | currency }}</span>
                </div>
                @if (getDraftProductsDiscount() > 0) {
                  <div class="totals-row discount">
                    <span>{{ 'workOrders.partsDiscount' | translate }}:</span>
                    <span>-{{ getDraftProductsDiscount() | currency }}</span>
                  </div>
                }
                <div class="totals-row">
                  <span>{{ 'workOrders.partsSection' | translate }}:</span>
                  <span>{{ getDraftProductsAfterDiscount() | currency }}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>{{ 'workOrders.grandTotal' | translate }}:</span>
                  <span>{{ getDraftGrandTotal() | currency }}</span>
                </div>
              </div>
            }

            <div class="form-actions">
              <button class="btn btn-primary" (click)="createWorkOrder()" [disabled]="!newOrder.clientId || !newOrder.date">{{ 'workOrders.newWorkOrder' | translate }}</button>
              <button class="btn btn-secondary" (click)="showCreateModal = false">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showInvoiceModal && selectedOrder) {
      <div class="modal-overlay" (click)="showInvoiceModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'workOrders.generateInvoice' | translate }}</h3>
            <button class="btn-close" (click)="showInvoiceModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>{{ 'workOrders.generateInvoice' | translate }} {{ 'workOrders.title' | translate }} #{{ selectedOrder.id }}?</p>
            <div class="form-group">
              <label>{{ 'companies.title' | translate }}</label>
              <select [(ngModel)]="invoiceCompanyId" class="form-control">
                <option [ngValue]="null">{{ 'clients.title' | translate }}</option>
                @for (company of companies; track company.id) {
                  <option [ngValue]="company.id">{{ company.name }}</option>
                }
              </select>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" (click)="confirmGenerateInvoice()">{{ 'workOrders.generateInvoice' | translate }}</button>
              <button class="btn btn-secondary" (click)="showInvoiceModal = false">{{ 'common.cancel' | translate }}</button>
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
      color: var(--text);
    }
    .section-divider {
      border-top: 1px solid var(--border);
      margin-top: 1.5rem;
      padding-top: 0.5rem;
    }
    .section-divider h4 {
      margin-top: 0.5rem;
    }
    .add-line-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .add-line-row select {
      flex: 2;
    }
    .qty-input {
      width: 80px !important;
      flex: 0 0 80px;
    }
    .discount-input {
      width: 100px !important;
      flex: 0 0 100px;
    }
    .lines-table {
      margin-bottom: 1rem;
    }
    .lines-table table {
      font-size: 0.9rem;
    }
    .lines-table th, .lines-table td {
      padding: 8px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      .add-line-row {
        flex-wrap: wrap;
      }
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
  availableServices: ServiceItem[] = [];
  availableProducts: Product[] = [];
  
  newOrder = {
    clientId: null as number | null,
    vehicleId: null as number | null,
    date: new Date().toISOString().split('T')[0],
    description: ''
  };

  draftServiceLines: DraftServiceLine[] = [];
  draftProductLines: DraftProductLine[] = [];

  newServiceLine = {
    serviceId: null as number | null,
    quantity: 1
  };

  newProductLine = {
    productId: null as number | null,
    quantity: 1,
    discountPercent: 0
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getWorkOrders().subscribe(data => {
      this.orders = data;
      this.filterOrders();
      this.cdr.detectChanges();
    });
    this.api.getClients().subscribe(data => {
      this.clients = data;
      this.cdr.detectChanges();
    });
    this.api.getVehicles().subscribe(data => {
      this.vehicles = data;
      this.cdr.detectChanges();
    });
    this.api.getCompanies().subscribe(data => {
      this.companies = data;
      this.cdr.detectChanges();
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.resetNewOrder();
    this.api.getServices().subscribe(data => {
      this.availableServices = data.filter(s => s.active !== false);
      this.cdr.detectChanges();
    });
    this.api.getProducts().subscribe(data => {
      this.availableProducts = data.filter(p => p.active !== false);
      this.cdr.detectChanges();
    });
  }

  resetNewOrder() {
    this.newOrder = {
      clientId: null,
      vehicleId: null,
      date: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.draftServiceLines = [];
    this.draftProductLines = [];
    this.newServiceLine = { serviceId: null, quantity: 1 };
    this.newProductLine = { productId: null, quantity: 1, discountPercent: 0 };
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

  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'invoices.draft',
      'OPEN': 'workOrders.open',
      'IN_PROGRESS': 'workOrders.inProgress',
      'COMPLETED': 'workOrders.completed',
      'INVOICED': 'workOrders.invoiced',
      'CANCELLED': 'workOrders.cancelled'
    };
    return labels[status || ''] || 'invoices.draft';
  }

  selectOrder(order: WorkOrder) {
    this.selectedOrder = order;
  }

  viewDetails(order: WorkOrder) {
    this.selectedOrder = order;
    this.showDetails = true;
    
    if (order.id) {
      this.api.getWorkOrderProductLines(order.id).subscribe(data => {
        this.productLines = data;
        this.cdr.detectChanges();
      });
      this.api.getWorkOrderServiceLines(order.id).subscribe(data => {
        this.serviceLines = data;
        this.cdr.detectChanges();
      });
      this.api.getWorkOrderTotals(order.id).subscribe(data => {
        this.orderTotals = data;
        this.cdr.detectChanges();
      });
    }
  }

  generateInvoice(order: WorkOrder) {
    this.selectedOrder = order;
    this.invoiceCompanyId = null;
    this.showInvoiceModal = true;
  }

  confirmGenerateInvoice() {
    if (!this.selectedOrder?.id) return;
    
    this.api.generateInvoiceFromWorkOrder(this.selectedOrder.id, this.invoiceCompanyId || undefined).subscribe({
      next: () => {
        this.showInvoiceModal = false;
        this.loadData();
        alert('Invoice generated successfully!');
      },
      error: (err: any) => {
        alert('Error generating invoice: ' + (err.error?.message || err.message));
      }
    });
  }

  onServiceSelect() {
    this.newServiceLine.quantity = 1;
  }

  onProductSelect() {
    this.newProductLine.quantity = 1;
    this.newProductLine.discountPercent = 0;
  }

  addServiceLine() {
    const service = this.availableServices.find(s => s.id === this.newServiceLine.serviceId);
    if (service && this.newServiceLine.quantity > 0) {
      this.draftServiceLines.push({
        serviceId: service.id!,
        serviceName: service.name,
        quantity: this.newServiceLine.quantity,
        unitPrice: service.sellingPrice || 0,
        lineTotal: (service.sellingPrice || 0) * this.newServiceLine.quantity
      });
      this.newServiceLine = { serviceId: null, quantity: 1 };
    }
  }

  removeServiceLine(index: number) {
    this.draftServiceLines.splice(index, 1);
  }

  addProductLine() {
    const product = this.availableProducts.find(p => p.id === this.newProductLine.productId);
    if (product && this.newProductLine.quantity > 0) {
      const standardPrice = product.sellingPrice || 0;
      const discountPercent = this.newProductLine.discountPercent || 0;
      const finalUnitPrice = standardPrice * (1 - discountPercent / 100);
      this.draftProductLines.push({
        productId: product.id!,
        productName: product.name,
        quantity: this.newProductLine.quantity,
        standardPrice,
        discountPercent,
        finalUnitPrice,
        lineTotal: finalUnitPrice * this.newProductLine.quantity
      });
      this.newProductLine = { productId: null, quantity: 1, discountPercent: 0 };
    }
  }

  removeProductLine(index: number) {
    this.draftProductLines.splice(index, 1);
  }

  getDraftServicesTotal(): number {
    return this.draftServiceLines.reduce((sum, line) => sum + line.lineTotal, 0);
  }

  getDraftProductsBeforeDiscount(): number {
    return this.draftProductLines.reduce((sum, line) => sum + (line.standardPrice * line.quantity), 0);
  }

  getDraftProductsDiscount(): number {
    return this.draftProductLines.reduce((sum, line) => {
      const beforeDiscount = line.standardPrice * line.quantity;
      return sum + (beforeDiscount - line.lineTotal);
    }, 0);
  }

  getDraftProductsAfterDiscount(): number {
    return this.draftProductLines.reduce((sum, line) => sum + line.lineTotal, 0);
  }

  getDraftGrandTotal(): number {
    return this.getDraftServicesTotal() + this.getDraftProductsAfterDiscount();
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
      next: (createdOrder) => {
        this.showCreateModal = false;
        this.loadData();
      },
      error: (err) => {
        alert('Error creating work order: ' + (err.error?.message || err.message));
      }
    });
  }
}
