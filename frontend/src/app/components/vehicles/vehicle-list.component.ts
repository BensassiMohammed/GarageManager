import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Vehicle } from '../../models/models';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ 'vehicles.title' | translate }}</h2>
      <a routerLink="/vehicles/new" class="btn btn-primary">{{ 'vehicles.newVehicle' | translate }}</a>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'vehicles.licensePlate' | translate }}</th>
              <th>{{ 'vehicles.make' | translate }}</th>
              <th>{{ 'vehicles.model' | translate }}</th>
              <th>{{ 'vehicles.year' | translate }}</th>
              <th>{{ 'vehicles.mileage' | translate }}</th>
              <th>{{ 'vehicles.color' | translate }}</th>
              <th>{{ 'vehicles.owner' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (vehicle of vehicles; track vehicle.id) {
              <tr>
                <td>{{ vehicle.registrationNumber }}</td>
                <td>{{ vehicle.brand || '-' }}</td>
                <td>{{ vehicle.model || '-' }}</td>
                <td>{{ vehicle.year || '-' }}</td>
                <td>{{ vehicle.mileage || '-' }}</td>
                <td>{{ vehicle.color || '-' }}</td>
                <td>{{ vehicle.currentOwner ? vehicle.currentOwner.firstName + ' ' + vehicle.currentOwner.lastName : '-' }}</td>
                <td>
                  <span class="badge badge-info">{{ vehicle.status || 'ACTIVE' }}</span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/vehicles', vehicle.id]" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
                  <button class="btn btn-sm btn-danger" (click)="delete(vehicle)">{{ 'common.delete' | translate }}</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-state">{{ 'vehicles.noVehicles' | translate }}</td>
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
