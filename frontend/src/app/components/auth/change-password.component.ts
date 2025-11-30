import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, ChangePasswordRequest } from '../../services/auth.service';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="change-password-container">
      <div class="lang-switcher">
        <button class="lang-btn" (click)="toggleLangMenu()">
          <span class="lang-icon">🌐</span>
          <span>{{ getCurrentLangInfo().nativeName }}</span>
        </button>
        <div class="lang-menu" *ngIf="showLangMenu">
          <button 
            *ngFor="let lang of supportedLanguages" 
            class="lang-option"
            [class.active]="lang.code === currentLang"
            (click)="setLanguage(lang.code)">
            {{ lang.nativeName }}
          </button>
        </div>
      </div>
      <div class="change-password-card">
        <h1>{{ 'auth.changePassword' | translate }}</h1>
        <p *ngIf="isForced" class="warning">
          {{ 'auth.mustChangePassword' | translate }}
        </p>
        
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
        
        <div *ngIf="success" class="success-message">
          {{ success }}
        </div>
        
        <form (ngSubmit)="onSubmit()" #passwordForm="ngForm">
          <div class="form-group">
            <label for="oldPassword">{{ 'auth.currentPassword' | translate }}</label>
            <input 
              type="password" 
              id="oldPassword" 
              name="oldPassword"
              [(ngModel)]="passwords.oldPassword" 
              required
              [placeholder]="'auth.enterCurrentPassword' | translate">
          </div>
          
          <div class="form-group">
            <label for="newPassword">{{ 'auth.newPassword' | translate }}</label>
            <input 
              type="password" 
              id="newPassword" 
              name="newPassword"
              [(ngModel)]="passwords.newPassword" 
              required
              minlength="6"
              [placeholder]="'auth.enterNewPassword' | translate">
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">{{ 'auth.confirmPassword' | translate }}</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              [(ngModel)]="confirmPassword" 
              required
              [placeholder]="'auth.confirmNewPassword' | translate">
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="loading || !passwordForm.valid">
            {{ loading ? ('auth.changing' | translate) : ('auth.changePassword' | translate) }}
          </button>
          
          <button *ngIf="!isForced" type="button" class="btn btn-secondary" (click)="cancel()">
            {{ 'common.cancel' | translate }}
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
      position: relative;
    }
    
    .lang-switcher {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    
    :host-context([dir="rtl"]) .lang-switcher {
      right: auto;
      left: 1rem;
    }
    
    .lang-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .lang-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .lang-icon {
      font-size: 1rem;
    }
    
    .lang-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.25rem;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 120px;
    }
    
    :host-context([dir="rtl"]) .lang-menu {
      right: auto;
      left: 0;
    }
    
    .lang-option {
      display: block;
      width: 100%;
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 0.9rem;
      color: #333;
    }
    
    :host-context([dir="rtl"]) .lang-option {
      text-align: right;
    }
    
    .lang-option:hover {
      background: #f5f5f5;
    }
    
    .lang-option.active {
      background: #e3f2fd;
      color: #1976d2;
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
  showLangMenu = false;
  supportedLanguages: Language[] = [];
  currentLang: string = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private langService: LanguageService
  ) {
    this.isForced = this.authService.mustChangePassword();
    this.supportedLanguages = this.langService.supportedLanguages;
    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleLangMenu(): void {
    this.showLangMenu = !this.showLangMenu;
  }

  setLanguage(langCode: string): void {
    this.langService.setLanguage(langCode);
    this.showLangMenu = false;
  }

  getCurrentLangInfo(): Language {
    return this.langService.getCurrentLanguageInfo();
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
      next: (response: any) => {
        this.loading = false;
        this.success = 'Password changed successfully! Redirecting...';
        
        if (response.accessToken) {
          this.authService.setToken(response.accessToken);
        }
        
        this.authService.getCurrentUser().subscribe({
          next: () => {
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1000);
          },
          error: () => {
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1000);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error || 'Failed to change password';
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
