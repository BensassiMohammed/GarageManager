import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app_language';
  private readonly DEFAULT_LANG = 'en';

  readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' }
  ];

  private currentLangSubject = new BehaviorSubject<string>(this.DEFAULT_LANG);
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initLanguage();
  }

  private initLanguage(): void {
    this.translate.addLangs(['en', 'fr', 'ar']);
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const savedLang = this.getSavedLanguage();
    this.setLanguage(savedLang || this.DEFAULT_LANG);
  }

  getSavedLanguage(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  setLanguage(langCode: string): void {
    if (!this.isValidLanguage(langCode)) {
      langCode = this.DEFAULT_LANG;
    }

    this.translate.use(langCode);
    this.currentLangSubject.next(langCode);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, langCode);
    }

    this.updateDocumentDirection(langCode);
  }

  getCurrentLanguage(): string {
    return this.currentLangSubject.value;
  }

  getCurrentLanguageInfo(): Language {
    const current = this.getCurrentLanguage();
    return this.supportedLanguages.find(l => l.code === current) || this.supportedLanguages[0];
  }

  isValidLanguage(langCode: string): boolean {
    return this.supportedLanguages.some(l => l.code === langCode);
  }

  isRtl(): boolean {
    return this.getCurrentLanguageInfo().dir === 'rtl';
  }

  private updateDocumentDirection(langCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const lang = this.supportedLanguages.find(l => l.code === langCode);
      const dir = lang?.dir || 'ltr';
      
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', langCode);
      document.body.setAttribute('dir', dir);
      
      if (dir === 'rtl') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    }
  }
}
