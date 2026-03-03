import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ButtonPrimary} from '../../../shared/components/button-primary/button-primary';
import {InputForm} from '../../../shared/components/input-form/input-form';

@Component({
  selector: 'app-modal-create',
  standalone: true,
  imports: [FormsModule, ButtonPrimary, InputForm],
  templateUrl: './modal-create.html',
  styleUrl: './modal-create.scss',
})
export class ModalCreate {
  label: string = '';
  draft: boolean = false;
  multiple: boolean = false;

  onSubmit() {
    const payload = {
      label: this.label,
      draft: this.draft,
      multiple: this.multiple,
    };

    console.log(payload);
  }
}
