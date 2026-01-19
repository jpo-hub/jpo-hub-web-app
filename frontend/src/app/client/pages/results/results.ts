import { Component, inject, effect } from '@angular/core';
import { Candidat } from '../../service/candidat';
import { toSignal } from '@angular/core/rxjs-interop';
import {CardAtelier} from '../../components/card-atelier/card-atelier';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CardAtelier
  ],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  private candidatService = inject(Candidat);

  scoringData = toSignal(this.candidatService.getScoring(), { initialValue: null });

  constructor() {
    effect(() => {
      this.scoringData();
    });
  }
}
