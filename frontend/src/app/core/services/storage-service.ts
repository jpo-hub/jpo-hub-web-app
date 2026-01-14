import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private readonly CANDIDAT_UID_KEY = 'candidat_uid';

  public setCandidatUid(uid: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CANDIDAT_UID_KEY, uid);
    }
  }

  public getCandidatUid(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.CANDIDAT_UID_KEY);
    }
    return null;
  }

  public clearCandidatData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.CANDIDAT_UID_KEY);
    }
  }
}
