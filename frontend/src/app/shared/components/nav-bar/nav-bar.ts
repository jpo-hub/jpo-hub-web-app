import {Component} from '@angular/core';
import {BtnNavBar} from '../btn-nav-bar/btn-nav-bar';

@Component({
  selector: 'app-nav-bar',
  imports: [
    BtnNavBar

  ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  customLink = [
    {label: 'Accueil', link: '/', icon: 'house', exact: true},
    {label: 'Quiz', link: '/quiz', icon: 'list-todo', exact: false},
    {label: 'Ateliers', link: '/atelier', icon: 'folder-code', exact: false}
  ];
}
