import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ChangePasswordRequest } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="change-password-container">
      <div class="change-password-card">
        <h1>Change Password</h1>
        <p *ngIf="isForced" class="warning">
          You must change your password before continuing.
        </p>
        
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
        
        <div *ngIf="success" class="success-message">
          {{ success }}
        </div>
        
        <form (ngSubmit)="onSubmit()" #passwordForm="ngForm">
          <div class="form-group">
            <label for="oldPassword">Current Password</label>
            <input 
              type="password" 
              id="oldPassword" 
              name="oldPassword"
              [(ngModel)]="passwords.oldPassword" 
              required
              placeholder="Enter current password">
          </div>
          
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              name="newPassword"
              [(ngModel)]="passwords.newPassword" 
              required
              minlength="6"
              placeholder="Enter new password (min 6 characters)">
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              [(ngModel)]="confirmPassword" 
              required
              placeholder="Confirm new password">
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="loading || !passwordForm.valid">
            {{ loading ? 'Changing...' : 'Change Password' }}
          </button>
          
          <button *ngIf="!isForced" type="button" class="btn btn-secondary" (click)="cancel()">
            Cancel
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a2a3a 0%, #2d4a5a 100%);
    }
    
    .change-password-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 400px;
    }
    
    h1 {
      text-align: center;
      color: #1a2a3a;
      margin-bottom: 1rem;
    }
    
    .warning {
      background: #fff3e0;
      color: #e65100;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    
    input:focus {
      outline: none;
      border-color: #3498db;
    }
    
    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }
    
    .btn-secondary {
      background: #95a5a6;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #7f8c8d;
    }
    
    .btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
    
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .success-message {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
  `]
})
export class ChangePasswordComponent {
  passwords: ChangePasswordRequest = {
    oldPassword: '',
    newPassword: ''
  };
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';
  isForced = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isForced = this.authService.mustChangePassword();
  }

  onSubmit(): void {
    if (this.passwords.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.passwords.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.changePassword(this.passwords).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password changed successfully!';
        
        this.authService.getCurrentUser().subscribe({
          next: () => {
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error || 'Failed to change password';
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
