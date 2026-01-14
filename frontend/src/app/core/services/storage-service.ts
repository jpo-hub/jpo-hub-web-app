import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly CANDIDAT_UID_KEY = 'candidat_uid';

  public setCandidatUid(uid: string): void {
    localStorage.setItem(this.CANDIDAT_UID_KEY, uid);
  }

  public getCandidatUid(): string | null {
    return localStorage.getItem(this.CANDIDAT_UID_KEY);
  }

  public clearCandidatData(): void {
    localStorage.removeItem(this.CANDIDAT_UID_KEY);
  }
}
