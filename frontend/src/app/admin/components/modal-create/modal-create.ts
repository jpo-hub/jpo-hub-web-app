import { Component, EventEmitter, inject, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {QuizService} from '../../services/quiz';

@Component({
  selector: 'app-modal-create',
  standalone: true,
  imports: [FormsModule, ButtonPrimary, InputForm],
  templateUrl: './modal-create.html',
  styleUrl: './modal-create.scss',
})
export class ModalCreate {
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshQuestions = new EventEmitter<void>();

  label: string = '';
  draft: boolean = false;
  multiple: boolean = false;

  private quizService = inject(QuizService);

  onSubmit() {
    const payload = {
      label: this.label,
      draft: this.draft,
      multiple: this.multiple,
    };
    this.quizService.createQuestion(payload).subscribe({
      next: (question) => {
        this.closeModal.emit();
        this.refreshQuestions.emit();

        this.label = '';
        this.draft = false;
        this.multiple = false;

      }
    });
  }
}
