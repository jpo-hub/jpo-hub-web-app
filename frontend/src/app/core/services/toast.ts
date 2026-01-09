import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  showError(message: string) {
    console.log(message);
  }
}
