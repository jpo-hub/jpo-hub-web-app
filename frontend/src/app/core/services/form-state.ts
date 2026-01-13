import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FormState {
  private platformId = inject(PLATFORM_ID);

  setCompleted() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('formCompleted', 'true');
    }
  }

  removeCompleted() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('formCompleted');
    }
  }

  isCompleted(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('formCompleted') === 'true';
    }
    return false;
  }
}
