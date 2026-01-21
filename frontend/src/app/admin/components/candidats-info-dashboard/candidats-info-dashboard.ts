import { Component, effect, Input} from '@angular/core';
import {Atelier} from '../../../core/models/atelier.model';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-candidats-info-dashboard',
  imports: [
    UpperCasePipe
  ],
  templateUrl: './candidats-info-dashboard.html',
  styleUrl: './candidats-info-dashboard.scss',
})
export class CandidatsInfoDashboard {
  @Input() uid?: string;
  @Input() firstname!: string;
  @Input() lastname!: string;
  @Input() email!: string;
  @Input() ageRange!: string;
  @Input() appointment!: boolean;
  @Input() ateliers?: Atelier[];
}
