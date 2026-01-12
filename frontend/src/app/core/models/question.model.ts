import {Responses} from './responses.model';

export class Question {
  uid!: string;
  label!: string;
  multiple!: boolean;
  reponses!: Responses[];
}
