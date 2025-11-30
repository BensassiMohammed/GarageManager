import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Expense, ExpenseCategory } from '../../models/models';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Expenses</h2>
      <a routerLink="/expenses/new" class="btn btn-primary">New Expense</a>
    </div>

    <div class="filter-section">
      <div class="filter-bar">
        <div class="form-group">
          <label>Category</label>
          <select [(ngModel)]="selectedCategoryId" (change)="applyFilters()" class="form-control">
            <option [ngValue]="null">All Categories</option>
            @for (cat of categories; track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label>From Date</label>
          <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" class="form-control">
        </div>
        <div class="form-group">
          <label>To Date</label>
          <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" class="form-control">
        </div>
        <div class="form-group">
          <label>Quick Filter</label>
          <select [(ngModel)]="quickFilter" (change)="applyQuickFilter()" class="form-control">
            <option value="">Custom</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
        <div class="form-group filter-actions">
          <button class="btn btn-secondary" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-value">{{ getTotalAmount() | currency }}</div>
        <div class="summary-label">Total Expenses ({{ filteredExpenses.length }} items)</div>
      </div>
      @if (selectedCategoryId) {
        <div class="summary-card">
          <div class="summary-value">{{ getCategoryName() }}</div>
          <div class="summary-label">Selected Category</div>
        </div>
      }
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Label</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (expense of filteredExpenses; track expense.id) {
              <tr>
                <td>{{ expense.date }}</td>
                <td>{{ expense.label }}</td>
                <td>{{ expense.expenseCategory?.name || '-' }}</td>
                <td>{{ expense.amount | currency }}</td>
                <td>{{ expense.paymentMethod || '-' }}</td>
                <td class="actions">
                  <a [routerLink]="['/expenses', expense.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(expense)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No expenses found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .filter-section {
      background: var(--card);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .filter-bar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .filter-bar .form-group {
      flex: 1;
      min-width: 150px;
    }
    .filter-bar label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }
    .filter-actions {
      display: flex;
      align-items: flex-end;
    }
    .summary-cards {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .summary-card {
      background: var(--card);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      flex: 1;
      max-width: 300px;
    }
    .summary-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary);
    }
    .summary-label {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  `]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  categories: ExpenseCategory[] = [];
  
  selectedCategoryId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  quickFilter: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getExpenseCategories().subscribe(data => this.categories = data);
  }

  load() {
    this.api.getExpenses().subscribe(data => {
      this.expenses = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.expenses];
    
    if (this.selectedCategoryId) {
      filtered = filtered.filter(e => e.expenseCategory?.id === this.selectedCategoryId);
    }
    
    if (this.startDate) {
      filtered = filtered.filter(e => e.date >= this.startDate);
    }
    
    if (this.endDate) {
      filtered = filtered.filter(e => e.date <= this.endDate);
    }
    
    this.filteredExpenses = filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  applyQuickFilter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    switch (this.quickFilter) {
      case 'thisMonth':
        this.startDate = new Date(year, month, 1).toISOString().split('T')[0];
        this.endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        break;
      case 'lastMonth':
        this.startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        this.endDate = new Date(year, month, 0).toISOString().split('T')[0];
        break;
      case 'thisYear':
        this.startDate = new Date(year, 0, 1).toISOString().split('T')[0];
        this.endDate = new Date(year, 11, 31).toISOString().split('T')[0];
        break;
      default:
        break;
    }
    
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategoryId = null;
    this.startDate = '';
    this.endDate = '';
    this.quickFilter = '';
    this.applyFilters();
  }

  getTotalAmount(): number {
    return this.filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  getCategoryName(): string {
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat?.name || '';
  }

  delete(expense: Expense) {
    if (confirm(`Delete expense ${expense.label}?`)) {
      this.api.deleteExpense(expense.id!).subscribe(() => this.load());
    }
  }
}
