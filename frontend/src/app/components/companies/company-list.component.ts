import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Company } from '../../models/models';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'companies.title' | translate }}</h2>
      <a routerLink="/companies/new" class="btn btn-primary">{{ 'companies.newCompany' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'common.email' | translate }}</th>
              <th>{{ 'common.phone' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (company of companies; track company.id) {
              <tr>
                <td>{{ company.name }}</td>
                <td>{{ company.email || '-' }}</td>
                <td>{{ company.phone || '-' }}</td>
                <td>
                  <span [class]="company.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (company.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/companies', company.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(company)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">{{ 'companies.noCompanies' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getCompanies().subscribe(data => {
      this.companies = data;
      this.cdr.detectChanges();
    });
  }

  delete(company: Company) {
    if (confirm(`Delete ${company.name}?`)) {
      this.api.deleteCompany(company.id!).subscribe(() => this.load());
    }
  }
}
