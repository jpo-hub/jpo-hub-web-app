import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavBar} from './shared/components/nav-bar/nav-bar';
import {Toast} from './shared/components/toast/toast';
import {ModalService} from './client/services/modal';
import {ModalParticipation} from './client/components/modal-participation/modal-participation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Toast, ModalParticipation],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  modalService = inject(ModalService);
}
