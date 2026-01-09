import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {ERROR_MESSAGES} from '../../shared/constants/error-messages';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {

  getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 409:
        return ERROR_MESSAGES.USER_ALREADY_EXISTS;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return 'Une erreur inconnue est survenue';
    }
  }
}
