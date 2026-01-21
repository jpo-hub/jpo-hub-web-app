import { Component, effect, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Candidat} from '../../services/candidat';
import {CandidatModel} from '../../../core/models/candidat.model';
import {CandidatsInfoDashboard} from '../candidats-info-dashboard/candidats-info-dashboard';

@Component({
  selector: 'app-candidats-stat',
  imports: [
    CandidatsInfoDashboard
  ],
  templateUrl: './candidats-stat.html',
  styleUrl: './candidats-stat.scss',
})
export class CandidatsStat {
  private candidatService = inject(Candidat);

  candidats = toSignal(this.candidatService.getCandidats(), { initialValue: [] as CandidatModel[] });
}
