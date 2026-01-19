import { Component, Inject, Input} from '@angular/core';

@Component({
  selector: 'app-modal-participation',
  imports: [],
  templateUrl: './modal-participation.html',
  styleUrl: './modal-participation.scss',
})
export class ModalParticipation {
  @Input() codeParticipation!: number;
  @Input() labelAtelier!: string;
  @Input() isVisible!: boolean;
  @Input() onClose!: () => void;

  onCloseModal() {
    this.onClose();
  }
}
