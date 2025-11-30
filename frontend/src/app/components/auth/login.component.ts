import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="login-container">
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
      <div class="login-card">
        <h1>{{ 'app.title' | translate }}</h1>
        <h2>{{ 'auth.login' | translate }}</h2>
        
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">{{ 'auth.username' | translate }}</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              [(ngModel)]="credentials.username" 
              required
              [placeholder]="'auth.enterUsername' | translate">
          </div>
          
          <div class="form-group">
            <label for="password">{{ 'auth.password' | translate }}</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required
              [placeholder]="'auth.enterPassword' | translate">
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="loading || !loginForm.valid">
            {{ loading ? ('auth.signingIn' | translate) : ('auth.login' | translate) }}
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
  showLangMenu = false;
  supportedLanguages: Language[] = [];
  currentLang: string = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private langService: LanguageService
  ) {
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
