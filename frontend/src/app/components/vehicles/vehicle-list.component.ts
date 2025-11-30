import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Vehicle } from '../../models/models';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Vehicles</h2>
      <a routerLink="/vehicles/new" class="btn btn-primary">New Vehicle</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Registration</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Year</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (vehicle of vehicles; track vehicle.id) {
              <tr>
                <td>{{ vehicle.registrationNumber }}</td>
                <td>{{ vehicle.brand || '-' }}</td>
                <td>{{ vehicle.model || '-' }}</td>
                <td>{{ vehicle.year || '-' }}</td>
                <td>{{ vehicle.currentOwner ? vehicle.currentOwner.firstName + ' ' + vehicle.currentOwner.lastName : '-' }}</td>
                <td>
                  <span class="badge badge-info">{{ vehicle.status || 'ACTIVE' }}</span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/vehicles', vehicle.id]" class="btn btn-sm btn-secondary">Edit</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(vehicle)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">No vehicles found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getVehicles().subscribe(data => {
      this.vehicles = data;
      this.cdr.detectChanges();
    });
  }

  delete(vehicle: Vehicle) {
    if (confirm(`Delete vehicle ${vehicle.registrationNumber}?`)) {
      this.api.deleteVehicle(vehicle.id!).subscribe(() => this.load());
    }
  }
}
