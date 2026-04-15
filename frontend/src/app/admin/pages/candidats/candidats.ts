import {ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {CandidatModel} from '../../../core/models/candidat.model';
import {Candidat} from '../../services/candidat';
import {LucideAngularModule} from 'lucide-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';

@Component({
  selector: 'app-candidats',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonPrimary,
  ],
  templateUrl: './candidats.html',
  styleUrl: './candidats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Candidats implements OnInit {
  private candidatService = inject(Candidat);
  private platformId = inject(PLATFORM_ID);

  candidats = signal<CandidatModel[]>([]);
  modalDeleted = signal(false);
  selectedCandidat = signal<CandidatModel | null>(null);

  searchTerm = signal('');
  consentementFilter = signal<'all' | 'consent' | 'anonymous'>('all');

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCandidats();
    }
  }

  loadCandidats() {
    this.candidatService.getCandidats().subscribe(data => {
      this.candidats.set(data);
    });
  }

  filteredCandidats = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filter = this.consentementFilter();

    return this.candidats().filter((c) => {
      const matchesSearch =
        !term ||
        c.firstname?.toLowerCase().includes(term) ||
        c.lastname?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'consent' && c.consentement) ||
        (filter === 'anonymous' && !c.consentement);

      return matchesSearch && matchesFilter;
    });
  });

  getFilieres(candidat: CandidatModel): string[] {
    return Object.keys(candidat.filieres ?? {});
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  toggleAppointment(candidat: CandidatModel) {
    if (!candidat.uid) return;
    const newValue = !candidat.appointment;

    this.candidatService.updateCandidat(candidat.uid, { appointment: newValue }).subscribe({
      next: () => {
        this.candidats.update(list =>
          list.map(c => c.uid === candidat.uid ? { ...c, appointment: newValue } : c)
        );
      }
    });
  }

  modalDeleteCandidat(candidat: CandidatModel) {
    this.selectedCandidat.set(candidat);
    this.modalDeleted.set(true);
  }

  deleteCandidat() {
    const candidat = this.selectedCandidat();
    if (!candidat) return;

    this.candidatService.deleteCandidat(candidat.uid).subscribe({
      next: () => {
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.modalDeleted.set(false);
    this.selectedCandidat.set(null);
    this.loadCandidats();
  }
}
