import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {AteliersService} from '../../services/atelier';
import {isPlatformBrowser} from '@angular/common';
import {Atelier} from '../../../core/models/atelier.model';

@Component({
  selector: 'app-ateliers',
  imports: [],
  templateUrl: './ateliers.html',
  styleUrl: './ateliers.scss',
})
export class AteliersAdmin implements OnInit{
  private ateliersService = inject(AteliersService);
  private platformId = inject(PLATFORM_ID);

  ateliers = signal<Atelier[]>([]);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAteliers();
    }
  }

  private loadAteliers() {
    this.ateliersService.getAteliers().subscribe(data => {
      return this.ateliers.set(data);
    });
  }
}
