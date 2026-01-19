import {Injectable, signal} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  isVisible = signal(false);
  selectedAtelier = signal<{label: string, code: number} | null>(null);

  open(label: string) {
    this.selectedAtelier.set({ label, code: Math.floor(1000 + Math.random() * 9000) });
    this.isVisible.set(true);
  }

  close() {
    this.isVisible.set(false);
  }
}
