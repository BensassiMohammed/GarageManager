import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ServiceItem } from '../../models/models';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Services</h2>
      <a routerLink="/services/new" class="btn btn-primary">New Service</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (service of services; track service.id) {
              <tr>
                <td>{{ service.code }}</td>
                <td>{{ service.name }}</td>
                <td>{{ service.category?.name || '-' }}</td>
                <td>{{ service.sellingPrice | currency }}</td>
                <td>
                  <span [class]="service.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ service.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/services', service.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(service)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No services found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ServiceListComponent implements OnInit {
  services: ServiceItem[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getServices().subscribe(data => {
      this.services = data;
      this.cdr.detectChanges();
    });
  }

  delete(service: ServiceItem) {
    if (confirm(`Delete ${service.name}?`)) {
      this.api.deleteService(service.id!).subscribe(() => this.load());
    }
  }
}
