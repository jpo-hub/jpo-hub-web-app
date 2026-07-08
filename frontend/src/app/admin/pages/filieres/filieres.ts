import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { Filiere } from '../../../core/models/filiere.model';
import { FiliereService } from '../../services/filiere';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonPrimary } from '../../../shared/components/button-primary/button-primary';
import { InputForm } from '../../../shared/components/input-form/input-form';

@Component({
  selector: 'app-filieres-admin',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonPrimary,
    InputForm,
    TitleCasePipe,
  ],
  templateUrl: './filieres.html',
  styleUrl: './filieres.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilieresAdmin implements OnInit {
  private filiereService = inject(FiliereService);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  filieres = signal<Filiere[]>([]);
  modalCreate = signal(false);
  modalUpdate = signal(false);
  modalDeleted = signal(false);
  selectedFiliere = signal<Filiere | null>(null);

  searchTerm = signal('');

  createForm = this.fb.group({
    label: ['', Validators.required],
  });

  updateForm = this.fb.group({
    label: ['', Validators.required],
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFilieres();
    }
  }

  loadFilieres() {
    this.filiereService.getFilieres().subscribe(data => {
      this.filieres.set(data);
    });
  }

  filteredFilieres = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.filieres().filter(f =>
      !term || f.label.toLowerCase().includes(term)
    );
  });

  openCreateModal() {
    this.createForm.reset({ label: '' });
    this.modalCreate.set(true);
  }

  submitCreate() {
    if (this.createForm.invalid) return;

    const value = this.createForm.getRawValue() as { label: string };

    this.filiereService.createFiliere(value).subscribe({
      next: () => {
        this.closeModal();
      }
    });
  }

  openUpdateModal(filiere: Filiere) {
    this.selectedFiliere.set(filiere);
    this.updateForm.reset({ label: filiere.label });
    this.modalUpdate.set(true);
  }

  submitUpdate() {
    const filiere = this.selectedFiliere();
    if (!filiere || this.updateForm.invalid) return;

    const value = this.updateForm.getRawValue() as { label: string };

    this.filiereService.updateFiliere(filiere.uid, value).subscribe({
      next: () => {
        this.closeModal();
      }
    });
  }

  modalDeleteFiliere(filiere: Filiere) {
    this.selectedFiliere.set(filiere);
    this.modalDeleted.set(true);
  }

  deleteFiliere() {
    const filiere = this.selectedFiliere();
    if (!filiere) return;

    this.filiereService.deleteFiliere(filiere.uid).subscribe({
      next: () => {
        this.closeModal();
      },
      error: () => {
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.modalCreate.set(false);
    this.modalUpdate.set(false);
    this.modalDeleted.set(false);
    this.selectedFiliere.set(null);
    this.loadFilieres();
  }
}
