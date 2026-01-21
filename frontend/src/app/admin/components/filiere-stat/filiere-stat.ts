import {Component, effect, inject} from '@angular/core';
import {Stats} from '../../services/stats';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-filiere-stat',
  imports: [],
  templateUrl: './filiere-stat.html',
  styleUrl: './filiere-stat.scss',
})
export class FiliereStat {
  private statsService = inject(Stats);

  stats = toSignal(this.statsService.getStats(), { initialValue: [] as any[] });

  constructor() {
    effect(() => {
      console.log(this.stats());
    });
  }
}
