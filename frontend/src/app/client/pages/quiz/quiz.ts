import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { ProcessBar } from '../../components/process-bar/process-bar';
import { DecimalPipe } from '@angular/common';
import { Questions } from '../../../core/services/questions';
import { Question } from '../../../core/models/question.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-quiz',
  imports: [
    ProcessBar,
    DecimalPipe
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz implements OnInit {
  private questionsServices = inject(Questions);

  currentQuestion = signal(0);

  questions = toSignal(this.questionsServices.questions$, { initialValue: [] as Question[] });

  totalQuestions = computed(() => this.questions().length);

  progressPercent = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, ((this.currentQuestion() + 1) / total) * 100));
  });

  currentQuestionData = computed(() => {
    return this.questions()[this.currentQuestion()];
  });

  ngOnInit() {
    this.questionsServices.loadQuestions();
  }

  nextQuestion() {
    if (this.currentQuestion() < this.totalQuestions() - 1) {
      this.currentQuestion.update(value => value + 1);
    } else {
      console.log('Quiz terminé !');
    }
  }

  previousQuestion() {
    if (this.currentQuestion() > 0) {
      this.currentQuestion.update(value => value - 1);
    }
  }
}
