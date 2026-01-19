import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ynovEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const isYnov = value.toLowerCase().endsWith('@ynov.com');
    return !isYnov ? { notYnov: { value: control.value } } : null;
  };
}
