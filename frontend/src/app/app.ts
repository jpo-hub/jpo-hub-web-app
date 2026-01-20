import {Component, computed, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NavBar} from './shared/components/nav-bar/nav-bar';
import {Toast} from './shared/components/toast/toast';
import {ModalService} from './client/services/modal';
import {ModalParticipation} from './client/components/modal-participation/modal-participation';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Toast, ModalParticipation],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  modalService = inject(ModalService);
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  showNavBar = computed(() => {
    const url = this.currentUrl();

    // 1. On définit les routes "valides" (celles où on veut la Nav)
    // On utilise startsWith pour les routes avec des enfants (comme /quiz/...)
    const validRoutes = ['/', '/quiz', '/admin/dashboard'];

    // 2. On vérifie si l'URL actuelle correspond au début d'une de nos routes valides
    const isValidRoute = validRoutes.some(route =>
      route === '/' ? url === '/' : url.startsWith(route)
    );

    // 3. On affiche la nav SEULEMENT si c'est une route valide ET que ce n'est PAS le login
    return isValidRoute && url !== '/admin/login';
  });

}
