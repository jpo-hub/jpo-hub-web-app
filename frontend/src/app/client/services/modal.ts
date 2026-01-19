import {inject, Injectable, signal} from '@angular/core';
import {StorageService} from '../../core/services/storage-service';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private storageService = inject(StorageService)

  isVisible = signal(false);
  selectedAtelier = signal<{label: string, code: string} | null>(null);


  open(label: string) {
    const code = this.storageService.getCandidatCode() ?? 'AUCUN_CODE';
    this.selectedAtelier.set({ label, code });
    this.isVisible.set(true);
  }

  close() {
    this.isVisible.set(false);
  }
}
