import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuditLogModel } from '../../core/models/audit-log.model';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../core/services/toast';
import { ErrorHandler } from '../../core/services/error-handler';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(private http: HttpClient) {}

  public getAuditLogs() {
    return this.http.get<AuditLogModel[]>(`${this.apiUrl}/audit-logs`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }
}
