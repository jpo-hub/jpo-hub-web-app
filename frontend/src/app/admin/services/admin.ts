import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {LoginResponse} from '../../core/models/login-response.model';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  private apiUrl = environment.apiURL;

  constructor(
    private http: HttpClient,
  ) {}

  public login(email: string, password: string) {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
  }

  public checkToken() {
    return this.http.get(`${this.apiUrl}/auth/me`);
  }
}
