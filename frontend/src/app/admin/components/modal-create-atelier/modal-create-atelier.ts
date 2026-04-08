import { Component, EventEmitter, inject, Output} from '@angular/core';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {QuizService} from '../../services/quiz';
import {TextArea} from '../../../shared/components/text-area/text-area';

@Component({
  selector: 'app-modal-create-atelier',
  imports: [
    ButtonPrimary,
    FormsModule,
    InputForm,
    ReactiveFormsModule,
    TextArea
  ],
  templateUrl: './modal-create-atelier.html',
  styleUrl: './modal-create-atelier.scss',
})
export class ModalCreateAtelier {
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshQuestions = new EventEmitter<void>();

  label: string = '';
  description: string = '';
  dockerfilelink: string = '';
  draft: boolean = false;

  private quizService = inject(QuizService);

  fileName: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.fileName = file ? file.name : null;
  }

  onSubmit() {
    const payload = {
      label: this.label,
      draft: this.draft,
      description: this.description,
    };
    this.quizService.createQuestion(payload).subscribe({
      next: (question) => {
        this.closeModal.emit();
        this.refreshQuestions.emit();

        this.label = '';
        this.description = '';
        this.draft = false;
      }
    });
  }
}
