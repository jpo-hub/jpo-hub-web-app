import { Component, computed, inject } from '@angular/core';
import { StatCard } from '../../components/stat-card/stat-card';
import { Candidat } from '../../services/candidat';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatsService } from '../../services/stats';
import {LastStats, Stats } from '../../../core/models/stats.model';
import { CandidatsStat } from '../../components/candidats-stat/candidats-stat';
import { FiliereStat } from '../../components/filiere-stat/filiere-stat';
import { AteliersTopStats } from '../../components/ateliers-top-stats/ateliers-top-stats';

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
  private statsService = inject(StatsService);

  candidats = toSignal(this.candidatService.getCandidats(), { initialValue: [] as any[] });
  stats = toSignal(this.statsService.getStats(), { initialValue: new Stats() });
  lastStats = toSignal(this.statsService.getLastStats(), { initialValue: new LastStats() });

  // Calcul du taux de conversion actuel
  calculateConversion = computed(() => {
    const s = this.stats();
    if (!s || s.candidats === 0) return 0;
    const rate = (s.appointment / s.candidats) * 100;
    return Math.round(rate);
  });

  // Fonction sécurisée pour calculer la variation en %
  computeDelta(current: number, previous: number): number {
    const curr = current ?? 0;
    const prev = previous ?? 0;

    if (curr === prev) return 0;           // valeurs identiques → 0%
    if (prev === 0) return curr > 0 ? 100 : 0; // pas de valeur précédente
    return Math.round(((curr - prev) / prev) * 100);
  }

  // Deltas pour toutes les stats
  deltas = computed(() => {
    const s = this.stats();
    const l = this.lastStats();

    const last = l?.data ?? { candidats: 0, appointment: 0, ateliersActifs: 0 };

    return {
      candidats: this.computeDelta(s?.candidats ?? 0, last.candidats ?? 0),
      appointment: this.computeDelta(s?.appointment ?? 0, last.appointment ?? 0),
      ateliersActifs: this.computeDelta(s?.ateliersActifs ?? 0, last.ateliersActifs ?? 0),
      conversion: this.computeDelta(
        (s?.candidats ? (s.appointment / s.candidats) * 100 : 0),
        (last.candidats ? (last.appointment / last.candidats) * 100 : 0)
      )
    };
  });
}
