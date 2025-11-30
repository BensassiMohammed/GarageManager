import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, UserInfo } from './services/auth.service';
import { LanguageService, Language } from './services/language.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  currentUser: UserInfo | null = null;
  isAuthPage = false;
  showLangMenu = false;
  supportedLanguages: Language[] = [];
  currentLang: string = 'en';

  constructor(
    public authService: AuthService,
    private router: Router,
    public langService: LanguageService
  ) {
    this.supportedLanguages = this.langService.supportedLanguages;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAuthPage = event.url === '/login' || event.url === '/change-password';
    });

    if (this.authService.isAuthenticated() && !this.currentUser) {
      this.authService.getCurrentUser().subscribe();
    }
  }

  hasModule(module: string): boolean {
    return this.authService.hasModule(module);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
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
}
