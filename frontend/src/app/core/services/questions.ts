import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {Question} from '../models/question.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Questions {
  private apiUrl = environment.apiURL;
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  public questions$: Observable<Question[]> = this.questionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  public loadQuestions(): void {
    this.http.get<Question[]>(`${this.apiUrl}/questions`)
      .pipe(
        catchError(err => {
          console.error('Error fetching questions:', err);
          return of([]);
        })
      )
      .subscribe(q => this.questionsSubject.next(q));
  }
}
