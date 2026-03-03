import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { QuizService } from '../../services/quiz';
import { Question } from '../../../core/models/question.model';
import {toSignal} from '@angular/core/rxjs-interop';
import {ModalCreate} from '../../components/modal-create/modal-create';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCreate],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  private quizService = inject(QuizService);

  questions = toSignal(this.quizService.getQuestions(), {
    initialValue: [] as Question[]
  });

  searchTerm = signal('');

  filteredQuestions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return this.questions();

    return this.questions().filter(q =>
      q.label?.toLowerCase().includes(term)
    );
  });

  modalCreated = signal(false);

  createQuestion() {
    this.modalCreated.set(true);
  }

  closeModal() {
    this.modalCreated.set(false);
  }

}
