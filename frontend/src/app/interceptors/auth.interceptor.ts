import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  
  if (token && !authService.isTokenExpired(token)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const newToken = event.headers.get('X-New-Access-Token');
        if (newToken && newToken !== 'RENEW_NEEDED') {
          authService.setToken(newToken);
        } else if (newToken === 'RENEW_NEEDED') {
          authService.getCurrentUser().subscribe();
        }
      }
    }),
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
