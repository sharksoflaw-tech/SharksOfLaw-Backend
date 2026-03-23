// src/lawyers/lawyers.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyersEntity } from './lawyers.entity';
import { JoinLawyerEntity } from '../join-lawyer/join-lawyer.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class LawyersService {
  constructor(
      @InjectRepository(LawyersEntity)
      private readonly lawyerRepo: Repository<LawyersEntity>,

      @InjectRepository(JoinLawyerEntity)
      private readonly joinLawyerRepo: Repository<JoinLawyerEntity>,

      private readonly users: UsersService,
  ) {}

  async approveJoinLawyer(applicationId: string) {

    const appId = Number(applicationId);

    if (Number.isNaN(appId)) {
      throw new BadRequestException('Invalid application id');
    }

    const app = await this.joinLawyerRepo.findOne({
      where: { id: appId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (app.status !== 'SUBMITTED') {
      throw new BadRequestException('Application must be SUBMITTED before approval');
    }

    if (!app.userId) {
      throw new BadRequestException('Application is not linked to a user');
    }

    let profile = await this.lawyerRepo.findOne({
      where: { userId: app.userId },
    });

    if (!profile) {
      profile = this.lawyerRepo.create({
        userId: app.userId,
        displayName:
            `${app.firstName ?? ''} ${app.lastName ?? ''}`.trim() || 'Lawyer',
        bio: null,
        city: app.city ?? null,
        photoPath: app.photoPath ?? null,
        photoMimeType: app.photoMimeType ?? null,
        photoFileName: app.photoFileName ?? null,
        legalCategoryIds: app.legalCategoryIds ?? [],
        languages: app.languages ?? [],
        isActive: true,
      });

      profile = await this.lawyerRepo.save(profile);
    } else {
      profile.displayName =
          `${app.firstName ?? ''} ${app.lastName ?? ''}`.trim() || profile.displayName;
      profile.city = app.city ?? profile.city;
      profile.photoPath = app.photoPath ?? profile.photoPath;
      profile.photoMimeType = app.photoMimeType ?? profile.photoMimeType;
      profile.photoFileName = app.photoFileName ?? profile.photoFileName;
      profile.legalCategoryIds = app.legalCategoryIds ?? profile.legalCategoryIds;
      profile.languages = app.languages ?? profile.languages;
      profile.isActive = true;

      profile = await this.lawyerRepo.save(profile);
    }

    app.status = 'APPROVED';
    await this.joinLawyerRepo.save(app);

    await this.users.addRole(app.userId, UserRole.LAWYER);

    return {
      approved: true,
      profileId: profile.id,
    };
  }

  async findAllApprovedLawyers() {
    const profiles = await this.lawyerRepo.find({
      where: { isActive: true },
      order: { updatedAt: 'DESC' },
    });

    return profiles.map((profile) => ({
      ...profile,
      photoUrl: profile.photoPath ? `/lawyers/${profile.id}/photo` : null,
    }));
  }

  async getLawyerById(id: string) {
    const profile = await this.lawyerRepo.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException('Lawyer profile not found');
    }

    return {
      ...profile,
      photoUrl: profile.photoPath ? `/lawyers/${profile.id}/photo` : null,
    };
  }

  async rejectJoinLawyer(id: string, reason: string) {
      const application = await this.joinLawyerRepo.findOne({
        where: { id: Number(id) },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      application.status = 'REJECTED';

      // only keep this if your entity actually has this column
      // application.rejectionReason = reason;

      return this.joinLawyerRepo.save(application);
    }
}