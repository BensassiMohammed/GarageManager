import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Categories</h2>
      <a routerLink="/categories/new" class="btn btn-primary">New Category</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Parent</th>
              <th>Status</th>
              <th>Actions</th>
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
                    {{ category.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/categories', category.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(category)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">No categories found</td>
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
