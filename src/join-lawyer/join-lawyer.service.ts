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

    private getPublicPhotoUrl(appId: number) {
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
        let userId: string | null = null;

        if (dto.phone && dto.code) {
            const mobileE164 = `${dto.code}${dto.phone}`.replace(/\s+/g, '');

            const user = await this.usersService.findOrCreateByMobile(
                mobileE164,
                dto.email?.trim() || null,
            );

            const existingActive = await this.findActiveApplicationByUserId(user.id);
            if (existingActive) {
                throw new BadRequestException(
                    `An active lawyer application already exists for this mobile number. Application ID: ${existingActive.id}`,
                );
            }

            userId = user.id;
        }

        const app = this.repo.create({
            ...dto,
            email: dto.email?.trim() || null,
            officeAddress: dto.officeAddress?.trim() || null,
            userId,
            status: 'DRAFT',
        });

        return this.repo.save(app);
    }

    async getById(id: number) {
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

    async update(id: number, dto: UpdateJoinLawyerDto) {
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
        id: number,
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

        const dir = path.join(this.uploadRoot, 'join-lawyer', String(id));
        await fs.mkdir(dir, { recursive: true });

        const fileName = `profile${ext}`;
        const fullPath = path.join(dir, fileName);
        const relativePath = path.join('join-lawyer', String(id), fileName);

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

    async getPhoto(id: number) {
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

    async setBarCouncilId(
        id: number,
        file: { buffer: Buffer; mimetype: string; originalname?: string },
    ) {
        const app = await this.repo.findOne({
            where: { id },
        });

        if (!app) {
            throw new NotFoundException('Join lawyer application not found');
        }

        const extMap: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'application/pdf': '.pdf',
        };

        const ext = extMap[file.mimetype];
        if (!ext) {
            throw new BadRequestException('Unsupported file type');
        }

        const dir = path.join(this.uploadRoot, 'join-lawyer', String(id));
        await fs.mkdir(dir, { recursive: true });

        const fileName = `bar-council-id${ext}`;
        const fullPath = path.join(dir, fileName);
        const relativePath = path.join('join-lawyer', String(id), fileName);

        await fs.writeFile(fullPath, file.buffer);

        app.barCouncilIdPath = relativePath;
        app.barCouncilIdFileName = file.originalname || fileName;
        app.barCouncilIdMimeType = file.mimetype;

        await this.repo.save(app);

        return {
            success: true,
            url: `/api/join-lawyer/applications/${id}/bar-council-id`,
        };
    }

    async getBarCouncilId(id: number) {
        const app = await this.repo.findOne({
            where: { id },
        });

        if (!app) {
            throw new NotFoundException('Join lawyer application not found');
        }

        if (!app.barCouncilIdPath) {
            throw new NotFoundException('Bar council ID not found');
        }

        const absolutePath = path.join(this.uploadRoot, app.barCouncilIdPath);
        const file = await fs.readFile(absolutePath);

        return {
            file,
            mimeType: app.barCouncilIdMimeType || 'application/octet-stream',
            fileName: app.barCouncilIdFileName || 'bar-council-id',
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