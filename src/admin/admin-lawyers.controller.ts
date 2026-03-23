import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

import { JoinLawyerService } from '../join-lawyer/join-lawyer.service';
import { LawyersService } from '../lawyers/lawyers.service';
import { RejectLawyerDto } from './dto/reject-lawyer.dto';

@Controller('admin/lawyers')
export class AdminLawyersController {
  constructor(
    private readonly joinLawyerService: JoinLawyerService,
    private readonly lawyersService: LawyersService,
  ) {}

  // FIX 1:
  // This supports frontend call: /api/admin/lawyers
  @Get()
  getLawyers() {
    return this.lawyersService.findAllApprovedLawyers();
  }

  @Get('applications')
  getApplications() {
    return this.joinLawyerService.getAllApplications();
  }

  @Get('applications/:id')
  getApplication(@Param('id', ParseIntPipe) id: number) {
    return this.joinLawyerService.getById(id);
  }

  @Patch('applications/:id/approve')
  approveApplication(@Param('id', ParseIntPipe) id: number) {
    return this.lawyersService.approveJoinLawyer(String(id));
  }

  @Patch('applications/:id/reject')
  rejectApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectLawyerDto,
  ) {
    return this.lawyersService.rejectJoinLawyer(String(id), dto.reason);
  }

  @Get('approved')
  getApprovedLawyers() {
    return this.lawyersService.findAllApprovedLawyers();
  }

  @Get('approved/:id')
  getApprovedLawyerById(@Param('id') id: string) {
    return this.lawyersService.getLawyerById(id);
  }
}