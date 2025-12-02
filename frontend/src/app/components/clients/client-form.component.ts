import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { Company } from '../../models/models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ (isEdit ? 'clients.editClient' : 'clients.newClient') | translate }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">{{ 'clients.firstName' | translate }}</label>
            <input type="text" formControlName="firstName" class="form-control">
          </div>
          <div class="form-group">
            <label class="required">{{ 'clients.lastName' | translate }}</label>
            <input type="text" formControlName="lastName" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>{{ 'common.email' | translate }}</label>
            <input type="email" formControlName="email" class="form-control">
          </div>
          <div class="form-group">
            <label>{{ 'common.phone' | translate }}</label>
            <input type="text" formControlName="phone" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>{{ 'clients.company' | translate }}</label>
          <select formControlName="companyId" class="form-control">
            <option [ngValue]="null">-- {{ 'clients.selectCompany' | translate }} --</option>
            @for (company of companies; track company.id) {
              <option [ngValue]="company.id">{{ company.name }}</option>
            }
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ 'clients.city' | translate }}</label>
            <input type="text" formControlName="city" class="form-control">
          </div>
          <div class="form-group">
            <label>{{ 'common.address' | translate }}</label>
            <input type="text" formControlName="address" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>{{ 'common.notes' | translate }}</label>
          <textarea formControlName="notes" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="active"> {{ 'common.active' | translate }}
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
          <a routerLink="/clients" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
        </div>
      </form>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  companies: Company[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''],
      phone: [''],
      city: [''],
      address: [''],
      companyId: [null],
      notes: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.api.getCompanies().subscribe(data => this.companies = data);
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.id = +id;
      this.api.getClient(this.id).subscribe(client => {
        this.form.patchValue({
          ...client,
          companyId: client.company?.id || null
        });
      });
    }
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const data: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        active: formData.active
      };
      
      if (formData.companyId) {
        data.company = { id: formData.companyId };
      }
      
      const request = this.isEdit 
        ? this.api.updateClient(this.id!, data)
        : this.api.createClient(data);
      
      request.subscribe(() => this.router.navigate(['/clients']));
    }
  }
}
