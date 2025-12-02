import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Category, ProductPriceHistory } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ (isEdit ? 'products.editProduct' : 'products.newProduct') | translate }}</h2>
    </div>

    <div class="card">
      @if (isEdit) {
        <div class="tabs">
          <button [class.active]="activeTab === 'details'" (click)="activeTab = 'details'">{{ 'products.details' | translate }}</button>
          <button [class.active]="activeTab === 'pricing'" (click)="activeTab = 'pricing'">{{ 'products.priceHistory' | translate }}</button>
          <button [class.active]="activeTab === 'stock'" (click)="activeTab = 'stock'">{{ 'products.stockInfo' | translate }}</button>
        </div>
      }

      @if (activeTab === 'details') {
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label class="required">{{ 'products.code' | translate }}</label>
              <input type="text" formControlName="code" class="form-control">
            </div>
            <div class="form-group">
              <label class="required">{{ 'common.name' | translate }}</label>
              <input type="text" formControlName="name" class="form-control">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>{{ 'products.barcode' | translate }}</label>
              <input type="text" formControlName="barcode" class="form-control">
            </div>
            <div class="form-group">
              <label>{{ 'products.brand' | translate }}</label>
              <input type="text" formControlName="brand" class="form-control">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ 'common.category' | translate }}</label>
              <select formControlName="categoryId" class="form-control">
                <option [ngValue]="null">-- {{ 'common.select' | translate }} --</option>
                @for (cat of categories; track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>{{ 'products.vehicleCompatibility' | translate }}</label>
              <input type="text" formControlName="vehicleCompatibility" class="form-control" placeholder="e.g. Toyota, Honda">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ 'products.buyingPrice' | translate }}</label>
              <input type="number" step="0.01" formControlName="buyingPrice" class="form-control" placeholder="0.00">
            </div>
            @if (!isEdit) {
              <div class="form-group">
                <label class="required">{{ 'products.sellingPrice' | translate }}</label>
                <input type="number" step="0.01" formControlName="sellingPrice" class="form-control" placeholder="0.00">
              </div>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ 'products.expirationDate' | translate }}</label>
              <input type="date" formControlName="expirationDate" class="form-control">
            </div>
            <div class="form-group">
              <label>{{ 'products.volume' | translate }}</label>
              <input type="text" formControlName="volume" class="form-control" placeholder="e.g. 5L, 10KG">
            </div>
          </div>

          <div class="form-group">
            <label>{{ 'products.minStock' | translate }}</label>
            <input type="number" formControlName="minStock" class="form-control">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" formControlName="active"> {{ 'common.active' | translate }}
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
            <a routerLink="/products" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
          </div>
        </form>
      }

      @if (activeTab === 'pricing') {
        <div class="price-section">
          <div class="current-price-card">
            <h4>{{ 'common.price' | translate }}</h4>
            <div class="price-display">{{ currentPrice | currency }}</div>
          </div>

          <div class="change-price-form">
            <h4>{{ 'products.addPrice' | translate }}</h4>
            <form [formGroup]="priceForm" (ngSubmit)="addNewPrice()">
              <div class="form-row">
                <div class="form-group">
                  <label class="required">{{ 'common.price' | translate }}</label>
                  <input type="number" step="0.01" formControlName="price" class="form-control">
                </div>
                <div class="form-group">
                  <label>{{ 'products.effectiveDate' | translate }}</label>
                  <input type="date" formControlName="startDate" class="form-control">
                </div>
                <div class="form-group">
                  <button type="submit" class="btn btn-primary" [disabled]="priceForm.invalid">{{ 'common.save' | translate }}</button>
                </div>
              </div>
            </form>
          </div>

          <h4>{{ 'products.priceHistory' | translate }}</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>{{ 'common.price' | translate }}</th>
                  <th>{{ 'common.date' | translate }}</th>
                  <th>{{ 'common.date' | translate }}</th>
                  <th>{{ 'common.status' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (history of priceHistory; track history.id) {
                  <tr>
                    <td>{{ history.price | currency }}</td>
                    <td>{{ history.startDate }}</td>
                    <td>{{ history.endDate || '-' }}</td>
                    <td>
                      <span [class]="history.endDate ? 'badge badge-secondary' : 'badge badge-success'">
                        {{ history.endDate ? 'Historical' : 'Current' }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">{{ 'products.noPriceHistory' | translate }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (activeTab === 'stock') {
        <div class="stock-section">
          <div class="stock-cards">
            <div class="stock-card">
              <h4>{{ 'products.computedStock' | translate }}</h4>
              <div class="stock-value" [class.low-stock]="computedStock <= minStock">
                {{ computedStock }}
              </div>
              <p class="stock-note">Based on all stock movements</p>
            </div>
            <div class="stock-card">
              <h4>{{ 'products.minStock' | translate }}</h4>
              <div class="stock-value">{{ minStock }}</div>
            </div>
          </div>

          @if (computedStock <= minStock) {
            <div class="alert alert-warning">
              <strong>{{ 'products.lowStock' | translate }}!</strong> Current stock is at or below minimum level.
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    .tabs button {
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .tabs button.active {
      background: var(--primary);
      color: white;
    }
    .tabs button:hover:not(.active) {
      background: var(--surface-hover);
    }
    .current-price-card, .stock-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .price-display, .stock-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary);
    }
    .stock-value.low-stock {
      color: var(--danger);
    }
    .stock-note {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .change-price-form {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .stock-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }
    .alert-warning {
      background: rgba(255, 193, 7, 0.1);
      border: 1px solid rgba(255, 193, 7, 0.3);
      color: #856404;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  priceForm: FormGroup;
  isEdit = false;
  id?: number;
  categories: Category[] = [];
  activeTab = 'details';
  priceHistory: ProductPriceHistory[] = [];
  currentPrice = 0;
  computedStock = 0;
  minStock = 0;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      barcode: [''],
      brand: [''],
      categoryId: [null],
      buyingPrice: [null],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      vehicleCompatibility: [''],
      expirationDate: [null],
      volume: [''],
      minStock: [0],
      active: [true]
    });

    this.priceForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      startDate: [new Date().toISOString().split('T')[0]]
    });
  }

  ngOnInit() {
    this.api.getCategories().subscribe(data => {
      this.categories = data.filter(c => c.type === 'PRODUCT');
    });
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.loadProduct();
    }
  }

  loadProduct() {
    if (!this.id) return;
    
    forkJoin({
      product: this.api.getProduct(this.id),
      priceHistory: this.api.getProductPriceHistory(this.id),
      computedStock: this.api.getProductComputedStock(this.id)
    }).subscribe(({ product, priceHistory, computedStock }) => {
      this.form.patchValue({
        code: product.code,
        name: product.name,
        barcode: product.barcode || '',
        brand: product.brand || '',
        categoryId: product.category?.id || null,
        buyingPrice: product.buyingPrice || null,
        vehicleCompatibility: product.vehicleCompatibility || '',
        expirationDate: product.expirationDate || null,
        volume: product.volume || '',
        minStock: product.minStock || 0,
        active: product.active
      });
      this.priceHistory = priceHistory;
      this.currentPrice = product.sellingPrice || 0;
      this.computedStock = computedStock;
      this.minStock = product.minStock || 0;
    });
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        code: formData.code,
        name: formData.name,
        barcode: formData.barcode,
        brand: formData.brand,
        buyingPrice: formData.buyingPrice,
        vehicleCompatibility: formData.vehicleCompatibility,
        expirationDate: formData.expirationDate,
        volume: formData.volume,
        minStock: formData.minStock,
        active: formData.active
      };
      
      if (formData.categoryId) {
        data.category = { id: formData.categoryId };
      }
      
      if (!this.isEdit) {
        data.sellingPrice = formData.sellingPrice;
      }
      
      const request = this.isEdit 
        ? this.api.updateProduct(this.id!, data)
        : this.api.createProduct(data);
      
      request.subscribe((savedProduct) => {
        if (!this.isEdit && formData.sellingPrice > 0) {
          const today = new Date().toISOString().split('T')[0];
          this.api.addProductPrice(savedProduct.id!, formData.sellingPrice, today).subscribe(() => {
            this.router.navigate(['/products']);
          });
        } else {
          this.router.navigate(['/products']);
        }
      });
    }
  }

  addNewPrice() {
    if (this.priceForm.valid && this.id) {
      const { price, startDate } = this.priceForm.value;
      this.api.addProductPrice(this.id, price, startDate).subscribe(() => {
        this.loadProduct();
        this.priceForm.patchValue({ price: 0 });
      });
    }
  }
}
