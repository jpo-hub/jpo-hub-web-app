import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs';
import {LastStats, Stats} from '../../core/models/stats.model';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(
    private http: HttpClient
  ) { }

  public getStats() {
    return this.http.get<Stats>(`${this.apiUrl}/stats`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return [];
      })
    );
  }

  public getLastStats() {
    return this.http.get<LastStats>(`${this.apiUrl}/stats/snapshots/last`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return [];
      })
    );
  }
}
