import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyerProfileEntity } from './lawyer-profile.entity';
import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class LawyersService {
  constructor(
      @InjectRepository(LawyerProfileEntity) private lawyerRepo: Repository<LawyerProfileEntity>,
      @InjectRepository(JoinLawyerApplicationEntity) private joinRepo: Repository<JoinLawyerApplicationEntity>,
      private users: UsersService,
  ) {}

  async approveJoinLawyer(applicationId: string) {
    const app = await this.joinRepo.findOne({ where: { id: applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    if (app.paymentStatus !== 'SUCCESS' && app.applicationStatus !== 'SUBMITTED') {
      throw new BadRequestException('Application must be SUBMITTED with successful payment before approval');
    }

    if (!app.userId) throw new BadRequestException('Application is not linked to a user');

    // Create profile (idempotent)
    let profile = await this.lawyerRepo.findOne({where: {userId: app.userId}});
    if (!profile) {
      // CHANGE: Use legalCategoryIds to match both entity field names
      profile = this.lawyerRepo.create({
        userId: app.userId,
        displayName: `${app.firstName ?? ''} ${app.lastName ?? ''}`.trim() || 'Lawyer',
        bio: null,
        photo: app.photo ?? null,
        photoMime: app.photoMimeType ?? null,
        legalCategoryIds: app.legalCategoryIds ?? [],
        languages: app.languages ?? [],
        city: app.primaryCity ?? null,
      });
      profile = await this.lawyerRepo.save(profile);
    }

    await this.joinRepo.update({ id: applicationId }, { applicationStatus: 'APPROVED' } as any);
    await this.users.setRole(app.userId, 'LAWYER');

    return { approved: true, profileId: profile.id };
  }
}
