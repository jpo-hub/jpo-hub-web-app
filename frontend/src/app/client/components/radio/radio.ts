import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.html',
  styleUrl: './radio.scss',
})
export class Radio {
  label = input.required<string>();
  checked = input<boolean>(false);

  checkedChange = output<void>();

  select() {
    if (!this.checked()) {
      this.checkedChange.emit();
    }
  }
}
