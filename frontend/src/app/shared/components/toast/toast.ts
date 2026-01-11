import {Component, inject} from '@angular/core';
import {ToastService} from '../../../core/services/toast';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  imports: [
    LucideAngularModule
  ]
})
export class Toast {
  toast = inject(ToastService);
}
