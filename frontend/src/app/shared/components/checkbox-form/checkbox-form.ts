import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox-form',
  templateUrl: './checkbox-form.html',
  styleUrl: './checkbox-form.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxForm),
      multi: true,
    },
  ],
})
export class CheckboxForm implements ControlValueAccessor {
  @Input() title?: string;
  @Input() label?: string;

  value = false;
  disabled = false;

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onChange(input.checked);
  }

  writeValue(value: boolean): void {
    this.value = value ?? false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
