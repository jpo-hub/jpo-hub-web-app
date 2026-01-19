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
    )
  );

  showNavBar = computed(() => this.currentUrl() !== '/admin/login');

}
