import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ButtonPrimary } from '../../../shared/components/button-primary/button-primary';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputForm } from '../../../shared/components/input-form/input-form';
import { TextArea } from '../../../shared/components/text-area/text-area';
import { LucideAngularModule } from 'lucide-angular';
import { Filiere } from '../../../core/models/filiere.model';
import { Filieres } from '../../../core/services/filieres';
import { AteliersService } from '../../services/atelier';
import { Atelier } from '../../../core/models/atelier.model';

interface FiliereScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-modal-update-atelier',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonPrimary,
    FormsModule,
    InputForm,
    ReactiveFormsModule,
    TextArea,
    LucideAngularModule,
  ],
  templateUrl: './modal-update-atelier.html',
  styleUrl: './modal-update-atelier.scss',
})
export class ModalUpdateAtelier implements OnInit {
  atelier = input.required<Atelier>();
  closeModal = output<void>();
  refreshQuestions = output<void>();

  private filieresService = inject(Filieres);
  private atelierService = inject(AteliersService);

  label = '';
  description = '';
  dockerfilelink = '';
  draft = false;

  fileName = '';
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  filieresList: FiliereScore[] = [];
  availableFilieres = signal<Filiere[]>([]);

  ngOnInit() {
    const a = this.atelier();
    this.label = a.label;
    this.description = a.description;
    this.dockerfilelink = a.dockerfilelink;
    this.draft = a.draft;
    this.imagePreview = a.imageUrl;

    if (a.filiere) {
      this.filieresList = Object.entries(a.filiere).map(([name, score]) => ({ name, score }));
    }

    this.filieresService.loadFilieres();
    this.filieresService.filieres.subscribe((filieres) => {
      this.availableFilieres.set(filieres);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  addFiliere() {
    this.filieresList.push({ name: '', score: 1 });
  }

  removeFiliere(index: number) {
    this.filieresList.splice(index, 1);
  }

  onSubmit() {
    const filieresPayload: Record<string, number> = {};
    this.filieresList.forEach((f) => {
      if (f.name) filieresPayload[f.name] = f.score;
    });

    const formData = new FormData();
    formData.append('label', this.label);
    formData.append('description', this.description);
    formData.append('draft', String(this.draft));
    formData.append('dockerfilelink', this.dockerfilelink);
    formData.append('filieres', JSON.stringify(filieresPayload));

    if (this.selectedFile) {
      formData.append('imageUrl', this.selectedFile);
    }

    this.atelierService.updateAtelier(this.atelier().uid!, formData).subscribe({
      next: () => {
        this.refreshQuestions.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        console.error('Erreur mise à jour atelier', err);
      },
    });
  }
}
