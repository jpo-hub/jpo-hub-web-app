import { Routes } from '@angular/router';
import {NotFound} from './shared/pages/not-found/not-found';
import {Home} from './pages/client/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: '**', component: NotFound }
];
