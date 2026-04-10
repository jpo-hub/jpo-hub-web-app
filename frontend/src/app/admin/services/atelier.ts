import {inject, Injectable, signal} from '@angular/core';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '@environments/environment';
import {catchError, throwError} from 'rxjs';
import {Atelier} from '../../core/models/atelier.model';

@Injectable({
  providedIn: 'root',
})
export class AteliersService {
  apiUrl = environment.apiURL;

  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);
  private http = inject(HttpClient);

  public getAteliers() {
    return this.http.get<Atelier[]>(`${this.apiUrl}/ateliers/all`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    )
  }

  public createAtelier(newAtelier: FormData) {
    return this.http.post(`${this.apiUrl}/ateliers`, newAtelier).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public removeAtelier(uid: string | undefined) {
    return this.http.delete(`${this.apiUrl}/ateliers/${uid}`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }
}
