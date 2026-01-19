import { Component, Inject, Input, numberAttribute} from '@angular/core';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';

@Component({
  selector: 'app-modal-participation',
  imports: [
    ButtonPrimary
  ],
  templateUrl: './modal-participation.html',
  styleUrl: './modal-participation.scss',
})
export class ModalParticipation {
  @Input({transform: numberAttribute}) codeParticipation!: number;
  @Input() labelAtelier!: string;
  @Input() isVisible!: boolean;
  @Input() onClose!: () => void;

  onCloseModal() {
    this.onClose();
  }
}
