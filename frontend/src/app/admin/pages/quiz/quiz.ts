import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {QuizService} from '../../services/quiz';
import {Question} from '../../../core/models/question.model';
import {ModalCreate} from '../../components/modal-create/modal-create';
import {LucideAngularModule} from 'lucide-angular';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {ModalUpdate} from '../../components/modal-update/modal-update';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCreate, LucideAngularModule, ButtonPrimary, ModalUpdate],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz implements OnInit {
  private quizService = inject(QuizService);

  questions = signal<Question[]>([]);

  searchTerm = signal('');

  ngOnInit() {
    this.loadQuestions();
  }
  filteredQuestions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.questions();
    return this.questions().filter(q => q.label?.toLowerCase().includes(term));
  });

  modalCreated = signal(false);
  modalDeleted = signal(false);
  modalUpdate = signal(false);

  createQuestion() {
    this.modalCreated.set(true);
  }

  selectedQuestion = signal<Question | null>(null);
  modalDeleteQuestion(question: Question) {
    this.selectedQuestion.set(question);
    this.modalDeleted.set(true);
  }
  deleteQuestion() {
    const question = this.selectedQuestion();
    if (!question) return;

    this.quizService.removeQuestion(question.uid).subscribe({
      next: () => {
        this.closeModal();
      }
    })
  }

  modalUpdateQuestion(question: Question) {
    this.selectedQuestion.set(question);
    this.modalUpdate.set(true);
  }
  updateQuestion() {
    const question = this.selectedQuestion();
    if (!question) return;
  }

  closeModal() {
    this.modalCreated.set(false);
    this.modalDeleted.set(false);
    this.modalUpdate.set(false);
    this.loadQuestions();
  }

  loadQuestions() {
    this.quizService.getQuestions().subscribe(data => {
      this.questions.set(data);
    })
  }
}
