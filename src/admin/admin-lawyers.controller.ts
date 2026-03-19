import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Query,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';
import { LawyerProfileEntity } from '../lawyers/lawyer-profile.entity';
import { UsersService } from '../users/users.service';

import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { ApproveLawyerDto } from './dto/approve-lawyer.dto';
import { RejectLawyerDto } from './dto/reject-lawyer.dto';

@Controller('admin/lawyers')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class AdminLawyersController {
    constructor(
        @InjectRepository(JoinLawyerApplicationEntity)
        private readonly joinRepo: Repository<JoinLawyerApplicationEntity>,
        @InjectRepository(LawyerProfileEntity)
        private readonly profileRepo: Repository<LawyerProfileEntity>,
        private readonly usersService: UsersService,
    ) {}

    // ✅ List applications
    @Get('applications')
    async list(
        @Query('status') status?: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED',
    ) {
        const where = status ? {applicationStatus: status} : {};
        return this.joinRepo.find({
            where,
            order: {createdAt: 'DESC'},
        });
    }

    // ✅ Approve
    @Post('applications/:id/approve')
    async approve(
        @Param('id') id: string,
        @Body() dto: ApproveLawyerDto,
    ) {
        const app = await this.joinRepo.findOne({ where: { id } });
        if (!app) throw new BadRequestException('Application not found');

        if (app.paymentStatus !== 'SUCCESS') {
            throw new BadRequestException('Payment not successful');
        }

        if (!app.userId) {
            throw new BadRequestException('Application not linked to user');
        }

        let profile = await this.profileRepo.findOne({
            where: { userId: app.userId },
        });

        if (!profile) {
            profile = this.profileRepo.create({
                userId: app.userId,
                displayName:
                    dto.displayName ??
                    `${app.firstName ?? ''} ${app.lastName ?? ''}`.trim(),
                bio: dto.bio ?? null,
                city: dto.city ?? app.primaryCity ?? null,
                photo: app.photo ?? null,
                photoMime: app.photoMimeType ?? null,
                legalCategoryIds: app.legalCategoryIds ?? [],
                languages: app.languages ?? [],
                isActive: true,
            });

            await this.profileRepo.save(profile);
        }

        app.applicationStatus = 'APPROVED' as any;
        await this.joinRepo.save(app);

        await this.usersService.setRole(app.userId, 'LAWYER');

        return { approved: true, profileId: profile.id };
    }

    // ✅ Reject
    @Post('applications/:id/reject')
    async reject(
        @Param('id') id: string,
        @Body() dto: RejectLawyerDto,
    ) {
        const app = await this.joinRepo.findOne({ where: { id } });
        if (!app) throw new BadRequestException('Application not found');

        app.applicationStatus = 'REJECTED' as any;
        (app as any).rejectionReason = dto.reason;

        await this.joinRepo.save(app);
        return { rejected: true };
    }
}