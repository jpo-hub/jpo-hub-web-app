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
    {label: 'Accueil', link: '/', icon: 'home'},
    {label: 'Quiz', link: '/quiz', icon: 'user-plus'},
    {label: 'Ateliers', link: '/atelier', icon: 'sign-in-alt'}
  ];
}
