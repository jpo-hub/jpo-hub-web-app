import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs/operators';

import { Questions } from '../../../core/services/questions';
import { Question } from '../../../core/models/question.model';

import { ProcessBar } from '../../components/process-bar/process-bar';
import { ButtonPrimary } from '../../../shared/components/button-primary/button-primary';
import { Radio } from '../../components/radio/radio';
import { CheckboxComponent } from '../../components/checkbox/checkbox';

@Component({
  selector: 'app-quiz',
  imports: [
    ProcessBar,
    DecimalPipe,
    ButtonPrimary,
    Radio,
    CheckboxComponent
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {

  private questionsService = inject(Questions);

  currentQuestion = signal(0);

  /** Sélection radio */
  selectedRadioUid = signal<string | null>(null);

  /** Sélection checkbox */
  selectedCheckboxUids = signal<string[]>([]);

  /** Totaux cumulés */
  cumulativeFilieres = signal<Record<string, number>>({});

  questions = toSignal(
    this.questionsService.questions$,
    { initialValue: [] as Question[] }
  );

  totalQuestions = computed(() => this.questions().length);

  progressPercent = computed(() => {
    const total = this.totalQuestions();
    return total === 0
      ? 0
      : ((this.currentQuestion() + 1) / total) * 100;
  });

  currentQuestionData = computed(() => {
    return this.questions()[this.currentQuestion()];
  });

  currentQuestionDetails = toSignal(
    toObservable(this.currentQuestionData).pipe(
      filter(q => !!q?.uid),
      switchMap(q => this.questionsService.getQuestionByUid(q!.uid))
    ),
    { initialValue: null }
  );

  constructor() {
    this.questionsService.loadQuestions();
    effect(() => this.currentQuestionDetails());
  }

  /* =====================
     RADIO
     ===================== */

  onRadioChange(answer: Question['reponses'][0]) {
    this.selectedRadioUid.set(answer.uid);
  }

  isRadioSelected(uid: string): boolean {
    return this.selectedRadioUid() === uid;
  }

  /* =====================
     CHECKBOX
     ===================== */

  onCheckboxChange(answer: Question['reponses'][0], checked: boolean) {
    this.selectedCheckboxUids.update(prev =>
      checked
        ? [...prev, answer.uid]
        : prev.filter(uid => uid !== answer.uid)
    );
  }

  isCheckboxChecked(uid: string): boolean {
    return this.selectedCheckboxUids().includes(uid);
  }

  /* =====================
     FILIÈRES
     ===================== */

  getCurrentQuestionFilieresTotal(): Record<string, number> {
    const question = this.currentQuestionDetails();
    if (!question) return {};

    const totals: Record<string, number> = {};

    const selectedAnswers = question.multiple
      ? question.reponses.filter(r =>
        this.selectedCheckboxUids().includes(r.uid)
      )
      : question.reponses.filter(r =>
        r.uid === this.selectedRadioUid()
      );

    for (const answer of selectedAnswers) {
      if (!answer.filieres) continue;

      for (const [key, value] of Object.entries(answer.filieres)) {
        totals[key] = (totals[key] || 0) + value;
      }
    }

    return totals;
  }

  /* =====================
     NAVIGATION
     ===================== */

  nextQuestion() {
    const totals = this.getCurrentQuestionFilieresTotal();

    this.cumulativeFilieres.update(prev => {
      const updated = { ...prev };
      for (const [key, value] of Object.entries(totals)) {
        updated[key] = (updated[key] || 0) + value;
      }
      return updated;
    });

    if (this.currentQuestion() < this.totalQuestions() - 1) {
      this.currentQuestion.update(v => v + 1);
      this.resetSelections();
    } else {
      this.finishQuiz();
    }

    console.log(this.cumulativeFilieres());
  }

  resetSelections() {
    this.selectedRadioUid.set(null);
    this.selectedCheckboxUids.set([]);
  }

  finishQuiz() {
    console.log('Quiz terminé :', this.cumulativeFilieres());
  }

  protected readonly Object = Object;
}
