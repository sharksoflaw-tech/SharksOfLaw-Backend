// src/admin/admin-lawyers.controller.ts
import {
    Controller,
    Get,
    Param,
    Patch,
} from '@nestjs/common';
import { JoinLawyerService } from '../join-lawyer/join-lawyer.service';
import { LawyersService } from '../lawyers/lawyers.service';

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
    getApplicationById(@Param('id') id: string) {
        return this.joinLawyerService.getById(id);
    }

    @Patch('applications/:id/approve')
    approveApplication(@Param('id') id: string) {
        return this.lawyersService.approveJoinLawyer(id);
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