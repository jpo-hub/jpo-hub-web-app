import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';
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
}
