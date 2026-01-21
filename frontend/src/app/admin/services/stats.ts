import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Stats {
  apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(
    private http: HttpClient
  ) { }

  public getStats() {
    return this.http.get(`${this.apiUrl}/stats`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return [];
      })
    );
  }
}
