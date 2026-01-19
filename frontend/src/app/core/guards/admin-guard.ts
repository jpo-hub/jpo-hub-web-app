import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from '../services/cookie';
import { catchError, map, of } from 'rxjs';
import {Admin} from '../../admin/services/admin';

export const adminGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const adminService = inject(Admin);
  const router = inject(Router);

  const token = cookieService.get('admin_token');

  if (!token) {
    return router.createUrlTree(['/admin/login']);
  }

  return adminService.checkToken().pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(['/admin/login']));
    })
  );
};
