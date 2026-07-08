import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuditLog } from './entities/audit-log.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@Controller('audit-logs')
@ApiTags('Audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuditLog, isArray: true })
  findAll() {
    return this.auditService.findAll();
  }
}
