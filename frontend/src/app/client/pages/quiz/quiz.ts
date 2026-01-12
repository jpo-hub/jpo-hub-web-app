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
  selectedAnswers = signal<{ [questionUid: string]: Question['reponses'] }>({});

  cumulativeFilieres = signal<{ [key: string]: number }>({});

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

  onAnswerChange(answer: Question['reponses'][0], checked: boolean) {
    const question = this.currentQuestionDetails();
    if (!question) return;

    const currentAnswers = this.selectedAnswers()[question.uid] || [];

    if (checked) {
      this.selectedAnswers.update(prev => ({
        ...prev,
        [question.uid]: [...currentAnswers, answer]
      }));
    } else {
      this.selectedAnswers.update(prev => ({
        ...prev,
        [question.uid]: currentAnswers.filter(a => a.uid !== answer.uid)
      }));
    }
  }

  getCurrentQuestionFilieresTotal() {
    const question = this.currentQuestionDetails();
    if (!question) return {};

    const answers = this.selectedAnswers()[question.uid] || [];

    const total: { [key: string]: number } = {};

    answers.forEach(answer => {
      if (answer.filieres) {
        for (const [key, value] of Object.entries(answer.filieres)) {
          total[key] = (total[key] || 0) + value;
        }
      }
    });

    return total;
  }

  constructor() {
    this.questionsServices.loadQuestions();

    effect(() => {
      this.currentQuestionData();
      this.currentQuestionDetails();

      console.log(this.currentQuestionDetails());
    });
  }

  nextQuestion() {
    const question = this.currentQuestionDetails();
    if (question) {
      const currentTotals = this.getCurrentQuestionFilieresTotal();

      this.cumulativeFilieres.update(prev => {
        const newTotals = { ...prev };
        for (const [key, value] of Object.entries(currentTotals)) {
          newTotals[key] = (newTotals[key] || 0) + value;
        }
        return newTotals;
      });

      console.log(`Totaux cumulés après question ${question.uid}:`, this.cumulativeFilieres());
    }

    if (this.currentQuestion() < this.totalQuestions() - 1) {
      this.currentQuestion.update(v => v + 1);
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    const totalQuiz = this.cumulativeFilieres();
    console.log('Quiz terminé ! Totaux cumulés des filières:', totalQuiz);
  }

  protected readonly Object = Object;
}
