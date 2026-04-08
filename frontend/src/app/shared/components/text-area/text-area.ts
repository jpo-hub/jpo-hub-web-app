import { Component, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule} from '@angular/forms';

@Component({
  selector: 'app-text-area',
  imports: [
    FormsModule
  ],
  templateUrl: './text-area.html',
  styleUrl: './text-area.scss',
})
export class TextArea implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() value: string = '';

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }
}
