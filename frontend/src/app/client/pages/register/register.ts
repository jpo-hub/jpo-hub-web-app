import { Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputForm } from '../../../shared/components/input-form/input-form';
import { ButtonPrimary } from '../../../shared/components/button-primary/button-primary';
import { CheckboxForm } from '../../../shared/components/checkbox-form/checkbox-form';
import { Chips } from '../../../shared/components/chips/chips';
import { Filieres } from '../../../core/services/filieres';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputForm,
    ReactiveFormsModule,
    ButtonPrimary,
    CheckboxForm,
    Chips
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private filieresService = inject(Filieres);

  // transforme l'Observable du service en Signal pour Angular 21
  filieres = toSignal(this.filieresService.filieres, { initialValue: [] });

  isLoading = signal(true);

  form = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    prenom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateNaissance: new FormControl('', [Validators.required]),
    consentement: new FormControl(false, [Validators.requiredTrue]),
    filieres: new FormArray([])
  });

  get filieresFormArray(): FormArray {
    return this.form.get('filieres') as FormArray;
  }

  constructor() {
    // lance la récupération des filières
    this.filieresService.getFilieres();

    // met isLoading à false dès que le signal contient des filières
    this.isLoading.set(this.filieres().length === 0);
    this.filieres().length > 0 && this.isLoading.set(false);
  }

  onFiliereChange(filiereUid: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.filieresFormArray.push(new FormControl(filiereUid));
    } else {
      const index = this.filieresFormArray.controls.findIndex(c => c.value === filiereUid);
      if (index !== -1) this.filieresFormArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Formulaire valide:', this.form.value);
    } else {
      this.form.markAllAsTouched();
      console.log('Formulaire invalide');
    }
  }
}
