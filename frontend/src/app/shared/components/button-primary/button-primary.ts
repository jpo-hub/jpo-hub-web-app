
import { Component, Input, Output, EventEmitter, booleanAttribute} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button-primary',
  imports: [
    RouterLink
  ],
  templateUrl: './button-primary.html',
  styleUrl: './button-primary.scss',
})
export class ButtonPrimary {
  @Input() label: string = '';
  @Input() link: string | null = null;
  @Input({transform: booleanAttribute}) disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
