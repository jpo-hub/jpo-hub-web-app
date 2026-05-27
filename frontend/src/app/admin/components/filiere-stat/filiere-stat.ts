import { Component, computed, inject } from '@angular/core';
import { StatsService } from '../../services/stats';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-filiere-stat',
  imports: [DecimalPipe, LucideAngularModule],
  templateUrl: './filiere-stat.html',
  styleUrl: './filiere-stat.scss',
})
export class FiliereStat {
  private statsService = inject(StatsService);

  rawStats = toSignal(this.statsService.getStats());

  isLoaded = computed(() => this.rawStats() !== undefined);

  filieres = computed(() => {
    const data = this.rawStats();
    if (!data?.filieres) return [];

    return Object.entries(data.filieres).map(([name, count]) => ({
      name,
      count: count as number
    }));
  });

  total = computed(() => {
    return this.filieres().reduce((sum: number, f: { count: number }) => sum + f.count, 0);
  });

  donutSegments = computed(() => {
    const all = this.filieres();
    const totalCount = this.total();
    let cumulativePercentage = 0;

    return all.map(f => {
      const percentage = totalCount > 0 ? (f.count / totalCount) * 100 : 0;
      const offset = cumulativePercentage;
      cumulativePercentage += percentage;

      return {
        ...f,
        percentage,
        strokeDasharray: `${percentage} ${100 - percentage}`,
        strokeDashoffset: -offset,
        color: this.getFiliereColor(f.name)
      };
    });
  });

  getFiliereColor(name: string): string {
    const colors: Record<string, string> = {
      'informatique': '#00eaff',
      'ia-&-data': '#23B1D2',
      'cybersecurite': '#5affb6'
    };
    return colors[name] || '#6b7280';
  }
}
