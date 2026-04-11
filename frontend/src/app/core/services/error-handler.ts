import { Injectable } from '@angular/core';
import {ERROR_MESSAGES} from '../../shared/constants/error-messages';

@Injectable({ providedIn: 'root' })
export class ErrorHandler {

  getErrorMessage(code: string): string {
    switch (code) {
      case 'incorrect-credentials':
        return ERROR_MESSAGES.INCORRECT_CREDENTIALS;
      case 'unauthorized-access':
        return ERROR_MESSAGES.UNAUTHORIZED_ACCESS;
      case 'missing-fields':
        return ERROR_MESSAGES.MISSING_FIELDS;
      case 'invalid-token':
        return ERROR_MESSAGES.INVALID_TOKEN;
      case 'resource-not-found':
        return ERROR_MESSAGES.RESOURCE_NOT_FOUND;
      case 'invalid-input-format':
        return ERROR_MESSAGES.INVALID_INPUT_FORMAT;
      case 'forbidden-action':
        return ERROR_MESSAGES.FORBIDDEN_ACTION;
      case 'email-already-exists':
        return ERROR_MESSAGES.EMAIL_USED;
      case 'too-many-requests':
        return ERROR_MESSAGES.TOO_MANY_REQUESTS;
      case 'password-strength-error':
        return ERROR_MESSAGES.PASSWORD_STRENGTH_ERROR;
      case 'email-not-verified':
        return ERROR_MESSAGES.EMAIL_NOT_VERIFIED;
      case 'alreadyExists':
        return ERROR_MESSAGES.ALREADY_EXISTS;
      case 'conflict-error':
        return ERROR_MESSAGES.CONFLICT_ERROR;
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }
}
