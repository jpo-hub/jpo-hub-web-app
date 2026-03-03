import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {QuizService} from '../../services/quiz';
import {Question} from '../../../core/models/question.model';
import {ModalCreate} from '../../components/modal-create/modal-create';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCreate, LucideAngularModule],
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

  // Modal open/close
  modalCreated = signal(false);

  createQuestion() {
    this.modalCreated.set(true);
  }

  closeModal() {
    this.modalCreated.set(false);
    this.loadQuestions();
  }

  loadQuestions() {
    this.quizService.getAllQuestions().subscribe(data => {
      this.questions.set(data);
    })
  }
}
