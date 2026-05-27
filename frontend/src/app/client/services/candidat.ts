import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap, throwError} from 'rxjs';
import {CandidatModel} from '../../core/models/candidat.model';
import {StorageService} from '../../core/services/storage-service';
import {Atelier} from '../../core/models/atelier.model';
import {ToastService} from '../../core/services/toast';
import {ErrorHandler} from '../../core/services/error-handler';

interface CandidatResponse {
  uid: string;
  codeCandidat: number;
}

@Injectable({
  providedIn: 'root',
})
export class Candidat {
  private apiUrl = environment.apiURL;
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public submitCandidature(formData: CandidatModel) {
    return this.http.post<CandidatResponse>(`${this.apiUrl}/candidats`, formData).pipe(
      tap(response => {
        if (response.uid) {
          this.storageService.setCandidatUid(response.uid);
        }
        if (response.codeCandidat) {
          this.storageService.setCandidatCode(response.codeCandidat.toString());
        }
      })
    );
  }

  public submitScore(score: Record<string, number>) {
    const uid = this.storageService.getCandidatUid();
    const body = { filieres: score };
    
    console.log('body', body)

    return this.http.post(`${this.apiUrl}/answers/traitement/${uid}`, body).pipe(
      tap(res => {
        console.log('Succès !', res)
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  public getScoring() {
    const uid = this.storageService.getCandidatUid();
    return this.http.get<Atelier[]>(`${this.apiUrl}/scoring/${uid}`).pipe(
      catchError(err => {
        const error = err as HttpErrorResponse;

        const message = this.errorHandler.getErrorMessage(error.error.code);
        this.toastService.show(message, 'danger');
        return throwError(() => err);
      })
    )
  }
}
