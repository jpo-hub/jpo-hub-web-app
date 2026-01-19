import {CanActivateFn, Router} from '@angular/router';
import {inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {CookieService} from '../services/cookie';
import {catchError, map, of} from 'rxjs';
import {Admin} from '../../admin/services/admin';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../services/toast';
import {ErrorHandler} from '../services/error-handler';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminService = inject(Admin);
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const platformId = inject(PLATFORM_ID);
  const toastService = inject(ToastService);
  const errorHandler = inject(ErrorHandler);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = cookieService.get('admin_token');

  if (!token) {
    return router.createUrlTree(['/admin/login']);
  }

  return adminService.checkToken().pipe(
    map(() => true),
    catchError((err) => {
      cookieService.erase('admin_token');

      const error = err as HttpErrorResponse;
      const errorCode = error.error?.code || 'SESSION_EXPIRED';
      const message = errorHandler.getErrorMessage(errorCode);

      toastService.show(message, 'danger');

      return of(router.createUrlTree(['/admin/login']));
    })
  );
};
