import { Injectable } from '@angular/core';
import {ERROR_MESSAGES} from '../../shared/constants/error-messages';

@Injectable({ providedIn: 'root' })
export class ErrorHandler {

  getErrorMessage(code: string): string {
    switch (code) {
      case 'email-already-exists':
        return ERROR_MESSAGES.EMAIL_USED;
      case 'incorrect-credentials':
        return ERROR_MESSAGES.INCORRECT_CREDANTIALS
      case '500':
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return 'Une erreur inconnue est survenue';
    }
  }
}
