import {Component, computed, inject} from '@angular/core';
import {Stats} from '../../services/stats';
import {toSignal} from '@angular/core/rxjs-interop';
import {Stats as StatsModel} from '../../../core/models/stats.model';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-ateliers-top-stats',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './ateliers-top-stats.html',
  styleUrl: './ateliers-top-stats.scss',
})
export class AteliersTopStats {
  private statsService = inject(Stats);

  stats = toSignal(this.statsService.getStats(), { initialValue: new StatsModel() });

  topAteliersList = computed(() => this.stats().topAteliers ?? []);

}
