import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private platformId = inject(PLATFORM_ID);

  public set(name: string, value: string, days: number): void {
    if (isPlatformBrowser(this.platformId)) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

      const expires = `expires=${date.toUTCString()}`;
      const secure = location.protocol === 'https:' ? 'Secure;' : '';
      const sameSite = 'SameSite=Strict;';

      document.cookie = `${name}=${value};${expires};path=/;${secure}${sameSite}`;
    }
  }

  public get(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  public erase(name: string): void {
    this.set(name, '', -1);
  }
}
