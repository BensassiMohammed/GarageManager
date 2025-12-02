import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Product, StockMovement } from '../../models/models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'stockManagement.title' | translate }}</h2>
    </div>

    <div class="tabs">
      <button 
        class="tab" 
        [class.active]="activeTab === 'overview'" 
        (click)="activeTab = 'overview'">
        {{ 'stockManagement.stockOverview' | translate }}
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'history'" 
        (click)="activeTab = 'history'">
        {{ 'stockManagement.movementsHistory' | translate }}
      </button>
      <button 
        class="tab" 
        [class.active]="activeTab === 'adjustment'" 
        (click)="activeTab = 'adjustment'">
        {{ 'stockManagement.newAdjustment' | translate }}
      </button>
    </div>

    @if (activeTab === 'overview') {
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ 'products.code' | translate }}</th>
                <th>{{ 'common.name' | translate }}</th>
                <th>{{ 'stockManagement.currentStock' | translate }}</th>
                <th>{{ 'stockManagement.minStock' | translate }}</th>
                <th>{{ 'common.status' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products; track product.id) {
                <tr>
                  <td>{{ product.code }}</td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.currentStock || 0 }}</td>
                  <td>{{ product.minStock || 0 }}</td>
                  <td>
                    @if ((product.currentStock || 0) <= (product.minStock || 0)) {
                      <span class="badge badge-danger">{{ 'products.lowStock' | translate }}</span>
                    } @else {
                      <span class="badge badge-success">{{ 'dashboard.inStock' | translate }}</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-state">{{ 'products.noProducts' | translate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    @if (activeTab === 'history') {
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ 'common.date' | translate }}</th>
                <th>{{ 'stockManagement.product' | translate }}</th>
                <th>{{ 'common.type' | translate }}</th>
                <th>{{ 'common.quantity' | translate }}</th>
                <th>{{ 'stockManagement.reason' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (movement of movements; track movement.id) {
                <tr>
                  <td>{{ formatDate(movement.date) }}</td>
                  <td>{{ movement.product?.name || '-' }}</td>
                  <td>
                    <span [class]="getMovementTypeClass(movement.type)">
                      {{ getMovementTypeLabel(movement.type) | translate }}
                    </span>
                  </td>
                  <td [class]="movement.quantityDelta > 0 ? 'positive' : 'negative'">
                    {{ movement.quantityDelta > 0 ? '+' : '' }}{{ movement.quantityDelta }}
                  </td>
                  <td>{{ movement.reason || '-' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-state">{{ 'stockManagement.noMovements' | translate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    @if (activeTab === 'adjustment') {
      <div class="card">
        <h3 class="section-title">{{ 'stockManagement.newAdjustment' | translate }}</h3>
        
        <form (ngSubmit)="recordAdjustment()">
          <div class="form-row">
            <div class="form-group">
              <label class="required">{{ 'stockManagement.product' | translate }}</label>
              <select [(ngModel)]="adjustment.productId" name="productId" class="form-control" required>
                <option [ngValue]="null">{{ 'stockManagement.selectProduct' | translate }}</option>
                @for (product of products; track product.id) {
                  <option [ngValue]="product.id">{{ product.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="required">{{ 'stockManagement.movementType' | translate }}</label>
              <select [(ngModel)]="adjustment.type" name="type" class="form-control" required>
                <option value="ADJUSTMENT">{{ 'stockManagement.adjustment' | translate }}</option>
                <option value="PURCHASE">{{ 'stockManagement.purchase' | translate }}</option>
                <option value="CONSUMPTION">{{ 'stockManagement.sale' | translate }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="required">{{ 'stockManagement.quantityChange' | translate }}</label>
              <input 
                type="number" 
                [(ngModel)]="adjustment.quantityDelta" 
                name="quantityDelta" 
                class="form-control" 
                placeholder="0"
                required>
              <small class="form-hint">{{ 'stockManagement.quantityChange' | translate }}</small>
            </div>
            <div class="form-group">
              <label>{{ 'stockManagement.reason' | translate }}</label>
              <input 
                type="text" 
                [(ngModel)]="adjustment.reason" 
                name="reason" 
                class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label>{{ 'common.notes' | translate }}</label>
            <textarea 
              [(ngModel)]="adjustment.notes" 
              name="notes" 
              class="form-control" 
              rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="!isFormValid()">
              {{ 'stockManagement.newAdjustment' | translate }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 1.5rem;
      background: var(--surface);
      border-radius: 8px;
      padding: 4px;
      width: fit-content;
    }
    .tab {
      padding: 0.75rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      border-radius: 6px;
      transition: all 0.2s;
    }
    .tab:hover {
      color: var(--text);
      background: var(--surface-hover);
    }
    .tab.active {
      background: var(--primary);
      color: white;
    }
    .section-title {
      margin: 0 0 1.5rem 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text);
    }
    .form-group label.required::after {
      content: ' *';
      color: var(--danger);
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 1rem;
      background: var(--background);
      color: var(--text);
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    .form-hint {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }
    .form-actions {
      margin-top: 1.5rem;
    }
    .positive {
      color: var(--success);
      font-weight: 500;
    }
    .negative {
      color: var(--danger);
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .tabs {
        width: 100%;
        flex-wrap: wrap;
      }
      .tab {
        flex: 1;
        text-align: center;
        min-width: 100px;
      }
    }
  `]
})
export class InventoryListComponent implements OnInit {
  products: Product[] = [];
  movements: StockMovement[] = [];
  activeTab: 'overview' | 'history' | 'adjustment' = 'overview';
  
  adjustment = {
    productId: null as number | null,
    type: 'ADJUSTMENT',
    quantityDelta: null as number | null,
    reason: '',
    notes: ''
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getProducts().subscribe({
      next: data => {
        this.products = data || [];
        this.cdr.detectChanges();
      },
      error: () => this.products = []
    });
    this.api.getStockMovements().subscribe({
      next: data => {
        this.movements = (data || []).sort((a, b) => {
          const dateA = this.parseDate(a.date);
          const dateB = this.parseDate(b.date);
          return dateB - dateA;
        });
        this.cdr.detectChanges();
      },
      error: () => this.movements = []
    });
  }

  parseDate(dateValue: any): number {
    if (!dateValue) return 0;
    if (typeof dateValue === 'string') {
      return new Date(dateValue).getTime();
    }
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      return new Date(year, month - 1, day, hour, minute, second).getTime();
    }
    return new Date(dateValue).getTime();
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return '-';
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const [year, month, day, hour = 0, minute = 0] = dateValue;
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(dateValue);
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  getMovementTypeClass(type?: string): string {
    switch (type) {
      case 'PURCHASE': return 'badge badge-success';
      case 'CONSUMPTION': return 'badge badge-warning';
      case 'ADJUSTMENT': return 'badge badge-info';
      default: return 'badge badge-secondary';
    }
  }

  getMovementTypeLabel(type?: string): string {
    const labels: { [key: string]: string } = {
      'PURCHASE': 'stockManagement.purchase',
      'CONSUMPTION': 'stockManagement.sale',
      'ADJUSTMENT': 'stockManagement.adjustment'
    };
    return labels[type || ''] || 'stockManagement.adjustment';
  }

  isFormValid(): boolean {
    return this.adjustment.productId !== null && 
           this.adjustment.quantityDelta !== null && 
           this.adjustment.quantityDelta !== 0;
  }

  recordAdjustment() {
    if (!this.isFormValid()) {
      return;
    }

    const reasonParts = [];
    if (this.adjustment.reason) reasonParts.push(this.adjustment.reason);
    if (this.adjustment.notes) reasonParts.push(this.adjustment.notes);

    const movement = {
      product: { id: this.adjustment.productId },
      type: this.adjustment.type,
      quantityDelta: this.adjustment.quantityDelta,
      reason: reasonParts.join(' - ') || null,
      date: new Date().toISOString()
    };

    this.api.createStockMovement(movement).subscribe({
      next: () => {
        this.resetAdjustment();
        this.loadData();
        this.activeTab = 'history';
        alert('Stock adjustment recorded successfully!');
      },
      error: (err) => {
        alert('Error recording adjustment: ' + (err.error?.message || err.message));
      }
    });
  }

  resetAdjustment() {
    this.adjustment = {
      productId: null,
      type: 'ADJUSTMENT',
      quantityDelta: null,
      reason: '',
      notes: ''
    };
  }
}
