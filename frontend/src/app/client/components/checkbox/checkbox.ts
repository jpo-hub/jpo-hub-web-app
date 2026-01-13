import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.html',
  styleUrls: ['./checkbox.scss']
})
export class CheckboxComponent {

  label = input.required<string>();
  checked = input<boolean>(false);

  checkedChange = output<boolean>();

  toggle() {
    this.checkedChange.emit(!this.checked());
  }
}
