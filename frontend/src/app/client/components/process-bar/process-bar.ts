import {Component, Input} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-process-bar',
  standalone: true,
  templateUrl: './process-bar.html',
  styleUrl: './process-bar.scss',
  imports: [DecimalPipe]
})
export class ProcessBar {
  @Input() value = 0;
  @Input() max = 1;
  @Input() showLabel = true;

  get percent(): number {
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  }
}
