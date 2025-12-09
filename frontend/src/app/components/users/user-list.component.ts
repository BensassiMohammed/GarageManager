import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ApiService} from '../../services/api.service';

interface User {
  id: number;
  username: string;
  active: boolean;
  mustChangePassword: boolean;
  roles: string[];
  allowedModules: string[];
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  allowedModules: string[];
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="content">
      <div class="page-header">
        <h2>{{ 'users.title' | translate }}</h2>
        <button class="btn btn-primary" (click)="openCreateModal()">{{ 'users.newUser' | translate }}</button>
      </div>

      <div class="card">
        <table *ngIf="users.length > 0">
          <thead>
          <tr>
            <th>{{ 'users.username' | translate }}</th>
            <th>{{ 'users.roles' | translate }}</th>
            <th>{{ 'common.status' | translate }}</th>
            <th>{{ 'users.mustChangePassword' | translate }}</th>
            <th>{{ 'common.actions' | translate }}</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.username }}</td>
            <td>
              <span *ngFor="let role of user.roles" class="badge badge-info">{{ getRoleLabel(role) | translate }}</span>
            </td>
            <td>
                <span [class]="user.active ? 'badge badge-success' : 'badge badge-danger'">
                  {{ (user.active ? 'common.active' : 'common.inactive') | translate }}
                </span>
            </td>
            <td>
                <span [class]="user.mustChangePassword ? 'badge badge-warning' : 'badge badge-secondary'">
                  {{ (user.mustChangePassword ? 'common.yes' : 'common.no') | translate }}
                </span>
            </td>
            <td>
              <button class="btn btn-sm btn-secondary" (click)="openEditModal(user)">{{ 'common.edit' | translate }}
              </button>
              <button class="btn btn-sm btn-danger" (click)="deleteUser(user)">{{ 'common.delete' | translate }}
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <p *ngIf="users.length === 0" class="no-data">{{ 'users.noUsers' | translate }}</p>
      </div>

      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ (isEditing ? 'users.editUser' : 'users.newUser') | translate }}</h3>

          <div *ngIf="modalError" class="error-message">{{ modalError }}</div>

          <form (ngSubmit)="saveUser()">
            <div class="form-group">
              <label for="username">{{ 'users.username' | translate }}</label>
              <input type="text" id="username" [(ngModel)]="currentUser.username" name="username" required>
            </div>

            <div class="form-group">
              <label for="password">{{ (isEditing ? 'auth.newPassword' : 'auth.password') | translate }}</label>
              <input type="password" id="password" [(ngModel)]="currentUser.password" name="password"
                     [required]="!isEditing" minlength="6">
            </div>

            <div class="form-group">
              <label>{{ 'users.roles' | translate }}</label>
              <div class="checkbox-group">
                <label *ngFor="let role of roles" class="checkbox-label">
                  <input type="checkbox" [checked]="isRoleSelected(role.name)"
                         (change)="toggleRole(role.name)">
                  {{ getRoleLabel(role.name) | translate }} - {{ role.description }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="currentUser.active" name="active">
                {{ 'common.active' | translate }}
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="currentUser.mustChangePassword" name="mustChangePassword">
                {{ 'users.mustChangePassword' | translate }}
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">{{ 'common.cancel' | translate }}
              </button>
              <button type="submit" class="btn btn-primary">{{ 'common.save' | translate }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content {
      padding: 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 0.25rem;
    }

    .badge-info {
      background: #17a2b8;
      color: white;
    }

    .badge-success {
      background: #28a745;
      color: white;
    }

    .badge-danger {
      background: #dc3545;
      color: white;
    }

    .badge-warning {
      background: #ffc107;
      color: #333;
    }

    .badge-secondary {
      background: #6c757d;
      color: white;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      margin-right: 0.25rem;
    }

    .no-data {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
    }

    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  showModal = false;
  isEditing = false;
  modalError = '';
  currentUser: any = {
    username: '',
    password: '',
    active: true,
    mustChangePassword: true,
    roleNames: [] as string[]
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  loadRoles(): void {
    this.api.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }

  getRoleLabel(roleName: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'users.admin',
      'MANAGER': 'users.manager',
      'STAFF': 'users.staff'
    };
    return labels[roleName] || roleName;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.modalError = '';
    this.currentUser = {
      username: '',
      password: '',
      active: true,
      mustChangePassword: true,
      roleNames: []
    };
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.isEditing = true;
    this.modalError = '';
    this.currentUser = {
      id: user.id,
      username: user.username,
      password: '',
      active: user.active,
      mustChangePassword: user.mustChangePassword,
      roleNames: [...user.roles]
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  isRoleSelected(roleName: string): boolean {
    return this.currentUser.roleNames.includes(roleName);
  }

  toggleRole(roleName: string): void {
    const index = this.currentUser.roleNames.indexOf(roleName);
    if (index === -1) {
      this.currentUser.roleNames.push(roleName);
    } else {
      this.currentUser.roleNames.splice(index, 1);
    }
  }

  saveUser(): void {
    this.modalError = '';
    const payload: any = {
      username: this.currentUser.username,
      active: this.currentUser.active,
      mustChangePassword: this.currentUser.mustChangePassword,
      roleNames: this.currentUser.roleNames
    };
    if (this.currentUser.password) {
      payload.password = this.currentUser.password;
    }
    if (this.isEditing) {
      this.api.updateUser(this.currentUser.id, payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.modalError = err.error || 'Failed to update user';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.api.createUser(payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.modalError = err.error || 'Failed to create user';
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.api.deleteUser(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('Failed to delete user')
      });
    }
  }
}
