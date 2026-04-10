import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {AteliersService} from '../../services/atelier';
import {isPlatformBrowser} from '@angular/common';
import {Atelier} from '../../../core/models/atelier.model';
import {LucideAngularModule} from 'lucide-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModalCreateAtelier} from '../../components/modal-create-atelier/modal-create-atelier';
import {ModalUpdateAtelier} from '../../components/modal-update-atelier/modal-update-atelier';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';

@Component({
  selector: 'app-ateliers',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    ModalCreateAtelier,
    ModalUpdateAtelier,
    ButtonPrimary
  ],
  templateUrl: './ateliers.html',
  styleUrl: './ateliers.scss',
})
export class AteliersAdmin implements OnInit{
  private ateliersService = inject(AteliersService);
  private platformId = inject(PLATFORM_ID);

  ateliers = signal<Atelier[]>([]);

  modalCreated = signal(false);
  modalDeleted = signal(false);
  modalUpdate = signal(false);

  searchTerm = signal('');
  statusFilter = signal<'all' | 'published' | 'draft'>('all');

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAteliers();
    }
  }

   loadAteliers() {
    this.ateliersService.getAteliers().subscribe(data => {
      return this.ateliers.set(data);
    });
  }

  filteredAteliers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return this.ateliers().filter((a) => {
      const matchesSearch = !term || a.label?.toLowerCase().includes(term);
      const matchesStatus =
        status === 'all' ||
        (status === 'draft' && a.draft) ||
        (status === 'published' && !a.draft);

      return matchesSearch && matchesStatus;
    });
  });

  createAtelier() {
    this.modalCreated.set(true);
  }

  selectedAtelier = signal<Atelier | null>(null);

  modalDeleteAtelier(atelier: Atelier) {
    this.selectedAtelier.set(atelier);
    this.modalDeleted.set(true);
  }

  modalUpdateAtelier(atelier: Atelier) {
    this.selectedAtelier.set(atelier);
    this.modalUpdate.set(true);
  }
  deleteAtelier() {
    const atelier = this.selectedAtelier();
    if (!atelier) return;

    this.ateliersService.removeAtelier(atelier.uid).subscribe({
      next: () => {
        this.closeModal();
      }
    })
  }

  closeModal() {
    this.modalCreated.set(false);
    this.modalDeleted.set(false);
    this.modalUpdate.set(false);
    this.loadAteliers();
  }
}
