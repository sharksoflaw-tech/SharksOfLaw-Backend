import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { JoinLawyerService } from '../join-lawyer/join-lawyer.service';
import { LawyersService } from '../lawyers/lawyers.service';
import { ParseIntPipe } from '@nestjs/common';
import { RejectLawyerDto } from './dto/reject-lawyer.dto';

@Controller('admin/lawyers')
export class AdminLawyersController {
  constructor(
    private readonly joinLawyerService: JoinLawyerService,
    private readonly lawyersService: LawyersService,
  ) {}

  @Get('applications')
  getApplications() {
    return this.joinLawyerService.getAllApplications();
  }

  @Get('applications/:id')
  getApplication(@Param('id', ParseIntPipe) id: number) {
    return this.joinLawyerService.getById(id);
  }

  @Patch('applications/:id/approve')
  approveApplication(@Param('id') id: string) {
    return this.lawyersService.approveJoinLawyer(id);
  }

  @Patch('applications/:id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body() dto: RejectLawyerDto,
  ) {
    return this.lawyersService.rejectJoinLawyer(id, dto.reason);
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