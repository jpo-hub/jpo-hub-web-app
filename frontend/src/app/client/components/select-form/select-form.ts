import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select-form',
  standalone: true,
  imports: [],
  templateUrl: './select-form.html',
  styleUrl: './select-form.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectForm),
      multi: true
    }
  ]
})
export class SelectForm implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() name: string = 'radio-group-' + Math.random().toString(36).substring(2, 11);

  value: string = '';
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRadioChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
