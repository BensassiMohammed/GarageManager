import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ExpenseCategory } from '../../models/models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Expense' : 'New Expense' }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Date</label>
            <input type="date" formControlName="date" class="form-control">
          </div>
          <div class="form-group">
            <label class="required">Label</label>
            <input type="text" formControlName="label" class="form-control">
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
            <label class="required">Amount</label>
            <input type="number" step="0.01" formControlName="amount" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>Payment Method</label>
          <select formControlName="paymentMethod" class="form-control">
            <option value="">-- Select --</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHECK">Check</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea formControlName="notes" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Save</button>
          <a routerLink="/expenses" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class ExpenseFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  categories: ExpenseCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      label: ['', Validators.required],
      categoryId: [null],
      amount: [0, Validators.required],
      paymentMethod: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.api.getExpenseCategories().subscribe(data => this.categories = data);
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getExpense(this.id).subscribe(expense => {
        this.form.patchValue({
          ...expense,
          categoryId: expense.expenseCategory?.id || null
        });
      });
    }
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        date: formData.date,
        label: formData.label,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod || null,
        notes: formData.notes
      };
      
      if (formData.categoryId) {
        data.expenseCategory = { id: formData.categoryId };
      }
      
      const request = this.isEdit 
        ? this.api.updateExpense(this.id!, data)
        : this.api.createExpense(data);
      
      request.subscribe(() => this.router.navigate(['/expenses']));
    }
  }
}
