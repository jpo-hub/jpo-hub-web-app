import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '../../../core/models/question.model';
import {InputForm} from '../../../shared/components/input-form/input-form';

@Component({
  selector: 'app-modal-update',
  imports: [
    InputForm
  ],
  templateUrl: './modal-update.html',
  styleUrl: './modal-update.scss',
})
export class ModalUpdate {

  @Input() question: Question | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshQuestions = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }

  onRefresh() {
    this.refreshQuestions.emit();
  }
}
