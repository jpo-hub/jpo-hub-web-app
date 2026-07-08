import { Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Candidat} from '../../services/candidat';
import {CandidatsInfoDashboard} from '../candidats-info-dashboard/candidats-info-dashboard';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-candidats-stat',
  imports: [
    CandidatsInfoDashboard,
    LucideAngularModule,
  ],
  templateUrl: './candidats-stat.html',
  styleUrl: './candidats-stat.scss',
})
export class CandidatsStat {
  private candidatService = inject(Candidat);

  candidats = toSignal(this.candidatService.getCandidatsOrderByDate());

  isLoaded = computed(() => this.candidats() !== undefined);
}
