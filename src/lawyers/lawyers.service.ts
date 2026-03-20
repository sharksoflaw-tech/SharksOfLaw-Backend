// src/lawyers/lawyers.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyerProfileEntity } from './lawyer-profile.entity';
import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class LawyersService {
  constructor(
      @InjectRepository(LawyerProfileEntity)
      private readonly lawyerRepo: Repository<LawyerProfileEntity>,

      @InjectRepository(JoinLawyerApplicationEntity)
      private readonly joinRepo: Repository<JoinLawyerApplicationEntity>,

      private readonly users: UsersService,
  ) {}

  async approveJoinLawyer(applicationId: string) {
    const app = await this.joinRepo.findOne({ where: { id: applicationId } });
    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (app.applicationStatus !== 'SUBMITTED') {
      throw new BadRequestException('Application must be SUBMITTED before approval');
    }

    if (app.paymentStatus !== 'SUCCESS') {
      throw new BadRequestException('Successful payment is required before approval');
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
        city: app.primaryCity ?? null,
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
      profile.city = app.primaryCity ?? profile.city;
      profile.photoPath = app.photoPath ?? profile.photoPath;
      profile.photoMimeType = app.photoMimeType ?? profile.photoMimeType;
      profile.photoFileName = app.photoFileName ?? profile.photoFileName;
      profile.legalCategoryIds = app.legalCategoryIds ?? profile.legalCategoryIds;
      profile.languages = app.languages ?? profile.languages;
      profile.isActive = true;

      profile = await this.lawyerRepo.save(profile);
    }

    app.applicationStatus = 'APPROVED';
    await this.joinRepo.save(app);

    await this.users.setRole(app.userId, 'LAWYER');

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
}