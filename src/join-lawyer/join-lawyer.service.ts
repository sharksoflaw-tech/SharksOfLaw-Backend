import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';

import { JoinLawyerApplicationEntity } from './join-lawyer-application.entity';
import { CreateJoinLawyerDto } from './dto/create-join-lawyer.dto';
import { UpdateJoinLawyerDto } from './dto/update-join-lawyer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class JoinLawyerService {
    constructor(
        @InjectRepository(JoinLawyerApplicationEntity)
        private readonly repo: Repository<JoinLawyerApplicationEntity>,
        private readonly usersService: UsersService,
    ) {}

    private get uploadRoot() {
        return process.env.UPLOAD_ROOT || path.join(process.cwd(), 'uploads');
    }

    private getPublicPhotoUrl(appId: string) {
        return `/join-lawyer/applications/${appId}/photo`;
    }

    private async findActiveApplicationByUserId(userId: string) {
        return this.repo.findOne({
            where: [
                { userId, applicationStatus: 'DRAFT' },
                { userId, applicationStatus: 'SUBMITTED' },
                { userId, applicationStatus: 'IN_REVIEW' },
            ],
            order: { updatedAt: 'DESC' },
        });
    }

    async createDraft(dto: CreateJoinLawyerDto) {
        const app = this.repo.create({
            ...dto,
            paymentStatus: 'DRAFT',
            applicationStatus: 'DRAFT',
        });

        return this.repo.save(app);
    }

    async getById(id: string) {
        const app = await this.repo.findOne({
            where: { id },
            relations: { user: true } as any,
        });

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        return {
            ...app,
            photoUrl: app.photoPath ? this.getPublicPhotoUrl(app.id) : null,
        };
    }

    async update(id: string, dto: UpdateJoinLawyerDto) {
        const app = await this.repo.findOne({ where: { id } });

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        const hasPhoneData = dto.phone && dto.code;

        if (hasPhoneData) {
            const mobileE164 = `${dto.code}${dto.phone}`.replace(/\s+/g, '');

            const user = await this.usersService.findOrCreateByMobile(
                mobileE164,
                dto.email?.trim() || null,
            );

            const existingActive = await this.findActiveApplicationByUserId(user.id);

            if (existingActive && existingActive.id !== app.id) {
                throw new BadRequestException(
                    `An active lawyer application already exists for this mobile number. Application ID: ${existingActive.id}`,
                );
            }

            app.userId = user.id;
        }

        if (dto.email !== undefined) app.email = dto.email?.trim() || null;
        if (dto.firstName !== undefined) app.firstName = dto.firstName;
        if (dto.lastName !== undefined) app.lastName = dto.lastName;
        if (dto.phone !== undefined) app.phone = dto.phone;
        if (dto.code !== undefined) app.code = dto.code;
        if (dto.state !== undefined) app.state = dto.state;
        if (dto.primaryCity !== undefined) app.primaryCity = dto.primaryCity;
        if (dto.officeAddress !== undefined) app.officeAddress = dto.officeAddress?.trim() || null;
        if (dto.legalCategoryIds !== undefined) app.legalCategoryIds = dto.legalCategoryIds;
        if (dto.languages !== undefined) app.languages = dto.languages;
        if (dto.planYears !== undefined) app.planYears = dto.planYears;
        if (dto.amountInr !== undefined) app.amountInr = dto.amountInr;
        if (dto.barCouncilEnrollmentNumber !== undefined) app.barCouncilEnrollmentNumber = dto.barCouncilEnrollmentNumber;
        if (dto.barCouncilState !== undefined) app.barCouncilState = dto.barCouncilState;
        if (dto.yearsOfExperience !== undefined) app.yearsOfExperience = dto.yearsOfExperience;
        if (dto.courtsOfPractice !== undefined) app.courtsOfPractice = dto.courtsOfPractice;
        if (dto.primaryExpertise !== undefined) app.primaryExpertise = dto.primaryExpertise;

        if (dto.consentAccepted === true && !app.consentAccepted) {
            app.consentAcceptedAt = new Date();
        }
        if (dto.consentAccepted !== undefined) {
            app.consentAccepted = dto.consentAccepted;
        }

        if (dto.paymentStatus !== undefined) app.paymentStatus = dto.paymentStatus;
        if (dto.applicationStatus !== undefined) app.applicationStatus = dto.applicationStatus;

        return this.repo.save(app);
    }

    async setPhoto(id: string, file: { buffer: Buffer; mimetype: string; originalname?: string }) {
        const app = await this.repo.findOne({ where: { id } });

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        const extMap: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
        };

        const ext = extMap[file.mimetype];
        if (!ext) {
            throw new BadRequestException('Unsupported file type');
        }

        const dir = path.join(this.uploadRoot, 'join-lawyer', id);
        await fs.mkdir(dir, { recursive: true });

        const fileName = `profile${ext}`;
        const fullPath = path.join(dir, fileName);
        const relativePath = path.join('join-lawyer', id, fileName);

        await fs.writeFile(fullPath, file.buffer);

        app.photoPath = relativePath;
        app.photoMimeType = file.mimetype;
        app.photoFileName = file.originalname || fileName;

        await this.repo.save(app);

        return {
            success: true,
            url: this.getPublicPhotoUrl(id),
        };
    }

    async getPhoto(id: string) {
        const app = await this.repo.findOne({
            where: { id },
            select: {
                id: true,
                photoPath: true,
                photoMimeType: true,
            },
        });

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!app.photoPath) {
            throw new NotFoundException('Photo not found');
        }

        const absolutePath = path.join(this.uploadRoot, app.photoPath);
        const photo = await fs.readFile(absolutePath);

        return {
            photo,
            photoMimeType: app.photoMimeType || 'image/jpeg',
        };
    }

    async getAllApplications() {
        const applications = await this.repo.find({
            order: { updatedAt: 'DESC' },
            relations: { user: true } as any,
        });

        return applications.map((app) => ({
            ...app,
            photoUrl: app.photoPath ? `/join-lawyer/applications/${app.id}/photo` : null,
        }));
    }
}