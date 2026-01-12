import { Component, signal, computed } from '@angular/core';
import { ProcessBar } from '../../components/process-bar/process-bar';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-quiz',
  imports: [
    ProcessBar,
    DecimalPipe
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  currentQuestion = signal(0);
  totalQuestions = signal(10);

  progressPercent = computed(() => {
    return Math.min(100, Math.max(0, (this.currentQuestion() / this.totalQuestions()) * 100));
  });

  nextQuestion() {
    console.log("cece");
    if (this.currentQuestion() < this.totalQuestions()) {
      this.currentQuestion.update(value => value + 1);
    }
    console.log(this.currentQuestion());
  }
}
