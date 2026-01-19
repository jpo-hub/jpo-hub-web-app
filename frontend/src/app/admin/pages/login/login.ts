import {Component, computed, inject, signal} from '@angular/core';
import {InputForm} from '../../../shared/components/input-form/input-form';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ynovEmailValidator} from '../../../core/validators/ynov-validators';
import {Admin} from '../../services/admin';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {ToastService} from '../../../core/services/toast';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHandler} from '../../../core/services/error-handler';
import {firstValueFrom} from 'rxjs';

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
  private adminService = inject(Admin);
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandler);

  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, ynovEmailValidator()]),
    password: new FormControl('', [Validators.required])
  });

  isFormInvalid = toSignal(
    this.form.statusChanges.pipe(map(status => status !== 'VALID')),
    { initialValue: true }
  );

  isSubmitDisabled = computed(() => this.isFormInvalid() || this.isLoading());

  async onSubmit() {
    if (this.isSubmitDisabled()) return;

    const { email, password } = this.form.getRawValue();

    this.isLoading.set(true);

    try {
      await firstValueFrom(this.adminService.login(email!, password!));

    } catch (err) {
      const error = err as HttpErrorResponse;
      const errorCode = error.error?.code || 'UNKNOWN_ERROR';
      const message = this.errorHandler.getErrorMessage(errorCode);

      this.toastService.show(message, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }
}
