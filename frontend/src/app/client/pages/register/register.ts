import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {CheckboxForm} from '../../../shared/components/checkbox-form/checkbox-form';
import {Chips} from '../../../shared/components/chips/chips';
import {Filieres} from '../../../core/services/filieres';
import {toSignal} from '@angular/core/rxjs-interop';
import {Candidat} from '../../service/candidat';
import {firstValueFrom} from 'rxjs';
import {CandidatModel} from '../../../core/models/candidat.model';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../../core/services/toast';
import {ErrorHandler} from '../../../core/services/error-handler';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputForm, ReactiveFormsModule, ButtonPrimary, CheckboxForm, Chips],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit {
  private filieresService = inject(Filieres);
  private candidatService = inject(Candidat);
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  filieres = toSignal(this.filieresService.filieres, { initialValue: [] });
  isLoading = signal(true);

  loadingEffect = effect(() => {
    this.isLoading.set(this.filieres().length === 0);
  });

  form = new FormGroup({
    lastname: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateBirth: new FormControl('', [Validators.required]),
    consentement: new FormControl(false),
    filieres: new FormArray([])
  });

  selectedFilieres: string[] = [];

  get filieresFormArray(): FormArray {
    return this.form.get('filieres') as FormArray;
  }

  ngOnInit(): void {
    this.filieresService.loadFilieres();
  }

  onFiliereChange(filiereLabel: string, isSelected: boolean) {
    const formArray = this.filieresFormArray;

    if (isSelected) {
      if (!formArray.value.includes(filiereLabel)) {
        formArray.push(new FormControl(filiereLabel));
      }
    } else {
      const index = formArray.controls.findIndex(c => c.value === filiereLabel);
      if (index !== -1) formArray.removeAt(index);
    }

    this.selectedFilieres = formArray.value;
  }

  async onSubmit(): Promise<void> {
    try {
      const rawValue = this.form.value;
      const filieresArray = rawValue.filieres ?? [];
      const filieresObj: Record<string, number> = {};
      filieresArray.forEach((label: string) => filieresObj[label] = 1);

      const payload: CandidatModel = {
        email: rawValue.email!,
        firstname: rawValue.firstname!,
        lastname: rawValue.lastname!,
        appointment: false,
        consentement: rawValue.consentement ?? false,
        filieres: filieresObj,
        dateBirth: rawValue.dateBirth!,
      };

      await firstValueFrom(
        this.candidatService.submitCandidature(payload)
      );
    } catch (err) {
      const error = err as HttpErrorResponse;
      console.error(error);
      console.error(error.error);

      const message = this.errorHandler.getErrorMessage(error.error.code);
      console.log("1")
      this.toastService.show(message, 'danger');
      console.log("2")
    }
  }
}
