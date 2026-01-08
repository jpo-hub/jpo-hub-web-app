import {Component, Input} from '@angular/core';
import {ControlValueAccessor} from '@angular/forms';

@Component({
  selector: 'app-chips',
  imports: [],
  templateUrl: './chips.html',
  styleUrl: './chips.scss',
})
export class Chips implements ControlValueAccessor {
  @Input() label!: string;
  @Input() selected: boolean = false;
  @Input() uid!: string;


  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {}

  toggleSelection(): void {
    this.selected = !this.selected;
    this.onChange(this.selected);
    this.onTouched();
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
