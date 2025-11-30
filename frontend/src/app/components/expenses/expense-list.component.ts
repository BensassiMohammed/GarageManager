import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Expense } from '../../models/models';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Expenses</h2>
      <a routerLink="/expenses/new" class="btn btn-primary">New Expense</a>
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
            @for (expense of expenses; track expense.id) {
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
  `
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getExpenses().subscribe(data => this.expenses = data);
  }

  delete(expense: Expense) {
    if (confirm(`Delete expense ${expense.label}?`)) {
      this.api.deleteExpense(expense.id!).subscribe(() => this.load());
    }
  }
}
