import {inject, Injectable } from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CandidatModel} from '../../core/models/candidat.model';
import {catchError, throwError} from 'rxjs';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';

@Injectable({
  providedIn: 'root',
})
export class Candidat {
  apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(
    private http: HttpClient
  ) { }

  public getCandidats() {
    return this.http.get<CandidatModel[]>(`${this.apiUrl}/candidats`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public getCandidatsOrderByDate() {
    return this.http.get<CandidatModel[]>(`${this.apiUrl}/candidats?orderBy=desc&limit=3`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    )
  }
}
