import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Company } from '../../models/models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? 'Edit Client' : 'New Client' }}</h2>
    </div>

    <div class="card">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label class="required">First Name</label>
            <input type="text" formControlName="firstName" class="form-control">
          </div>
          <div class="form-group">
            <label class="required">Last Name</label>
            <input type="text" formControlName="lastName" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="form-control">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" formControlName="phone" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>Company</label>
          <select formControlName="companyId" class="form-control">
            <option [ngValue]="null">-- No Company --</option>
            @for (company of companies; track company.id) {
              <option [ngValue]="company.id">{{ company.name }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea formControlName="notes" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" formControlName="active"> Active
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Save</button>
          <a routerLink="/clients" class="btn btn-secondary">Cancel</a>
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
