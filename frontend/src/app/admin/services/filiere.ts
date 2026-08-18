import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Filiere } from '../../core/models/filiere.model';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '../../core/services/toast';
import { ErrorHandler } from '../../core/services/error-handler';

@Injectable({
  providedIn: 'root',
})
export class FiliereService {
  apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(private http: HttpClient) {}

  public getFilieres() {
    return this.http.get<Filiere[]>(`${this.apiUrl}/filieres`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public createFiliere(data: { label: string }) {
    return this.http.post<Filiere>(`${this.apiUrl}/filieres`, data).pipe(
      tap(() => {
        this.toastService.show('Filière créée avec succès', 'success');
      }),
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public updateFiliere(uid: string, data: { label: string }) {
    return this.http.patch<Filiere>(`${this.apiUrl}/filieres/${uid}`, data).pipe(
      tap(() => {
        this.toastService.show('Filière mise à jour avec succès', 'success');
      }),
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public deleteFiliere(uid: string) {
    return this.http.delete(`${this.apiUrl}/filieres/${uid}`).pipe(
      tap(() => {
        this.toastService.show('Filière supprimée avec succès', 'success');
      }),
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }
}
