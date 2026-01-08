import {Component, OnInit, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {CheckboxForm} from '../../../shared/components/checkbox-form/checkbox-form';
import {Filiere} from '../../../core/models/filiere.model';
import {Filieres} from '../../../core/services/filieres';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputForm,
    ReactiveFormsModule,
    ButtonPrimary,
    CheckboxForm
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit {
  // Modern Angular 21: inject() function
  private filieresService = inject(Filieres);

  // Convert Observable to Signal (Angular 21 feature)
  filieres = toSignal(this.filieresService.filieres, {initialValue: []});

  // Loading state with signal
  isLoading = signal(true);

  form = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    prenom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateNaissance: new FormControl('', [Validators.required]),
    consentement: new FormControl(false, [Validators.requiredTrue]),
    filieres: new FormArray([])
  });

  ngOnInit() {
    this.filieresService.getFilieres();

    // Update loading state after a delay (adjust based on your needs)
    setTimeout(() => this.isLoading.set(false), 500);
  }

  get filieresFormArray(): FormArray {
    return this.form.get('filieres') as FormArray;
  }

  onFiliereChange(filiereUid: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.filieresFormArray.push(new FormControl(filiereUid));
    } else {
      const index = this.filieresFormArray.controls.findIndex(
        control => control.value === filiereUid
      );
      if (index !== -1) {
        this.filieresFormArray.removeAt(index);
      }
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Formulaire valide:', this.form.value);
      // Process form submission here
    } else {
      console.log('Formulaire invalide');
      this.form.markAllAsTouched();
    }
  }
}
