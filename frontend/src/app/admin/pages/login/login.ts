import { Component } from '@angular/core';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ynovEmailValidator} from '../../../core/validators/ynov-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputForm,
    ButtonPrimary,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, ynovEmailValidator()]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit() {
    console.log(this.form.value);
  }
}
