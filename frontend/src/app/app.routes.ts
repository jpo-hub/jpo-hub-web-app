import { Routes } from '@angular/router';
import {NotFound} from './shared/pages/not-found/not-found';
import {Home} from './client/pages/home/home';
import {Register} from './client/pages/register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quiz/register', component: Register },
  { path: '**', component: NotFound }
];
