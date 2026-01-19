import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {StorageService} from '../../core/services/storage-service';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  private apiUrl = environment.apiURL;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, {email, password});
  }

}
