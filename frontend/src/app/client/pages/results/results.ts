import {Component, effect, inject} from '@angular/core';
import {Candidat} from '../../service/candidat';
import {toSignal} from '@angular/core/rxjs-interop';
import {CardAtelier} from '../../components/card-atelier/card-atelier';
import {StorageService} from '../../../core/services/storage-service';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CardAtelier,
    TitleCasePipe
  ],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  private candidatService = inject(Candidat);
  private storageService = inject(StorageService);

  candidatName = this.storageService.getCandidatName() || null;
  scoringData = toSignal(this.candidatService.getScoring(), { initialValue: null });

  constructor() {
    effect(() => {
      this.scoringData();
    });
  }
}
