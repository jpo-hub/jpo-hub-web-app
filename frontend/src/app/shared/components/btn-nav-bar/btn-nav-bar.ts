import { Component, Input} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-btn-nav-bar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './btn-nav-bar.html',
  styleUrl: './btn-nav-bar.scss',
})
export class BtnNavBar {
  @Input() label: string | undefined;
  @Input() link: string | undefined;
}
