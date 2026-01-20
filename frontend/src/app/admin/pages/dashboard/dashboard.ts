import {Component, computed, inject} from '@angular/core';
import {StatCard} from '../../components/stat-card/stat-card';
import {Candidat} from '../../services/candidat';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private candidatService = inject(Candidat);

  candidats = toSignal(this.candidatService.getCandidats(), { initialValue: [] as any[] });

  totalUsers = computed(() => this.candidats().length);
}
