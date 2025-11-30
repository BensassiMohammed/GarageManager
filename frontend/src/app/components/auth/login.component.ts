import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Garage Management System</h1>
        <h2>Sign In</h2>
        
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              [(ngModel)]="credentials.username" 
              required
              placeholder="Enter username">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required
              placeholder="Enter password">
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="loading || !loginForm.valid">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a2a3a 0%, #2d4a5a 100%);
    }
    
    .login-card {
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
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    
    h2 {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
      font-size: 1rem;
      font-weight: normal;
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
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
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
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            this.loading = false;
            if (user.mustChangePassword) {
              this.router.navigate(['/change-password']);
            } else {
              this.router.navigate(['/']);
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Failed to load user information';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Invalid username or password';
        this.cdr.detectChanges();
      }
    });
  }
}
