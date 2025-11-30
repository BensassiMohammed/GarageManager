import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'categories.title' | translate }}</h2>
      <a routerLink="/categories/new" class="btn btn-primary">{{ 'categories.newCategory' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'common.type' | translate }}</th>
              <th>{{ 'categories.parentCategory' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (category of categories; track category.id) {
              <tr>
                <td>{{ category.name }}</td>
                <td>
                  <span [class]="category.type === 'PRODUCT' ? 'badge badge-info' : 'badge badge-warning'">
                    {{ category.type }}
                  </span>
                </td>
                <td>{{ category.parentCategory?.name || '-' }}</td>
                <td>
                  <span [class]="category.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (category.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/categories', category.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(category)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">{{ 'categories.noCategories' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getCategories().subscribe(data => {
      this.categories = data;
      this.cdr.detectChanges();
    });
  }

  delete(category: Category) {
    if (confirm(`Delete ${category.name}?`)) {
      this.api.deleteCategory(category.id!).subscribe(() => this.load());
    }
  }
}
