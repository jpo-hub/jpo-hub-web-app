import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  showError(message: string) {
    // ex: ngx-toastr, Angular Material Snackbar, custom toast
  }
}
