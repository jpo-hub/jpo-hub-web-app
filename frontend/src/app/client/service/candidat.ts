import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, tap, throwError} from 'rxjs';
import {CandidatModel} from '../../core/models/candidat.model';
import {StorageService} from '../../core/services/storage-service';

interface CandidatResponse {
  uid: string;
}

@Injectable({
  providedIn: 'root',
})
export class Candidat {
  private apiUrl = environment.apiURL;

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
      })
    );
  }

  public submitScore(score: Record<string, number>) {
    const uid = this.storageService.getCandidatUid();
    const body = { filieres: score };

    return this.http.post(`${this.apiUrl}/answers/traitement/${uid}`, body).pipe(
      tap(res => {
        console.log('Succès !', res)
      }),
      catchError(err => {
        console.error('Code d\'erreur HTTP :', err.status);
        console.error('Détails de l\'erreur :', err.error);
        return throwError(() => err);
      })
    );
  }
}
