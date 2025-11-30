import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ (isEdit ? 'suppliers.editSupplier' : 'suppliers.newSupplier') | translate }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">{{ 'common.name' | translate }}</label>
            <input type="text" formControlName="name" class="form-control">
          </div>
          <div class="form-group">
            <label>{{ 'common.email' | translate }}</label>
            <input type="email" formControlName="email" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>{{ 'common.phone' | translate }}</label>
            <input type="text" formControlName="phone" class="form-control">
          </div>
          <div class="form-group">
            <label>{{ 'common.address' | translate }}</label>
            <input type="text" formControlName="address" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>{{ 'common.notes' | translate }}</label>
          <textarea formControlName="notes" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="active"> {{ 'common.active' | translate }}
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
          <a routerLink="/suppliers" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
        </div>
      </form>
    </div>
  `
})
export class SupplierFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      address: [''],
      notes: [''],
      active: [true]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getSupplier(this.id).subscribe(supplier => {
        this.form.patchValue(supplier);
      });
    }
  }

  save() {
    if (this.form.valid) {
      const data = this.form.value;
      const request = this.isEdit 
        ? this.api.updateSupplier(this.id!, data)
        : this.api.createSupplier(data);
      
      request.subscribe(() => this.router.navigate(['/suppliers']));
    }
  }
}
