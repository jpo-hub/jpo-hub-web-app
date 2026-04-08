import { Component, EventEmitter, inject, Output, signal, OnInit } from '@angular/core';
import { ButtonPrimary } from '../../../shared/components/button-primary/button-primary';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputForm } from '../../../shared/components/input-form/input-form';
import { TextArea } from '../../../shared/components/text-area/text-area';
import { LucideAngularModule } from 'lucide-angular';
import { Filiere } from '../../../core/models/filiere.model';
import { Filieres } from '../../../core/services/filieres';
import { AteliersService } from '../../services/atelier';

interface FiliereScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-modal-create-atelier',
  imports: [
    ButtonPrimary,
    FormsModule,
    InputForm,
    ReactiveFormsModule,
    TextArea,
    LucideAngularModule
  ],
  templateUrl: './modal-create-atelier.html',
  styleUrls: ['./modal-create-atelier.scss'],
})
export class ModalCreateAtelier implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshQuestions = new EventEmitter<void>();

  private filieresService = inject(Filieres);
  private atelierService = inject(AteliersService);

  label: string = '';
  description: string = '';
  dockerfilelink: string = '';
  draft: boolean = false;

  fileName: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  filieresList: FiliereScore[] = [];

  availableFilieres = signal<Filiere[]>([]);

  ngOnInit() {
    this.filieresService.loadFilieres();

    this.filieresService.filieres.subscribe(filieres => {
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
      reader.onload = () => (this.imagePreview = reader.result);
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

    this.filieresList.forEach(f => {
      if (f.name) {
        filieresPayload[f.name] = f.score;
      }
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

    console.log(formData);

    this.atelierService.createAtelier(formData).subscribe({
      next: () => {
        this.refreshQuestions.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        console.error('Erreur création atelier', err);
      }
    });
  }
}
