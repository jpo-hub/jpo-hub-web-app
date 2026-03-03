import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '@environments/environment';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';
import {Question} from '../../core/models/question.model';
import {catchError, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  apiUrl = environment.apiURL;

  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);
  private http = inject(HttpClient);

  public getQuestions() {
    return this.http.get<Question[]>(`${this.apiUrl}/questions`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);      })
    );
  }

  public getQuestion(uid: string) {
    return this.http.get<Question>(`${this.apiUrl}/questions/${uid}`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);      })
    );
  }

  public updateQuestion(uid: string, question: Question) {
    return this.http.patch<Question>(`${this.apiUrl}/questions/${uid}`, question).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);      })
    );
  }

  public createQuestion(payload: { label: string }) {
    return this.http.post<Question>(`${this.apiUrl}/questions`, payload).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }

  public removeQuestion(uid: string) {
    return this.http.delete(`${this.apiUrl}/questions/${uid}`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;
        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    );
  }
}
