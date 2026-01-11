import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavBar} from './shared/components/nav-bar/nav-bar';
import {Toast} from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
