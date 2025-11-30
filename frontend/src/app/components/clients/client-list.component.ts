import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Clients</h2>
      <a routerLink="/clients/new" class="btn btn-primary">New Client</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (client of clients; track client.id) {
              <tr>
                <td>{{ client.firstName }} {{ client.lastName }}</td>
                <td>{{ client.email || '-' }}</td>
                <td>{{ client.phone || '-' }}</td>
                <td>{{ client.company?.name || '-' }}</td>
                <td>
                  <span [class]="client.active ? 'badge badge-success' : 'badge badge-danger'">
                    {{ client.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/clients', client.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(client)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No clients found</td>
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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getClients().subscribe(data => this.clients = data);
  }

  delete(client: Client) {
    if (confirm(`Delete ${client.firstName} ${client.lastName}?`)) {
      this.api.deleteClient(client.id!).subscribe(() => this.load());
    }
  }
}
