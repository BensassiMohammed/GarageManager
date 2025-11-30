import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { WorkOrder, WorkOrderProductLine, WorkOrderServiceLine, Client, Vehicle, ServiceItem, Product } from '../../models/models';
import { forkJoin } from 'rxjs';

interface DraftServiceLine {
  serviceId: number | null;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
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
  selector: 'app-work-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ (isEdit ? 'workOrders.editWorkOrder' : 'workOrders.newWorkOrder') | translate }}</h2>
    </div>

    <div class="card work-order-form">
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="required">{{ 'workOrders.client' | translate }}</label>
            <select [(ngModel)]="workOrder.clientId" class="form-control" (change)="onClientChange()">
              <option [ngValue]="null">{{ 'common.select' | translate }}</option>
              @for (client of clients; track client.id) {
                <option [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="required">{{ 'workOrders.vehicle' | translate }}</label>
            <select [(ngModel)]="workOrder.vehicleId" class="form-control">
              <option [ngValue]="null">{{ 'workOrders.selectVehicle' | translate }}</option>
              @for (vehicle of filteredVehicles; track vehicle.id) {
                <option [ngValue]="vehicle.id">{{ vehicle.registrationNumber }} - {{ vehicle.brand }} {{ vehicle.model }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="required">{{ 'common.date' | translate }}</label>
            <input type="date" [(ngModel)]="workOrder.date" class="form-control">
          </div>
          <div class="form-group">
            <label>{{ 'common.status' | translate }}</label>
            <select [(ngModel)]="workOrder.status" class="form-control">
              <option value="DRAFT">{{ 'invoices.draft' | translate }}</option>
              <option value="OPEN">{{ 'workOrders.open' | translate }}</option>
              <option value="IN_PROGRESS">{{ 'workOrders.inProgress' | translate }}</option>
              <option value="COMPLETED">{{ 'workOrders.completed' | translate }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>{{ 'common.description' | translate }}</label>
          <textarea [(ngModel)]="workOrder.description" class="form-control" rows="2"></textarea>
        </div>
      </div>

      <div class="section-header">
        <h3>{{ 'workOrders.servicesSection' | translate }}</h3>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'workOrders.service' | translate }}</th>
              <th class="col-qty">{{ 'common.quantity' | translate }}</th>
              <th class="col-price">{{ 'workOrders.stdPrice' | translate }}</th>
              <th class="col-discount">{{ 'workOrders.discount' | translate }}</th>
              <th class="col-price">{{ 'workOrders.finalPrice' | translate }}</th>
              <th class="col-total">{{ 'common.total' | translate }}</th>
              <th class="col-action"></th>
            </tr>
          </thead>
          <tbody>
            @for (line of draftServiceLines; track $index; let i = $index) {
              <tr>
                <td>{{ line.serviceName }}</td>
                <td class="col-qty">{{ line.quantity }}</td>
                <td class="col-price">{{ line.unitPrice | currency }}</td>
                <td class="col-discount">
                  @if (line.discountPercent > 0) {
                    <span class="discount-badge">{{ line.discountPercent }}%</span>
                  } @else {
                    -
                  }
                </td>
                <td class="col-price">{{ line.finalUnitPrice | currency }}</td>
                <td class="col-total">{{ line.lineTotal | currency }}</td>
                <td class="col-action">
                  <button class="btn btn-danger btn-sm" (click)="removeServiceLine(i)">&times;</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-row">{{ 'workOrders.noWorkOrders' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <button class="btn btn-add" (click)="showAddServiceModal = true">+ {{ 'workOrders.addService' | translate }}</button>

      <div class="section-header">
        <h3>{{ 'workOrders.partsSection' | translate }}</h3>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'workOrders.product' | translate }}</th>
              <th class="col-qty">{{ 'common.quantity' | translate }}</th>
              <th class="col-price">{{ 'workOrders.stdPrice' | translate }}</th>
              <th class="col-discount">{{ 'workOrders.discount' | translate }}</th>
              <th class="col-price">{{ 'workOrders.finalPrice' | translate }}</th>
              <th class="col-total">{{ 'common.total' | translate }}</th>
              <th class="col-action"></th>
            </tr>
          </thead>
          <tbody>
            @for (line of draftProductLines; track $index; let i = $index) {
              <tr>
                <td>{{ line.productName }}</td>
                <td class="col-qty">{{ line.quantity }}</td>
                <td class="col-price">{{ line.standardPrice | currency }}</td>
                <td class="col-discount">
                  @if (line.discountPercent > 0) {
                    <span class="discount-badge">{{ line.discountPercent }}%</span>
                  } @else {
                    -
                  }
                </td>
                <td class="col-price">{{ line.finalUnitPrice | currency }}</td>
                <td class="col-total">{{ line.lineTotal | currency }}</td>
                <td class="col-action">
                  <button class="btn btn-danger btn-sm" (click)="removeProductLine(i)">&times;</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-row">{{ 'workOrders.noWorkOrders' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <button class="btn btn-add" (click)="showAddProductModal = true">+ {{ 'workOrders.addProduct' | translate }}</button>

      <div class="totals-section">
        <div class="totals-row">
          <span>{{ 'workOrders.servicesSubtotal' | translate }}:</span>
          <span>{{ getServicesBeforeDiscount() | currency }}</span>
        </div>
        <div class="totals-row discount-row">
          <span>{{ 'workOrders.servicesDiscount' | translate }}:</span>
          <span>-{{ getServicesDiscount() | currency }}</span>
        </div>
        <div class="totals-row">
          <span>{{ 'workOrders.partsSubtotal' | translate }}:</span>
          <span>{{ getProductsBeforeDiscount() | currency }}</span>
        </div>
        <div class="totals-row discount-row">
          <span>{{ 'workOrders.partsDiscount' | translate }}:</span>
          <span>-{{ getProductsDiscount() | currency }}</span>
        </div>
        <div class="totals-row grand-total-row">
          <span>{{ 'workOrders.grandTotal' | translate }}:</span>
          <span>{{ getGrandTotal() | currency }}</span>
        </div>
      </div>

      <div class="form-group notes-section">
        <label>{{ 'common.notes' | translate }}</label>
        <textarea [(ngModel)]="workOrder.notes" class="form-control notes-textarea" rows="3"></textarea>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" (click)="save()" [disabled]="!canSave()">{{ 'common.save' | translate }}</button>
        <a routerLink="/work-orders" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
      </div>
    </div>

    @if (showAddServiceModal) {
      <div class="modal-overlay" (click)="showAddServiceModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'workOrders.addService' | translate }}</h3>
            <button class="btn-close" (click)="showAddServiceModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="required">{{ 'workOrders.service' | translate }}</label>
              <select [(ngModel)]="newServiceLine.serviceId" (change)="onServiceSelect()" class="form-control">
                <option [ngValue]="null">{{ 'common.select' | translate }}</option>
                @for (svc of availableServices; track svc.id) {
                  <option [ngValue]="svc.id">{{ svc.name }} ({{ svc.sellingPrice | currency }})</option>
                }
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="required">{{ 'common.quantity' | translate }}</label>
                <input type="number" [(ngModel)]="newServiceLine.quantity" min="1" class="form-control">
              </div>
              <div class="form-group">
                <label>{{ 'workOrders.discount' | translate }}</label>
                <input type="number" [(ngModel)]="newServiceLine.discountPercent" min="0" max="100" class="form-control">
              </div>
            </div>
            @if (newServiceLine.serviceId) {
              <div class="line-preview">
                <span>{{ 'workOrders.stdPrice' | translate }}: {{ getSelectedServicePrice() | currency }}</span>
                <span>{{ 'workOrders.finalPrice' | translate }}: {{ getSelectedServiceFinalPrice() | currency }}</span>
                <span>{{ 'workOrders.lineTotal' | translate }}: {{ getSelectedServiceLineTotal() | currency }}</span>
              </div>
            }
            <div class="form-actions">
              <button class="btn btn-primary" (click)="addServiceLine()" [disabled]="!newServiceLine.serviceId || newServiceLine.quantity < 1">{{ 'workOrders.addService' | translate }}</button>
              <button class="btn btn-secondary" (click)="showAddServiceModal = false">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showAddProductModal) {
      <div class="modal-overlay" (click)="showAddProductModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'workOrders.addProduct' | translate }}</h3>
            <button class="btn-close" (click)="showAddProductModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="required">{{ 'workOrders.product' | translate }}</label>
              <select [(ngModel)]="newProductLine.productId" (change)="onProductSelect()" class="form-control">
                <option [ngValue]="null">{{ 'common.select' | translate }}</option>
                @for (prod of availableProducts; track prod.id) {
                  <option [ngValue]="prod.id">{{ prod.name }} ({{ prod.sellingPrice | currency }})</option>
                }
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="required">{{ 'common.quantity' | translate }}</label>
                <input type="number" [(ngModel)]="newProductLine.quantity" min="1" class="form-control">
              </div>
              <div class="form-group">
                <label>{{ 'workOrders.discount' | translate }}</label>
                <input type="number" [(ngModel)]="newProductLine.discountPercent" min="0" max="100" class="form-control">
              </div>
            </div>
            @if (newProductLine.productId) {
              <div class="line-preview">
                <span>{{ 'workOrders.stdPrice' | translate }}: {{ getSelectedProductPrice() | currency }}</span>
                <span>{{ 'workOrders.finalPrice' | translate }}: {{ getSelectedProductFinalPrice() | currency }}</span>
                <span>{{ 'workOrders.lineTotal' | translate }}: {{ getSelectedProductLineTotal() | currency }}</span>
              </div>
            }
            <div class="form-actions">
              <button class="btn btn-primary" (click)="addProductLine()" [disabled]="!newProductLine.productId || newProductLine.quantity < 1">{{ 'workOrders.addProduct' | translate }}</button>
              <button class="btn btn-secondary" (click)="showAddProductModal = false">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .work-order-form {
      max-width: 1000px;
    }
    .form-section {
      margin-bottom: 1.5rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .section-header {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .section-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
    }
    .table-container {
      margin-bottom: 0.5rem;
    }
    .table-container table {
      font-size: 0.9rem;
    }
    .col-qty { width: 60px; text-align: center; }
    .col-price { width: 100px; text-align: right; }
    .col-discount { width: 80px; text-align: center; }
    .col-total { width: 100px; text-align: right; font-weight: 600; }
    .col-action { width: 40px; text-align: center; }
    .empty-row {
      color: var(--text-muted);
      font-style: italic;
      text-align: center;
    }
    .btn-add {
      background: none;
      border: 1px dashed var(--primary);
      color: var(--primary);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .btn-add:hover {
      background: rgba(67, 56, 202, 0.05);
    }
    .discount-badge {
      background: var(--success);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .totals-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
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
    .discount-row {
      color: var(--success);
    }
    .grand-total-row {
      font-weight: bold;
      font-size: 1.1rem;
      color: var(--primary);
      padding-top: 0.75rem;
    }
    .notes-section {
      margin-top: 1rem;
    }
    .notes-textarea {
      resize: vertical;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .line-preview {
      display: flex;
      gap: 1.5rem;
      padding: 0.75rem;
      background: var(--surface);
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .line-preview span {
      color: var(--text-muted);
    }
    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WorkOrderFormComponent implements OnInit {
  isEdit = false;
  workOrderId?: number;
  
  workOrder = {
    clientId: null as number | null,
    vehicleId: null as number | null,
    date: new Date().toISOString().split('T')[0],
    status: 'DRAFT',
    description: '',
    notes: ''
  };

  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  availableServices: ServiceItem[] = [];
  availableProducts: Product[] = [];

  draftServiceLines: DraftServiceLine[] = [];
  draftProductLines: DraftProductLine[] = [];

  showAddServiceModal = false;
  showAddProductModal = false;

  newServiceLine = {
    serviceId: null as number | null,
    quantity: 1,
    discountPercent: 0
  };

  newProductLine = {
    productId: null as number | null,
    quantity: 1,
    discountPercent: 0
  };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDropdownData();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.workOrderId = +id;
      this.loadWorkOrder();
    }
  }

  loadDropdownData() {
    forkJoin({
      clients: this.api.getClients(),
      vehicles: this.api.getVehicles(),
      services: this.api.getServices(),
      products: this.api.getProducts()
    }).subscribe(({ clients, vehicles, services, products }) => {
      this.clients = clients;
      this.vehicles = vehicles;
      this.filteredVehicles = vehicles;
      this.availableServices = services.filter(s => s.active !== false);
      this.availableProducts = products.filter(p => p.active !== false);
      this.cdr.detectChanges();
    });
  }

  loadWorkOrder() {
    if (!this.workOrderId) return;
    
    forkJoin({
      workOrder: this.api.getWorkOrder(this.workOrderId),
      serviceLines: this.api.getWorkOrderServiceLines(this.workOrderId),
      productLines: this.api.getWorkOrderProductLines(this.workOrderId)
    }).subscribe(({ workOrder, serviceLines, productLines }) => {
      this.workOrder = {
        clientId: workOrder.client?.id || null,
        vehicleId: workOrder.vehicle?.id || null,
        date: workOrder.date || new Date().toISOString().split('T')[0],
        status: workOrder.status || 'PENDING',
        description: workOrder.description || '',
        notes: (workOrder as any).notes || ''
      };
      
      this.draftServiceLines = serviceLines.map(line => ({
        serviceId: line.service?.id || null,
        serviceName: line.service?.name || '',
        quantity: line.quantity,
        unitPrice: line.unitPrice || 0,
        discountPercent: (line as any).discountPercent || 0,
        finalUnitPrice: (line as any).finalUnitPrice || line.unitPrice || 0,
        lineTotal: line.lineTotal || 0
      }));
      
      this.draftProductLines = productLines.map(line => ({
        productId: line.product?.id || null,
        productName: line.product?.name || '',
        quantity: line.quantity,
        standardPrice: line.standardPrice || 0,
        discountPercent: line.discountPercent || 0,
        finalUnitPrice: line.finalUnitPrice || 0,
        lineTotal: line.lineTotal || 0
      }));
      
      this.onClientChange();
      this.cdr.detectChanges();
    });
  }

  onClientChange() {
    if (this.workOrder.clientId) {
      this.filteredVehicles = this.vehicles.filter(v => 
        v.currentOwner?.id === this.workOrder.clientId || !v.currentOwner
      );
    } else {
      this.filteredVehicles = this.vehicles;
    }
  }

  onServiceSelect() {
    this.newServiceLine.quantity = 1;
    this.newServiceLine.discountPercent = 0;
  }

  onProductSelect() {
    this.newProductLine.quantity = 1;
    this.newProductLine.discountPercent = 0;
  }

  getSelectedServicePrice(): number {
    const service = this.availableServices.find(s => s.id === this.newServiceLine.serviceId);
    return service?.sellingPrice || 0;
  }

  getSelectedServiceFinalPrice(): number {
    const stdPrice = this.getSelectedServicePrice();
    const discount = this.newServiceLine.discountPercent || 0;
    return stdPrice * (1 - discount / 100);
  }

  getSelectedServiceLineTotal(): number {
    return this.getSelectedServiceFinalPrice() * this.newServiceLine.quantity;
  }

  getSelectedProductPrice(): number {
    const product = this.availableProducts.find(p => p.id === this.newProductLine.productId);
    return product?.sellingPrice || 0;
  }

  getSelectedProductFinalPrice(): number {
    const stdPrice = this.getSelectedProductPrice();
    const discount = this.newProductLine.discountPercent || 0;
    return stdPrice * (1 - discount / 100);
  }

  getSelectedProductLineTotal(): number {
    return this.getSelectedProductFinalPrice() * this.newProductLine.quantity;
  }

  addServiceLine() {
    const service = this.availableServices.find(s => s.id === this.newServiceLine.serviceId);
    if (service && this.newServiceLine.quantity > 0) {
      const unitPrice = service.sellingPrice || 0;
      const discountPercent = this.newServiceLine.discountPercent || 0;
      const finalUnitPrice = unitPrice * (1 - discountPercent / 100);
      this.draftServiceLines.push({
        serviceId: service.id!,
        serviceName: service.name,
        quantity: this.newServiceLine.quantity,
        unitPrice: unitPrice,
        discountPercent: discountPercent,
        finalUnitPrice: finalUnitPrice,
        lineTotal: finalUnitPrice * this.newServiceLine.quantity
      });
      this.newServiceLine = { serviceId: null, quantity: 1, discountPercent: 0 };
      this.showAddServiceModal = false;
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
        standardPrice: standardPrice,
        discountPercent: discountPercent,
        finalUnitPrice: finalUnitPrice,
        lineTotal: finalUnitPrice * this.newProductLine.quantity
      });
      this.newProductLine = { productId: null, quantity: 1, discountPercent: 0 };
      this.showAddProductModal = false;
    }
  }

  removeProductLine(index: number) {
    this.draftProductLines.splice(index, 1);
  }

  getServicesBeforeDiscount(): number {
    return this.draftServiceLines.reduce((sum, line) => sum + (line.unitPrice * line.quantity), 0);
  }

  getServicesDiscount(): number {
    return this.draftServiceLines.reduce((sum, line) => {
      const beforeDiscount = line.unitPrice * line.quantity;
      return sum + (beforeDiscount - line.lineTotal);
    }, 0);
  }

  getServicesAfterDiscount(): number {
    return this.draftServiceLines.reduce((sum, line) => sum + line.lineTotal, 0);
  }

  getProductsBeforeDiscount(): number {
    return this.draftProductLines.reduce((sum, line) => sum + (line.standardPrice * line.quantity), 0);
  }

  getProductsDiscount(): number {
    return this.draftProductLines.reduce((sum, line) => {
      const beforeDiscount = line.standardPrice * line.quantity;
      return sum + (beforeDiscount - line.lineTotal);
    }, 0);
  }

  getProductsAfterDiscount(): number {
    return this.draftProductLines.reduce((sum, line) => sum + line.lineTotal, 0);
  }

  getGrandTotal(): number {
    return this.getServicesAfterDiscount() + this.getProductsAfterDiscount();
  }

  canSave(): boolean {
    return !!this.workOrder.clientId && !!this.workOrder.date;
  }

  save() {
    if (!this.canSave()) return;
    
    const data: any = {
      date: this.workOrder.date,
      status: this.workOrder.status,
      description: this.workOrder.description,
      notes: this.workOrder.notes
    };
    
    if (this.workOrder.clientId) {
      data.client = { id: this.workOrder.clientId };
    }
    if (this.workOrder.vehicleId) {
      data.vehicle = { id: this.workOrder.vehicleId };
    }
    
    const request = this.isEdit 
      ? this.api.updateWorkOrder(this.workOrderId!, data)
      : this.api.createWorkOrder(data);
    
    request.subscribe({
      next: (savedOrder) => {
        const orderId = this.workOrderId || savedOrder.id;
        this.saveLines(orderId!);
      },
      error: (err) => {
        alert('Error saving work order: ' + (err.error?.message || err.message));
      }
    });
  }

  saveLines(orderId: number) {
    const serviceLineRequests = this.draftServiceLines.map(line => 
      this.api.addWorkOrderServiceLine(orderId, line.serviceId!, line.quantity, line.discountPercent)
    );
    
    const productLineRequests = this.draftProductLines.map(line => 
      this.api.addWorkOrderProductLine(orderId, line.productId!, line.quantity, line.discountPercent)
    );
    
    if (serviceLineRequests.length === 0 && productLineRequests.length === 0) {
      this.router.navigate(['/work-orders']);
      return;
    }
    
    forkJoin([...serviceLineRequests, ...productLineRequests]).subscribe({
      next: () => {
        this.router.navigate(['/work-orders']);
      },
      error: (err) => {
        alert('Work order saved but some lines failed: ' + (err.message || err));
        this.router.navigate(['/work-orders']);
      }
    });
  }
}
