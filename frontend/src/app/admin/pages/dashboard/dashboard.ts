import {Component, computed, inject} from '@angular/core';
import {StatCard} from '../../components/stat-card/stat-card';
import {Candidat} from '../../services/candidat';
import {toSignal} from '@angular/core/rxjs-interop';
import {CandidatsStat} from '../../components/candidats-stat/candidats-stat';
import {FiliereStat} from '../../components/filiere-stat/filiere-stat';
import {Stats} from '../../services/stats';
import {Stats as StatsModel} from '../../../core/models/stats.model';
import {AteliersTopStats} from '../../components/ateliers-top-stats/ateliers-top-stats';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCard,
    CandidatsStat,
    FiliereStat,
    AteliersTopStats
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private candidatService = inject(Candidat);
  private statsService = inject(Stats);

  candidats = toSignal(this.candidatService.getCandidats(), { initialValue: [] as any[] });

  stats = toSignal(this.statsService.getStats(), { initialValue: new StatsModel() })

  calculateConversion = computed(() => {
    const s = this.stats();
    if (!s || s.candidats === 0) return 0;

    const rate = (s.appointment / s.candidats) * 100;
    return Math.round(rate);
  });
}
