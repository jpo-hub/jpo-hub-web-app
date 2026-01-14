import {Routes} from '@angular/router';
import {NotFound} from './shared/pages/not-found/not-found';
import {Home} from './client/pages/home/home';
import {Register} from './client/pages/register/register';
import {Quiz} from './client/pages/quiz/quiz';
import {quizGuard} from './core/guards/quiz-guard';
import {Results} from './client/pages/results/results';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quiz', component: Quiz, canActivate: [quizGuard] },
  { path: 'quiz/register', component: Register },
  { path: 'quiz/results', component: Results },
  { path: '**', component: NotFound }
];
