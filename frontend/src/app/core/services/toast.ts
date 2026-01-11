import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  isVisible = signal(false);
  message = signal('');
  status = signal('');

  show(message: string, status: string): void {
    this.message.set(message);
    this.status.set(status);
    this.isVisible.set(true);
  }

  hide(): void {
    this.isVisible.set(false);
  }
}
