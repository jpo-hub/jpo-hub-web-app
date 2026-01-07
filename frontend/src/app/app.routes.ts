import { Routes } from '@angular/router';
import {NotFound} from './shared/pages/not-found/not-found';
import {Home} from './pages/client/home/home';
import {Register} from './pages/client/register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quiz/register', component: Register },
  { path: '**', component: NotFound }
];
