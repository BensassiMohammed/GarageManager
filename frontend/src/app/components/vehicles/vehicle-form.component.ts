import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Vehicle' : 'New Vehicle' }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">Registration Number</label>
            <input type="text" formControlName="registrationNumber" class="form-control">
          </div>
          <div class="form-group">
            <label>Brand</label>
            <input type="text" formControlName="brand" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Model</label>
            <input type="text" formControlName="model" class="form-control">
          </div>
          <div class="form-group">
            <label>Type</label>
            <input type="text" formControlName="type" class="form-control" placeholder="e.g. SUV, Sedan">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Year</label>
            <input type="number" formControlName="year" class="form-control">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select formControlName="status" class="form-control">
              <option value="ACTIVE">Active</option>
              <option value="IN_SERVICE">In Service</option>
              <option value="SOLD">Sold</option>
              <option value="SCRAPPED">Scrapped</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Owner</label>
          <select formControlName="ownerId" class="form-control">
            <option [ngValue]="null">-- No Owner --</option>
            @for (client of clients; track client.id) {
              <option [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }}</option>
            }
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Save</button>
          <a routerLink="/vehicles" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class VehicleFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  clients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      registrationNumber: ['', Validators.required],
      brand: [''],
      model: [''],
      type: [''],
      year: [null],
      status: ['ACTIVE'],
      ownerId: [null]
    });
  }

  ngOnInit() {
    this.api.getClients().subscribe(data => this.clients = data);
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getVehicle(this.id).subscribe(vehicle => {
        this.form.patchValue({
          ...vehicle,
          ownerId: vehicle.currentOwner?.id || null
        });
      });
    }
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        registrationNumber: formData.registrationNumber,
        brand: formData.brand,
        model: formData.model,
        type: formData.type,
        year: formData.year,
        status: formData.status
      };
      
      if (formData.ownerId) {
        data.currentOwner = { id: formData.ownerId };
      }
      
      const request = this.isEdit 
        ? this.api.updateVehicle(this.id!, data)
        : this.api.createVehicle(data);
      
      request.subscribe(() => this.router.navigate(['/vehicles']));
    }
  }
}
