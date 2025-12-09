import { PartialType } from '@nestjs/swagger';
import { CreateCandidatDto } from './create-candidat.dto';

export class UpdateCandidatDto extends PartialType(CreateCandidatDto) {}
