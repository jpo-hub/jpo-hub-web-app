import {Component} from '@angular/core';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {CheckboxForm} from '../../../shared/components/checkbox-form/checkbox-form';

@Component({
  selector: 'app-register',
  imports: [
    InputForm,
    ReactiveFormsModule,
    ButtonPrimary,
    CheckboxForm
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  form = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    prenom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateNaissance: new FormControl('', [Validators.required]),
    consentement: new FormControl('')
  });

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Formulaire valide:', this.form.value);
    } else {
      console.log('Formulaire invalide');
      this.form.markAllAsTouched();
    }
  }
}
