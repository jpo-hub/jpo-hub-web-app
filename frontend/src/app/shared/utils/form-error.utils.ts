import {ERROR_MESSAGES} from '../constants/error-messages';

export function getFormErrorMessage(errors: any): string | null {
  if (!errors) return null;

  if (errors['required']) return ERROR_MESSAGES.REQUIRED;
  if (errors['email']) return ERROR_MESSAGES.EMAIL_INVALID;
  if (errors['minlength']) return ERROR_MESSAGES.PASSWORD_TOO_SHORT;

  return null;
}
