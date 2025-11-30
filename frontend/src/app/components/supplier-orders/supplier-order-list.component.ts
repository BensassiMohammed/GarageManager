import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SupplierOrder, SupplierOrderLine, Supplier, Product } from '../../models/models';

@Component({
  selector: 'app-supplier-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Supplier Orders</h2>
      <button class="btn btn-primary" (click)="showCreateModal = true">New Order</button>
    </div>

    <div class="filter-bar">
      <select [(ngModel)]="statusFilter" (change)="filterOrders()" class="form-control">
        <option value="">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="ORDERED">Ordered</option>
        <option value="RECEIVED">Received</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (order of filteredOrders; track order.id) {
              <tr [class.selected]="selectedOrder?.id === order.id">
                <td>{{ order.id }}</td>
                <td>{{ order.supplier?.name || '-' }}</td>
                <td>{{ order.orderDate }}</td>
                <td>
                  <span [class]="getStatusClass(order.status)">{{ order.status }}</span>
                </td>
                <td>{{ order.totalAmount | currency }}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" (click)="viewDetails(order)">Details</button>
                  @if (order.status === 'ORDERED') {
                    <button class="btn btn-sm btn-success" (click)="receiveOrder(order)">Receive</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No supplier orders found</td>
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
            <h3>Supplier Order #{{ selectedOrder.id }}</h3>
            <button class="btn-close" (click)="showDetails = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="order-info">
              <div class="info-group">
                <label>Supplier:</label>
                <span>{{ selectedOrder.supplier?.name }}</span>
              </div>
              <div class="info-group">
                <label>Order Date:</label>
                <span>{{ selectedOrder.orderDate }}</span>
              </div>
              <div class="info-group">
                <label>Status:</label>
                <span [class]="getStatusClass(selectedOrder.status)">{{ selectedOrder.status }}</span>
              </div>
            </div>

            <h4>Order Lines</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of orderLines; track line.id) {
                    <tr>
                      <td>{{ line.product?.name }}</td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ line.unitPrice | currency }}</td>
                      <td>{{ line.lineTotal | currency }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="empty-state">No order lines</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="order-total">
              <span>Order Total:</span>
              <span class="total-value">{{ selectedOrder.totalAmount | currency }}</span>
            </div>

            @if (selectedOrder.status === 'ORDERED') {
              <div class="receive-section">
                <p>Receiving this order will:</p>
                <ul>
                  <li>Update stock levels for all products</li>
                  <li>Create stock movement records</li>
                  <li>Mark the order as RECEIVED</li>
                </ul>
                <button class="btn btn-success" (click)="confirmReceive()">Confirm Receipt</button>
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
            <h3>Create Supplier Order</h3>
            <button class="btn-close" (click)="showCreateModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="required">Supplier</label>
              <select [(ngModel)]="newOrder.supplierId" class="form-control">
                <option [ngValue]="null">-- Select Supplier --</option>
                @for (supplier of suppliers; track supplier.id) {
                  <option [ngValue]="supplier.id">{{ supplier.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="required">Order Date</label>
              <input type="date" [(ngModel)]="newOrder.orderDate" class="form-control">
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" (click)="createOrder()" [disabled]="!newOrder.supplierId || !newOrder.orderDate">Create</button>
              <button class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
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
    .order-total {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem;
      margin-top: 1rem;
      background: var(--surface);
      border-radius: 8px;
      font-size: 1.25rem;
    }
    .total-value {
      font-weight: bold;
      color: var(--primary);
    }
    .receive-section {
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
    }
    .receive-section ul {
      margin: 0.5rem 0 1rem 1.5rem;
    }
    .modal-lg {
      max-width: 800px;
    }
    h4 {
      margin: 1.5rem 0 1rem;
    }
  `]
})
export class SupplierOrderListComponent implements OnInit {
  orders: SupplierOrder[] = [];
  filteredOrders: SupplierOrder[] = [];
  selectedOrder: SupplierOrder | null = null;
  orderLines: SupplierOrderLine[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  
  statusFilter = '';
  showDetails = false;
  showCreateModal = false;
  
  newOrder = {
    supplierId: null as number | null,
    orderDate: new Date().toISOString().split('T')[0]
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getSupplierOrders().subscribe(data => {
      this.orders = data;
      this.filterOrders();
      this.cdr.detectChanges();
    });
    this.api.getSuppliers().subscribe(data => {
      this.suppliers = data;
      this.cdr.detectChanges();
    });
    this.api.getProducts().subscribe(data => {
      this.products = data;
      this.cdr.detectChanges();
    });
  }

  filterOrders() {
    this.filteredOrders = this.statusFilter 
      ? this.orders.filter(o => o.status === this.statusFilter)
      : this.orders;
  }

  getStatusClass(status?: string): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'badge badge-secondary',
      'ORDERED': 'badge badge-info',
      'RECEIVED': 'badge badge-success',
      'CANCELLED': 'badge badge-danger'
    };
    return classes[status || ''] || 'badge badge-secondary';
  }

  viewDetails(order: SupplierOrder) {
    this.selectedOrder = order;
    this.showDetails = true;
    
    if (order.id) {
      this.api.getSupplierOrderLines(order.id).subscribe(data => {
        this.orderLines = data;
        this.cdr.detectChanges();
      });
    }
  }

  receiveOrder(order: SupplierOrder) {
    this.selectedOrder = order;
    this.showDetails = true;
    if (order.id) {
      this.api.getSupplierOrderLines(order.id).subscribe(data => {
        this.orderLines = data;
        this.cdr.detectChanges();
      });
    }
  }

  confirmReceive() {
    if (this.selectedOrder?.id && confirm('Confirm receipt of this order? This will update stock levels.')) {
      this.api.receiveSupplierOrder(this.selectedOrder.id).subscribe({
        next: () => {
          this.showDetails = false;
          this.loadData();
          alert('Order received successfully! Stock levels have been updated.');
        },
        error: (err) => {
          alert('Error receiving order: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  createOrder() {
    const data: any = {
      orderDate: this.newOrder.orderDate,
      status: 'DRAFT'
    };
    
    if (this.newOrder.supplierId) {
      data.supplier = { id: this.newOrder.supplierId };
    }
    
    this.api.createSupplierOrder(data).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newOrder = {
          supplierId: null,
          orderDate: new Date().toISOString().split('T')[0]
        };
        this.loadData();
      },
      error: (err) => {
        alert('Error creating order: ' + (err.error?.message || err.message));
      }
    });
  }
}
