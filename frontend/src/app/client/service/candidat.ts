import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {CandidatModel} from '../../core/models/candidat.model';


@Injectable({
  providedIn: 'root',
})
export class Candidat {
  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  public submitCandidature(formData: CandidatModel) {
    return this.http.post(`${this.apiUrl}/candidats`, formData);
  }
}
