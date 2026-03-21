import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';

import { JoinLawyerEntity } from './join-lawyer.entity';
import { CreateJoinLawyerDto } from './dto/create-join-lawyer.dto';
import { UpdateJoinLawyerDto } from './dto/update-join-lawyer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class JoinLawyerService {
    constructor(
        @InjectRepository(JoinLawyerEntity)
        private readonly repo: Repository<JoinLawyerEntity>,
        private readonly usersService: UsersService,
    ) {}

    private get uploadRoot() {
        return process.env.UPLOAD_ROOT || path.join(process.cwd(), 'uploads');
    }

    private getPublicPhotoUrl(appId: string) {
        return `/api/join-lawyer/applications/${appId}/photo`;
    }

    private async findActiveApplicationByUserId(userId: string) {
        return this.repo.findOne({
            where: {
                userId,
                status: In(['DRAFT', 'SUBMITTED', 'IN_REVIEW']),
            },
            order: { updatedAt: 'DESC' },
        });
    }

    async createDraft(dto: CreateJoinLawyerDto) {
        const app = this.repo.create({
            ...dto,
            status: 'DRAFT',
        });

        return this.repo.save(app);
    }

    async getById(id: string) {
        const app = await this.repo.findOne({
            where: { id },
            relations: ['user'],
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
        const app = await this.repo.findOne({
            where: { id },
        });

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        const hasPhoneData = !!dto.phone && !!dto.code;

        if (hasPhoneData) {
            const normalizedPhone = String(dto.phone).replace(/\D/g, '');
            const normalizedCode = String(dto.code).trim();

            const user = await this.usersService.findOrCreateByMobile(
                `${normalizedCode}${normalizedPhone}`,
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
        if (dto.firstName !== undefined) app.firstName = dto.firstName?.trim() || null;
        if (dto.lastName !== undefined) app.lastName = dto.lastName?.trim() || null;
        if (dto.phone !== undefined) app.phone = dto.phone?.trim() || null;
        if (dto.code !== undefined) app.code = dto.code?.trim() || null;
        if (dto.state !== undefined) app.state = dto.state?.trim() || null;
        if (dto.city !== undefined) app.city = dto.city?.trim() || null;
        if (dto.officeAddress !== undefined) {
            app.officeAddress = dto.officeAddress?.trim() || null;
        }
        if (dto.legalCategoryIds !== undefined) app.legalCategoryIds = dto.legalCategoryIds;
        if (dto.languages !== undefined) app.languages = dto.languages;
        if (dto.selectedPlan !== undefined) app.selectedPlan = dto.selectedPlan;
        if (dto.barCouncilEnrollmentNumber !== undefined) {
            app.barCouncilEnrollmentNumber = dto.barCouncilEnrollmentNumber?.trim() || null;
        }
        if (dto.barCouncilState !== undefined) {
            app.barCouncilState = dto.barCouncilState?.trim() || null;
        }
        if (dto.yearsOfExperience !== undefined) {
            app.yearsOfExperience = dto.yearsOfExperience;
        }
        if (dto.courtsOfPractice !== undefined) {
            app.courtsOfPractice = dto.courtsOfPractice?.trim() || null;
        }

        if (dto.consentAccepted === true && !app.consentAccepted) {
            app.consentAcceptedAt = new Date();
        }
        if (dto.consentAccepted !== undefined) {
            app.consentAccepted = dto.consentAccepted;
        }
        if (dto.status !== undefined) {
            app.status = dto.status;
        }

        return this.repo.save(app);
    }

    async setPhoto(
        id: string,
        file: { buffer: Buffer; mimetype: string; originalname?: string },
    ) {
        const app = await this.repo.findOne({
            where: { id },
        });

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
        app.photoFileName = file.originalname || fileName;
        app.photoMimeType = file.mimetype;

        await this.repo.save(app);

        return {
            success: true,
            url: this.getPublicPhotoUrl(id),
        };
    }

    async getPhoto(id: string) {
        const app = await this.repo.findOne({
            where: { id },
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

    async uploadBarCouncilId(id: string, file: Express.Multer.File) {
        const app = await this.repo.findOne({
            where: { id },
        });

        if (!app) {
            throw new NotFoundException('Join lawyer application not found');
        }

        const baseUrl = process.env.FILE_BASE_URL || 'http://localhost:3000';
        const fileUrl = `${baseUrl}/uploads/bar-council-ids/${file.filename}`;

        app.barCouncilIdPath = fileUrl;
        app.barCouncilIdFileName = file.originalname || file.filename;
        app.barCouncilIdMimeType = file.mimetype;

        await this.repo.save(app);

        return {
            success: true,
            fileUrl,
        };
    }

    async getAllApplications() {
        const applications = await this.repo.find({
            order: { updatedAt: 'DESC' },
            relations: ['user'],
        });

        return applications.map((app) => ({
            ...app,
            photoUrl: app.photoPath ? this.getPublicPhotoUrl(app.id) : null,
        }));
    }
}