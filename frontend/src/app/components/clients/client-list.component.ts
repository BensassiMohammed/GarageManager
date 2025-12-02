import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'clients.title' | translate }}</h2>
      <a routerLink="/clients/new" class="btn btn-primary">{{ 'clients.newClient' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'common.email' | translate }}</th>
              <th>{{ 'common.phone' | translate }}</th>
              <th>{{ 'clients.city' | translate }}</th>
              <th>{{ 'common.address' | translate }}</th>
              <th>{{ 'clients.company' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (client of clients; track client.id) {
              <tr>
                <td>{{ client.firstName }} {{ client.lastName }}</td>
                <td>{{ client.email || '-' }}</td>
                <td>{{ client.phone || '-' }}</td>
                <td>{{ client.city || '-' }}</td>
                <td>{{ client.address || '-' }}</td>
                <td>{{ client.company?.name || '-' }}</td>
                <td>
                  <span [class]="client.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ (client.active ? 'common.active' : 'common.inactive') | translate }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/clients', client.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(client)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-state">{{ 'clients.noClients' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getClients().subscribe(data => {
      this.clients = data;
      this.cdr.detectChanges();
    });
  }

  delete(client: Client) {
    if (confirm(`Delete ${client.firstName} ${client.lastName}?`)) {
      this.api.deleteClient(client.id!).subscribe(() => this.load());
    }
  }
}
