import {Component, inject, Input} from '@angular/core';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {Router} from '@angular/router';

@Component({
  selector: 'app-modal-participation',
  imports: [
    ButtonPrimary
  ],
  templateUrl: './modal-participation.html',
  styleUrl: './modal-participation.scss',
})
export class ModalParticipation {
  @Input() codeParticipation!: string;
  @Input() labelAtelier!: string;
  @Input() isVisible!: boolean;
  @Input() onClose!: () => void;

  private router = inject(Router);

  onCloseModal() {
    this.router.navigate(['/']);
    this.onClose();
  }
}
