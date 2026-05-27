import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {CheckboxForm} from '../../../shared/components/checkbox-form/checkbox-form';
import {Chips} from '../../../shared/components/chips/chips';
import {Filieres} from '../../../core/services/filieres';
import {toSignal} from '@angular/core/rxjs-interop';
import {Candidat} from '../../services/candidat';
import {firstValueFrom} from 'rxjs';
import {CandidatModel} from '../../../core/models/candidat.model';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../../core/services/toast';
import {ErrorHandler} from '../../../core/services/error-handler';
import {Router} from '@angular/router';
import {SelectForm} from '../../components/select-form/select-form';
import {FormState} from '../../../core/services/form-state';
import {StorageService} from '../../../core/services/storage-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputForm, ReactiveFormsModule, ButtonPrimary, CheckboxForm, Chips, SelectForm],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit {
  private filieresService = inject(Filieres);
  private storageService = inject(StorageService);
  private candidatService = inject(Candidat);
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);
  private router = inject(Router);
  private formState= inject(FormState);

  filieres = toSignal(this.filieresService.filieres, { initialValue: [] });
  isLoading = signal(true);

  loadingEffect = effect(() => {
    this.isLoading.set(this.filieres().length === 0);
  });

  form = new FormGroup({
    lastname: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    ageRange: new FormControl(''),
    consentement: new FormControl(false, [Validators.requiredTrue]),
    filieres: new FormArray([])
  });

  selectedFilieres: string[] = [];
  protected ageRanges: { label: string; value: string }[] = [
    { label: 'Moins de 18 ans', value: 'under_18' },
    { label: '18-22 ans', value: '18_22' },
    { label: '23-29 ans', value: '23_29' },
    { label: '30 ans et plus', value: '30_above' },
  ];

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
        ageRange: rawValue.ageRange || '',
      };

      await firstValueFrom(
        this.candidatService.submitCandidature(payload)
      );



      this.form.reset();
      this.filieresFormArray.clear();
      this.storageService.setCandidatName(payload.firstname)
      this.formState.setCompleted();
      await this.router.navigate(['quiz']);
    } catch (err) {
      const error = err as HttpErrorResponse;

      const message = this.errorHandler.getErrorMessage(error.error.code);
      this.toastService.show(message, 'danger');
    }
  }
}
