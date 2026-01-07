import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-btn-nav-bar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './btn-nav-bar.html',
  styleUrl: './btn-nav-bar.scss',
})
export class BtnNavBar {
  @Input() label: string = '';
  @Input() link: string = '';
  @Input() icon: string = '';
}
