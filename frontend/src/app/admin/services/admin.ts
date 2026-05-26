import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AdminModel } from '../../core/models/admin.model';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '../../core/services/toast';
import { ErrorHandler } from '../../core/services/error-handler';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(private http: HttpClient) {}

  public getAdmins() {
    return this.http.get<AdminModel[]>(`${this.apiUrl}/admins`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public createAdmin(data: Omit<AdminModel, 'uid' | 'createdAt'> & { password: string }) {
    return this.http.post<AdminModel>(`${this.apiUrl}/admins`, data).pipe(
      tap(() => {
        this.toastService.show('Administrateur créé avec succès', 'success');
      }),
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public deleteAdmin(uid: string | undefined) {
    return this.http.delete(`${this.apiUrl}/admins/${uid}`).pipe(
      tap(() => {
        this.toastService.show('Administrateur supprimé avec succès', 'success');
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
