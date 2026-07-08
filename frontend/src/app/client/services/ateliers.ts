import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Atelier} from '../../core/models/atelier.model';
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ateliers {
  private apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(
    private http: HttpClient,
  ) {}

  public getAllAteliers(): Observable<Atelier[]> {
    return this.http.get<Atelier[]>(`${this.apiUrl}/ateliers`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    )
  }
}
