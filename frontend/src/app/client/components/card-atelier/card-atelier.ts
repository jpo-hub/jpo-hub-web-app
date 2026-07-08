import { Component, inject, Input} from '@angular/core';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {ModalService} from '../../services/modal';
import {FormState} from '../../../core/services/form-state';
import {StorageService} from '../../../core/services/storage-service';
import {Router} from '@angular/router';
import {ToastService} from '../../../core/services/toast';

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

  private readonly modalService = inject(ModalService);
  private readonly formState = inject(FormState);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  imageError = false;

  get shortDescription(): string {
    return this.description.length > 250 ? this.description.slice(0, 250) + '…' : this.description;
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/default-placeholder.png';
    }
  }

  onParticiper() {
    this.modalService.open(this.label);
    if (this.storageService.getCandidatCode()) {
      this.formState.removeCompleted();
      this.storageService.clearCandidatData();
    }
  }
}
