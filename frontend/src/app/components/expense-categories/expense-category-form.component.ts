import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-expense-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ (isEdit ? 'expenseCategories.editCategory' : 'expenseCategories.newCategory') | translate }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-group">
          <label class="required">{{ 'common.name' | translate }}</label>
          <input type="text" formControlName="name" class="form-control">
        </div>

        <div class="form-group">
          <label>{{ 'common.description' | translate }}</label>
          <textarea formControlName="description" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="active"> {{ 'common.active' | translate }}
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
          <a routerLink="/expense-categories" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
        </div>
      </form>
    </div>
  `
})
export class ExpenseCategoryFormComponent implements OnInit {
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
      description: [''],
      active: [true]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getExpenseCategory(this.id).subscribe(category => {
        this.form.patchValue(category);
      });
    }
  }

  save() {
    if (this.form.valid) {
      const data = this.form.value;
      const request = this.isEdit 
        ? this.api.updateExpenseCategory(this.id!, data)
        : this.api.createExpenseCategory(data);
      
      request.subscribe(() => this.router.navigate(['/expense-categories']));
    }
  }
}
