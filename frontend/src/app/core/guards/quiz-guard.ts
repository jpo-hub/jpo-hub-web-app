import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormState } from '../services/form-state';

export const quizGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const formState = inject(FormState);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (formState.isCompleted()) {
    return true;
  } else {
    router.navigate(['/quiz/register']);
    return false;
  }
};
