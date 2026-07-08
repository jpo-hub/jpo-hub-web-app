import {Component, effect, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Ateliers as AtelierService} from '../../services/ateliers';
import {CardAtelier} from '../../components/card-atelier/card-atelier';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';

@Component({
  selector: 'app-ateliers',
  imports: [
    CardAtelier,
    ButtonPrimary
  ],
  templateUrl: './ateliers.html',
  styleUrl: './ateliers.scss',
})
export class Ateliers {
  private ateliersService = inject(AtelierService);

  ateliers = toSignal(this.ateliersService.getAllAteliers());

  constructor() {
    effect(() => console.log(this.ateliers()));
  }
}
