import {Routes} from '@angular/router';
import {NotFound} from './shared/pages/not-found/not-found';
import {Home} from './client/pages/home/home';
import {Register} from './client/pages/register/register';
import {Quiz} from './client/pages/quiz/quiz';
import {quizGuard} from './core/guards/quiz-guard';
import {Results} from './client/pages/results/results';
import {Login} from './admin/pages/login/login';
import {Dashboard} from './admin/pages/dashboard/dashboard';
import {Quiz as QuizAdmin} from './admin/pages/quiz/quiz';
import {adminGuard} from './core/guards/admin-guard';
import {AteliersAdmin} from './admin/pages/ateliers/ateliers';
import {Candidats} from './admin/pages/candidats/candidats';
import {User} from './admin/pages/user/user';
import {Ateliers} from './client/pages/ateliers/ateliers';

export const routes: Routes = [
  { path: '', component: Home },
  
  { path: 'ateliers', component: Ateliers },

  { path: 'quiz', component: Quiz, canActivate: [quizGuard] },
  { path: 'quiz/register', component: Register },
  { path: 'quiz/results', component: Results, canActivate: [quizGuard] },

  { path: 'admin/login', component: Login},
  { path: 'admin/dashboard', component: Dashboard , canActivate: [adminGuard]},
  { path: 'admin/quiz', component: QuizAdmin , canActivate: [adminGuard]},
  { path: 'admin/ateliers', component: AteliersAdmin , canActivate: [adminGuard]},
  { path: 'admin/candidats', component: Candidats , canActivate: [adminGuard]},
  { path: 'admin/users', component: User , canActivate: [adminGuard]},


  { path: '**', component: NotFound }
];
