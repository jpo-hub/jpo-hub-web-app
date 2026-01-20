import { Injectable } from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Candidat {
  apiUrl = environment.apiURL;

  constructor(
    private http: HttpClient
  ) { }

  public getCandidats() {
    return this.http.get(`${this.apiUrl}/candidats`);
  }
}
