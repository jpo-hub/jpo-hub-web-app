import {Component, EventEmitter, Input, Output, signal} from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.html',
  styleUrls: ['./checkbox.scss']
})
export class CheckboxComponent {
  @Input() label!: string;

  @Output() checkedChange = new EventEmitter<boolean>();

  checked = signal(false);

  toggle() {
    this.checked.set(!this.checked());
  }
}
