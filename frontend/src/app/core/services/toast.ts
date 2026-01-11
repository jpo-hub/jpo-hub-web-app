import {Injectable, signal} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  isVisible = signal(false);
  message = signal('');
  status = signal('');
  icon = signal('');

  show(message: string, status: string): void {
    this.message.set(message);

    if (status === 'success') {
      this.icon.set('circle-check');
    } else if (status === 'danger') {
      this.icon.set('circle-alert');
    } else if (status === 'info') {
      this.icon.set('info');
    } else if (status === 'warning') {
      this.icon.set('triangle-alert');
    }

    this.status.set(status);
    this.isVisible.set(true);

    setTimeout(() => {
      this.hide();
    }, 5000);
  }

  hide(): void {
    this.isVisible.set(false);
  }
}
