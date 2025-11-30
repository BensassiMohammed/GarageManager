import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Category' : 'New Category' }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Name</label>
            <input type="text" formControlName="name" class="form-control">
          </div>
          <div class="form-group">
            <label class="required">Type</label>
            <select formControlName="type" class="form-control">
              <option value="PRODUCT">Product</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Parent Category</label>
          <select formControlName="parentId" class="form-control">
            <option [ngValue]="null">-- No Parent --</option>
            @for (cat of categories; track cat.id) {
              @if (cat.id !== id) {
                <option [ngValue]="cat.id">{{ cat.name }} ({{ cat.type }})</option>
              }
            }
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="active"> Active
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Save</button>
          <a routerLink="/categories" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class CategoryFormComponent implements OnInit {
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
      name: ['', Validators.required],
      type: ['PRODUCT', Validators.required],
      parentId: [null],
      active: [true]
    });
  }

  ngOnInit() {
    this.api.getCategories().subscribe(data => this.categories = data);
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getCategory(this.id).subscribe(category => {
        this.form.patchValue({
          ...category,
          parentId: category.parentCategory?.id || null
        });
      });
    }
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        name: formData.name,
        type: formData.type,
        active: formData.active
      };
      
      if (formData.parentId) {
        data.parentCategory = { id: formData.parentId };
      }
      
      const request = this.isEdit 
        ? this.api.updateCategory(this.id!, data)
        : this.api.createCategory(data);
      
      request.subscribe(() => this.router.navigate(['/categories']));
    }
  }
}
