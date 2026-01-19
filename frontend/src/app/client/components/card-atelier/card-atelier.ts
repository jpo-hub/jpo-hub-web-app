import { Component, Input} from '@angular/core';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';

@Component({
  selector: 'app-card-atelier',
  imports: [
    ButtonPrimary
  ],
  templateUrl: './card-atelier.html',
  styleUrl: './card-atelier.scss',
})
export class CardAtelier {
  @Input() uid!: string;
  @Input() label!: string;
  @Input() description!: string;
  @Input() imageUrl!: string;
  @Input() dockerfilelink!: string;
}
