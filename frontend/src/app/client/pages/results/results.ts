import { Component, inject, effect } from '@angular/core';
import { Candidat } from '../../service/candidat';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  private candidatService = inject(Candidat);

  scoringData = toSignal(this.candidatService.getScoring(), { initialValue: null });

  constructor() {
    effect(() => {
      const data = this.scoringData();
      if (data) {
        console.log('Signal mis à jour avec les données du back :', data);
      }
    });
  }
}
