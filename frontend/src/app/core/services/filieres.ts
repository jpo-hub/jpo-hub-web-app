import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Filiere} from '../models/filiere.model';

@Injectable({
  providedIn: 'root',
})
export class Filieres {
  private apiUrl = environment.apiURL;

  private filieresSubject = new BehaviorSubject<Filiere[]>([]);
  public filieres: Observable<Filiere[]> = this.filieresSubject.asObservable();

  constructor(private http: HttpClient) { }

  public getFilieres(): void {
    this.http
      .get<Filiere[]>(`${this.apiUrl}/filieres`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching filieres:', error);
          return of([]);
        })
      )
      .subscribe((filieres) => {
        this.filieresSubject.next(filieres);
      });
  }
}
