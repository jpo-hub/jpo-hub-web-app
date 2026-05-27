import { Component, inject, Input} from '@angular/core';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {ModalService} from '../../services/modal';
import {FormState} from '../../../core/services/form-state';
import {StorageService} from '../../../core/services/storage-service';

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

  private modalService = inject(ModalService);
  private formState = inject(FormState);
  private storageService = inject(StorageService);

  imageError = false;

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/default-placeholder.png';
    }
  }

  onParticiper() {
    this.modalService.open(this.label);
    this.formState.removeCompleted();
    this.storageService.clearCandidatData()
  }
}
