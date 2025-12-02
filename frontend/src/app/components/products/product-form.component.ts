import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Category, ProductPriceHistory, ProductBuyingPriceHistory } from '../../models/models';
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
      @if (errorMessage) {
        <div class="alert alert-danger">
          {{ errorMessage }}
        </div>
      }

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

          @if (!isEdit) {
            <div class="form-row">
              <div class="form-group">
                <label>{{ 'products.buyingPrice' | translate }}</label>
                <input type="number" step="0.01" formControlName="buyingPrice" class="form-control" placeholder="0.00">
              </div>
              <div class="form-group">
                <label class="required">{{ 'products.sellingPrice' | translate }}</label>
                <input type="number" step="0.01" formControlName="sellingPrice" class="form-control" placeholder="0.00">
              </div>
            </div>
          }

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
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving">
              @if (saving) {
                {{ 'common.saving' | translate }}...
              } @else {
                {{ 'common.save' | translate }}
              }
            </button>
            <a routerLink="/products" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
          </div>
        </form>
      }

      @if (activeTab === 'pricing') {
        <div class="price-section">
          <div class="sub-tabs">
            <button [class.active]="priceTab === 'selling'" (click)="priceTab = 'selling'">{{ 'products.sellingPrice' | translate }}</button>
            <button [class.active]="priceTab === 'buying'" (click)="priceTab = 'buying'">{{ 'products.buyingPrice' | translate }}</button>
          </div>

          @if (priceTab === 'selling') {
            <div class="current-price-card">
              <h4>{{ 'products.currentSellingPrice' | translate }}</h4>
              <div class="price-display selling">{{ currentSellingPrice | currency }}</div>
            </div>

            <div class="change-price-form">
              <h4>{{ 'products.updateSellingPrice' | translate }}</h4>
              <form [formGroup]="sellingPriceForm" (ngSubmit)="addNewSellingPrice()">
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
                    <button type="submit" class="btn btn-primary" [disabled]="sellingPriceForm.invalid">{{ 'common.save' | translate }}</button>
                  </div>
                </div>
              </form>
            </div>

            <h4>{{ 'products.sellingPriceHistory' | translate }}</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'common.price' | translate }}</th>
                    <th>{{ 'products.startDate' | translate }}</th>
                    <th>{{ 'products.endDate' | translate }}</th>
                    <th>{{ 'common.status' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (history of sellingPriceHistory; track history.id) {
                    <tr>
                      <td>{{ history.price | currency }}</td>
                      <td>{{ history.startDate }}</td>
                      <td>{{ history.endDate || '-' }}</td>
                      <td>
                        <span [class]="history.endDate ? 'badge badge-secondary' : 'badge badge-success'">
                          {{ (history.endDate ? 'products.historical' : 'products.current') | translate }}
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
          }

          @if (priceTab === 'buying') {
            <div class="current-price-card">
              <h4>{{ 'products.currentBuyingPrice' | translate }}</h4>
              <div class="price-display buying">{{ currentBuyingPrice | currency }}</div>
            </div>

            <div class="change-price-form">
              <h4>{{ 'products.updateBuyingPrice' | translate }}</h4>
              <form [formGroup]="buyingPriceForm" (ngSubmit)="addNewBuyingPrice()">
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
                    <button type="submit" class="btn btn-primary" [disabled]="buyingPriceForm.invalid">{{ 'common.save' | translate }}</button>
                  </div>
                </div>
              </form>
            </div>

            <h4>{{ 'products.buyingPriceHistory' | translate }}</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'common.price' | translate }}</th>
                    <th>{{ 'products.startDate' | translate }}</th>
                    <th>{{ 'products.endDate' | translate }}</th>
                    <th>{{ 'common.status' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (history of buyingPriceHistory; track history.id) {
                    <tr>
                      <td>{{ history.price | currency }}</td>
                      <td>{{ history.startDate }}</td>
                      <td>{{ history.endDate || '-' }}</td>
                      <td>
                        <span [class]="history.endDate ? 'badge badge-secondary' : 'badge badge-success'">
                          {{ (history.endDate ? 'products.historical' : 'products.current') | translate }}
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
          }
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
    .sub-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: var(--surface);
      border-radius: 8px;
      padding: 4px;
      width: fit-content;
    }
    .sub-tabs button {
      padding: 0.5rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      border-radius: 6px;
      transition: all 0.2s;
    }
    .sub-tabs button:hover:not(.active) {
      color: var(--text);
      background: var(--surface-hover);
    }
    .sub-tabs button.active {
      background: var(--primary);
      color: white;
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
    .price-display.selling {
      color: var(--success);
    }
    .price-display.buying {
      color: var(--warning);
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
      margin-bottom: 1rem;
    }
    .alert-warning {
      background: rgba(255, 193, 7, 0.1);
      border: 1px solid rgba(255, 193, 7, 0.3);
      color: #856404;
    }
    .alert-danger {
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #721c24;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  sellingPriceForm: FormGroup;
  buyingPriceForm: FormGroup;
  isEdit = false;
  id?: number;
  categories: Category[] = [];
  activeTab = 'details';
  priceTab: 'selling' | 'buying' = 'selling';
  sellingPriceHistory: ProductPriceHistory[] = [];
  buyingPriceHistory: ProductBuyingPriceHistory[] = [];
  currentSellingPrice = 0;
  currentBuyingPrice = 0;
  computedStock = 0;
  minStock = 0;
  errorMessage = '';
  saving = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
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

    this.sellingPriceForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      startDate: [new Date().toISOString().split('T')[0]]
    });

    this.buyingPriceForm = this.fb.group({
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
      sellingPriceHistory: this.api.getProductSellingPriceHistory(this.id),
      buyingPriceHistory: this.api.getProductBuyingPriceHistory(this.id),
      computedStock: this.api.getProductComputedStock(this.id)
    }).subscribe(({ product, sellingPriceHistory, buyingPriceHistory, computedStock }) => {
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
      this.sellingPriceHistory = sellingPriceHistory;
      this.buyingPriceHistory = buyingPriceHistory;
      this.currentSellingPrice = product.sellingPrice || 0;
      this.currentBuyingPrice = product.buyingPrice || 0;
      this.computedStock = computedStock;
      this.minStock = product.minStock || 0;
    });
  }

  save() {
    if (this.form.valid) {
      this.saving = true;
      this.errorMessage = '';
      
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
      
      request.subscribe({
        next: (savedProduct) => {
          if (!this.isEdit) {
            const today = new Date().toISOString().split('T')[0];
            const requests = [];
            
            if (formData.sellingPrice > 0) {
              requests.push(this.api.addProductSellingPrice(savedProduct.id!, formData.sellingPrice, today));
            }
            if (formData.buyingPrice > 0) {
              requests.push(this.api.addProductBuyingPrice(savedProduct.id!, formData.buyingPrice, today));
            }
            
            if (requests.length > 0) {
              forkJoin(requests).subscribe({
                next: () => {
                  this.saving = false;
                  this.router.navigate(['/products']);
                },
                error: () => {
                  this.saving = false;
                  this.router.navigate(['/products']);
                }
              });
            } else {
              this.saving = false;
              this.router.navigate(['/products']);
            }
          } else {
            this.saving = false;
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          this.saving = false;
          this.handleError(err);
        }
      });
    }
  }

  handleError(err: any) {
    if (err.status === 500) {
      const errorBody = err.error;
      if (typeof errorBody === 'string') {
        if (errorBody.includes('UNIQUE constraint failed: products.code')) {
          this.translate.get('products.errors.duplicateCode').subscribe(msg => {
            this.errorMessage = msg || 'A product with this code already exists. Please use a different code.';
          });
        } else if (errorBody.includes('UNIQUE constraint failed')) {
          this.translate.get('products.errors.duplicateEntry').subscribe(msg => {
            this.errorMessage = msg || 'A product with these details already exists.';
          });
        } else {
          this.translate.get('common.errors.serverError').subscribe(msg => {
            this.errorMessage = msg || 'An error occurred while saving. Please try again.';
          });
        }
      } else if (errorBody?.message) {
        if (errorBody.message.includes('UNIQUE constraint failed: products.code')) {
          this.translate.get('products.errors.duplicateCode').subscribe(msg => {
            this.errorMessage = msg || 'A product with this code already exists. Please use a different code.';
          });
        } else {
          this.errorMessage = errorBody.message;
        }
      } else {
        this.translate.get('common.errors.serverError').subscribe(msg => {
          this.errorMessage = msg || 'An error occurred while saving. Please try again.';
        });
      }
    } else if (err.status === 400) {
      this.translate.get('common.errors.invalidData').subscribe(msg => {
        this.errorMessage = msg || 'Invalid data. Please check your input and try again.';
      });
    } else if (err.status === 401 || err.status === 403) {
      this.translate.get('common.errors.unauthorized').subscribe(msg => {
        this.errorMessage = msg || 'You do not have permission to perform this action.';
      });
    } else {
      this.translate.get('common.errors.serverError').subscribe(msg => {
        this.errorMessage = msg || 'An error occurred while saving. Please try again.';
      });
    }
  }

  addNewSellingPrice() {
    if (this.sellingPriceForm.valid && this.id) {
      const { price, startDate } = this.sellingPriceForm.value;
      this.api.addProductSellingPrice(this.id, price, startDate).subscribe(() => {
        this.loadProduct();
        this.sellingPriceForm.patchValue({ price: 0 });
      });
    }
  }

  addNewBuyingPrice() {
    if (this.buyingPriceForm.valid && this.id) {
      const { price, startDate } = this.buyingPriceForm.value;
      this.api.addProductBuyingPrice(this.id, price, startDate).subscribe(() => {
        this.loadProduct();
        this.buyingPriceForm.patchValue({ price: 0 });
      });
    }
  }
}
