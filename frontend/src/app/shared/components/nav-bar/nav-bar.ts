import {Component, computed, inject} from '@angular/core';
import {BtnNavBar} from '../btn-nav-bar/btn-nav-bar';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [
    BtnNavBar
  ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  private readonly router = inject(Router);

  customLink = [
    {label: 'Accueil', link: '/', icon: 'house', exact: true},
    {label: 'Quiz', link: '/quiz', icon: 'list-todo', exact: false},
    {label: 'Ateliers', link: '/ateliers', icon: 'folder-code', exact: false}
  ];

  adminLinks = [
    {label: 'Dashboard', link: '/admin/dashboard', icon: 'layout-dashboard', exact: true},
    {label: 'Gestion Quiz', link: '/admin/quiz', icon: 'list-todo', exact: false},
    {label: 'Ateliers', link: '/admin/ateliers', icon: 'folder-code', exact: false},
    {label: 'Candidats', link: '/admin/candidats', icon: 'file-user', exact: true},
    {label: 'Utilisateur', link: '/admin/users', icon: 'circle-user-round', exact: true},
    {label: 'Journal de log', link: '/admin/log', icon: 'file-text', exact: true},
  ];

  logout() {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/admin/login']);
  }

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isAdminRoute = computed(() => this.url().startsWith('/admin'));

}
