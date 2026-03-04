import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Question} from '../../../core/models/question.model';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {QuizService} from '../../services/quiz';

@Component({
  selector: 'app-modal-update',
  imports: [
    InputForm,
    ButtonPrimary,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './modal-update.html',
  styleUrl: './modal-update.scss',
})
export class ModalUpdate implements OnChanges {
  @Input() question!: Question | null;

  label: string = '';
  draft: boolean = false;
  multiple: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['question'] && this.question) {
      this.label = this.question.label;
      this.draft = this.question.draft;
      this.multiple = this.question.multiple;
    }
  }

  onSubmit(): void {
    const payload = {
      label: this.label,
      draft: this.draft,
      multiple: this.multiple,
    };

    console.log('Form submitted:', payload);
  }
}
