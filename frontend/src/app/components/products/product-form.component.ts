import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Product' : 'New Product' }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Code</label>
            <input type="text" formControlName="code" class="form-control">
          </div>
          <div class="form-group">
            <label class="required">Name</label>
            <input type="text" formControlName="name" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select formControlName="categoryId" class="form-control">
              <option [ngValue]="null">-- No Category --</option>
              @for (cat of categories; track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Selling Price</label>
            <input type="number" step="0.01" formControlName="sellingPrice" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Min Stock</label>
            <input type="number" formControlName="minStock" class="form-control">
          </div>
          <div class="form-group">
            <label>Current Stock</label>
            <input type="number" formControlName="currentStock" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="active"> Active
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Save</button>
          <a routerLink="/products" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  categories: Category[] = [];

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
      sellingPrice: [0],
      minStock: [0],
      currentStock: [0],
      active: [true]
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
      this.api.getProduct(this.id).subscribe(product => {
        this.form.patchValue({
          ...product,
          categoryId: product.category?.id || null
        });
      });
    }
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        code: formData.code,
        name: formData.name,
        sellingPrice: formData.sellingPrice,
        minStock: formData.minStock,
        currentStock: formData.currentStock,
        active: formData.active
      };
      
      if (formData.categoryId) {
        data.category = { id: formData.categoryId };
      }
      
      const request = this.isEdit 
        ? this.api.updateProduct(this.id!, data)
        : this.api.createProduct(data);
      
      request.subscribe(() => this.router.navigate(['/products']));
    }
  }
}
