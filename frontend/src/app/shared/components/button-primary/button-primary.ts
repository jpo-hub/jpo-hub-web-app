import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-button-primary',
  imports: [
    RouterLink
  ],
  templateUrl: './button-primary.html',
  styleUrl: './button-primary.scss',
})
export class ButtonPrimary{
  @Input() label: string | undefined;
  @Input() link: string | undefined;
}
