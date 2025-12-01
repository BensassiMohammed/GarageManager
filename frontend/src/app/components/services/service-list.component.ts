import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { ServiceItem } from '../../models/models';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'services.title' | translate }}</h2>
      <a routerLink="/services/new" class="btn btn-primary">{{ 'services.newService' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'common.category' | translate }}</th>
              <th>{{ 'common.price' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (service of services; track service.id) {
              <tr>
                <td>{{ service.name }}</td>
                <td>{{ service.category?.name || '-' }}</td>
                <td>{{ service.sellingPrice | currency }}</td>
                <td>
                  <span [class]="service.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (service.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/services', service.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(service)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">{{ 'services.noServices' | translate }}</td>
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
