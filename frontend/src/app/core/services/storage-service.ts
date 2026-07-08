import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private readonly CANDIDAT_UID_KEY = 'candidat_uid';
  private readonly CANDIDAT_NAME_KEY = 'candidat_name';
  private readonly CANDIDAT_CODE_KEY = 'candidat_code';

  public setCandidatUid(uid: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CANDIDAT_UID_KEY, uid);
    }
  }

  public setCandidatName(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CANDIDAT_NAME_KEY, name);
    }
  }

  public setCandidatCode(code: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CANDIDAT_CODE_KEY, code);
    }
  }

  public getCandidatCode(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.CANDIDAT_CODE_KEY);
    }
    return null;
  }

  public getCandidatName(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.CANDIDAT_NAME_KEY);
    }
    return null;
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
      localStorage.removeItem(this.CANDIDAT_NAME_KEY);
      localStorage.removeItem(this.CANDIDAT_CODE_KEY);
    }
  }
}
