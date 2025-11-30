import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { ExpenseCategory } from '../../models/models';

@Component({
  selector: 'app-expense-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'expenseCategories.title' | translate }}</h2>
      <a routerLink="/expense-categories/new" class="btn btn-primary">{{ 'expenseCategories.newCategory' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'common.description' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (category of categories; track category.id) {
              <tr>
                <td>{{ category.name }}</td>
                <td>{{ category.description || '-' }}</td>
                <td>
                  <span [class]="category.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (category.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/expense-categories', category.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(category)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="empty-state">{{ 'expenseCategories.noCategories' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ExpenseCategoryListComponent implements OnInit {
  categories: ExpenseCategory[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getExpenseCategories().subscribe(data => {
      this.categories = data;
      this.cdr.detectChanges();
    });
  }

  delete(category: ExpenseCategory) {
    if (confirm(`Delete ${category.name}?`)) {
      this.api.deleteExpenseCategory(category.id!).subscribe(() => this.load());
    }
  }
}
