import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-chips',
  standalone: true, // important si tu veux l'utiliser dans un composant standalone
  templateUrl: './chips.html',
  styleUrls: ['./chips.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Chips),
      multi: true
    }
  ]
})
export class Chips implements ControlValueAccessor {
  @Input() label!: string;
  @Input() selected = false;
  @Output() selectionChange = new EventEmitter<boolean>();

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  toggleSelection() {
    this.selected = !this.selected;
    this.onChange(this.selected);
    this.onTouched();
    this.selectionChange.emit(this.selected);
  }

  writeValue(value: boolean): void {
    this.selected = value ?? false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
