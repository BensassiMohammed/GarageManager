import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Category, ServicePriceHistory } from '../../models/models';
import { forkJoin } from 'rxjs';
import { MadCurrencyPipe } from '../../pipes/mad-currency.pipe';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, MadCurrencyPipe],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ (isEdit ? 'services.editService' : 'services.newService') | translate }}</h2>
    </div>

    <div class="card">
      @if (isEdit) {
        <div class="tabs">
          <button [class.active]="activeTab === 'details'" (click)="activeTab = 'details'">{{ 'common.details' | translate }}</button>
          <button [class.active]="activeTab === 'pricing'" (click)="activeTab = 'pricing'">{{ 'services.priceHistory' | translate }}</button>
        </div>
      }

      @if (activeTab === 'details') {
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label class="required">{{ 'products.sku' | translate }}</label>
              <input type="text" formControlName="code" class="form-control">
            </div>
            <div class="form-group">
              <label class="required">{{ 'common.name' | translate }}</label>
              <input type="text" formControlName="name" class="form-control">
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
            @if (!isEdit) {
              <div class="form-group">
                <label class="required">{{ 'common.price' | translate }}</label>
                <input type="number" step="0.01" formControlName="sellingPrice" class="form-control" placeholder="0.00">
              </div>
            }
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" formControlName="active"> {{ 'common.active' | translate }}
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
            <a routerLink="/services" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
          </div>
        </form>
      }

      @if (activeTab === 'pricing') {
        <div class="price-section">
          <div class="current-price-card">
            <h4>{{ 'common.price' | translate }}</h4>
            <div class="price-display">{{ currentPrice | madCurrency }}</div>
          </div>

          <div class="change-price-form">
            <h4>{{ 'services.addPrice' | translate }}</h4>
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

          <h4>{{ 'services.priceHistory' | translate }}</h4>
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
                    <td>{{ history.price | madCurrency }}</td>
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
                    <td colspan="4" class="empty-state">{{ 'services.noPriceHistory' | translate }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
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
    .current-price-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .price-display {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary);
    }
    .change-price-form {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
  `]
})
export class ServiceFormComponent implements OnInit {
  form: FormGroup;
  priceForm: FormGroup;
  isEdit = false;
  id?: number;
  categories: Category[] = [];
  activeTab = 'details';
  priceHistory: ServicePriceHistory[] = [];
  currentPrice = 0;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      categoryId: [null],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });

    this.priceForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      startDate: [new Date().toISOString().split('T')[0]]
    });
  }

  ngOnInit() {
    this.api.getCategories().subscribe(data => {
      this.categories = data.filter(c => c.type === 'SERVICE');
    });
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.loadService();
    }
  }

  loadService() {
    if (!this.id) return;
    
    forkJoin({
      service: this.api.getService(this.id),
      priceHistory: this.api.getServicePriceHistory(this.id)
    }).subscribe(({ service, priceHistory }) => {
      this.form.patchValue({
        code: service.code,
        name: service.name,
        categoryId: service.category?.id || null,
        active: service.active
      });
      this.priceHistory = priceHistory;
      this.currentPrice = service.sellingPrice || 0;
    });
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        code: formData.code,
        name: formData.name,
        active: formData.active
      };
      
      if (formData.categoryId) {
        data.category = { id: formData.categoryId };
      }
      
      if (!this.isEdit) {
        data.sellingPrice = formData.sellingPrice;
      }
      
      const request = this.isEdit 
        ? this.api.updateService(this.id!, data)
        : this.api.createService(data);
      
      request.subscribe((savedService) => {
        if (!this.isEdit && formData.sellingPrice > 0) {
          const today = new Date().toISOString().split('T')[0];
          this.api.addServicePrice(savedService.id!, formData.sellingPrice, today).subscribe(() => {
            this.router.navigate(['/services']);
          });
        } else {
          this.router.navigate(['/services']);
        }
      });
    }
  }

  addNewPrice() {
    if (this.priceForm.valid && this.id) {
      const { price, startDate } = this.priceForm.value;
      this.api.addServicePrice(this.id, price, startDate).subscribe(() => {
        this.loadService();
        this.priceForm.patchValue({ price: 0 });
      });
    }
  }
}
