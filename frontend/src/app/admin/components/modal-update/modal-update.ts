import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges} from '@angular/core';
import {Question} from '../../../core/models/question.model';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {QuizService} from '../../services/quiz';
import {Answer} from '../../../core/models/answer.model';
import {CommonModule} from '@angular/common';
import {LucideAngularModule} from 'lucide-angular';
import {Filieres} from '../../../core/services/filieres';
import {Filiere} from '../../../core/models/filiere.model';

interface FiliereScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-modal-update',
  imports: [
    InputForm,
    ButtonPrimary,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './modal-update.html',
  styleUrl: './modal-update.scss',
})
export class ModalUpdate implements OnChanges, OnInit {
  @Input() question!: Question | null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshQuestions = new EventEmitter<void>();

  private quizService = inject(QuizService);
  private filieresService = inject(Filieres);

  label: string = '';
  draft: boolean = false;
  multiple: boolean = false;

  answers = signal<Answer[]>([]);
  newAnswerLabel: string = '';
  isAddingAnswer = signal(false);
  isLoadingQuestion = signal(false);

  availableFilieres = signal<Filiere[]>([]);
  newAnswerFilieres: FiliereScore[] = [];

  ngOnInit() {
    this.filieresService.loadFilieres();

    this.filieresService.filieres.subscribe(filieres => {
      this.availableFilieres.set(filieres);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['question'] && this.question) {
      this.loadQuestionDetails(this.question.uid);
    }
  }

  loadQuestionDetails(uid: string) {
    this.isLoadingQuestion.set(true);

    this.quizService.getQuestion(uid).subscribe({
      next: (questionData) => {
        this.label = questionData.label;
        this.draft = questionData.draft;
        this.multiple = questionData.multiple;

        // Charger les réponses complètes depuis l'API
        if (questionData.reponses) {
          this.answers.set(questionData.reponses as any);
        } else {
          this.answers.set([]);
        }

        this.isLoadingQuestion.set(false);
      },
      error: () => {
        this.isLoadingQuestion.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.question) return;

    const payload = {
      label: this.label,
      draft: this.draft,
      multiple: this.multiple,
    };

    this.quizService.updateQuestion(this.question.uid, payload as Question).subscribe({
      next: () => {
        this.refreshQuestions.emit();
        this.closeModal.emit();
      }
    });
  }

  toggleAddAnswer() {
    this.isAddingAnswer.set(!this.isAddingAnswer());
    this.newAnswerLabel = '';
    this.newAnswerFilieres = [];
  }

  addFiliere() {
    this.newAnswerFilieres.push({ name: '', score: 1 });
  }

  removeFiliere(index: number) {
    this.newAnswerFilieres = this.newAnswerFilieres.filter((_, i) => i !== index);
  }

  addAnswer() {
    if (!this.newAnswerLabel.trim() || !this.question) return;

    const filieres: Record<string, number> = {};
    this.newAnswerFilieres.forEach(f => {
      if (f.name && f.score) {
        filieres[f.name] = f.score;
      }
    });

    const newAnswer: Answer = {
      label: this.newAnswerLabel,
      questionUid: this.question.uid,
      filieres: filieres
    };

    this.quizService.addAnswer(newAnswer).subscribe({
      next: (createdAnswer) => {
        this.answers.update(prev => [...prev, createdAnswer]);
        this.newAnswerLabel = '';
        this.newAnswerFilieres = [];
        this.isAddingAnswer.set(false);
      }
    });
  }

  removeAnswer(answer: Answer, index: number) {
    if (answer.uid) {
      this.quizService.removeAnswer(answer.uid).subscribe({
        next: () => {
          this.answers.update(prev => prev.filter((_, i) => i !== index));
        }
      });
    } else {
-      this.answers.update(prev => prev.filter((_, i) => i !== index));
    }
  }

  getFilieresDisplay(filieres: Record<string, number>): string {
    if (!filieres || Object.keys(filieres).length === 0) {
      return 'Aucune filière';
    }
    return Object.entries(filieres)
      .map(([name, score]) => `${name} (${score})`)
      .join(', ');
  }
}
