import {Component, computed, effect, inject, signal} from '@angular/core';
import {ProcessBar} from '../../components/process-bar/process-bar';
import {DecimalPipe} from '@angular/common';
import {Questions} from '../../../core/services/questions';
import {Question} from '../../../core/models/question.model';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {filter, switchMap} from 'rxjs/operators';
import {CheckboxComponent} from '../../components/checkbox/checkbox';

@Component({
  selector: 'app-quiz',
  imports: [
    ProcessBar,
    DecimalPipe,
    ButtonPrimary,
    CheckboxComponent
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
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

  currentQuestionDetails = toSignal(
    toObservable(this.currentQuestionData).pipe(
      filter(question => question?.uid != null),
      switchMap(question => this.questionsServices.getQuestionByUid(question.uid))
    ),
    { initialValue: null }
  );

  constructor() {
    this.questionsServices.loadQuestions();

    effect(() => {
      this.currentQuestionData();
      this.currentQuestionDetails();

      console.log(this.currentQuestionDetails());
    });
  }

  nextQuestion() {
    if (this.currentQuestion() < this.totalQuestions() - 1) {
      this.currentQuestion.update(value => value + 1);
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    console.log('Quiz terminé !');
  }

  protected readonly Object = Object;
}
