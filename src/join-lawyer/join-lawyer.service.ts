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

    private normalizeBarCouncilEnrollmentNumber(value: string) {
        return value.trim().toUpperCase();
    }

    private async findByBarCouncilEnrollmentNumber(
        barCouncilEnrollmentNumber: string,
    ) {
        const normalized = this.normalizeBarCouncilEnrollmentNumber(
            barCouncilEnrollmentNumber,
        );

        return this.repo.findOne({
            where: { barCouncilEnrollmentNumber: normalized },
            order: { updatedAt: 'DESC' },
        });
    }

    private async findLatestApplicationByUserId(userId: string) {
        return this.repo.findOne({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });
    }

    private async findDraftApplicationByUserId(userId: string) {
        return this.repo.findOne({
            where: { userId, status: 'DRAFT' },
            order: { updatedAt: 'DESC' },
        });
    }

    private async findBlockingApplicationByUserId(userId: string) {
        return this.repo.findOne({
            where: {
                userId,
                status: In(['SUBMITTED', 'IN_REVIEW', 'APPROVED']),
            },
            order: { updatedAt: 'DESC' },
        });
    }

    async createDraft(dto: CreateJoinLawyerDto) {
        if (!dto.phone || !dto.code) {
            throw new BadRequestException('Phone and country code are required');
        }

        const normalizedPhone = String(dto.phone).replace(/\D/g, '');
        const normalizedCode = String(dto.code).trim();
        const normalizedEmail = dto.email?.trim() || null;
        const mobileE164 = `${normalizedCode}${normalizedPhone}`;

        const user = await this.usersService.findOrCreateByMobile(
            mobileE164,
            normalizedEmail,
            'LAWYER',
        );

        const existingSubmittedOrReview = await this.repo.findOne({
            where: {
                userId: user.id,
                status: In(['SUBMITTED', 'IN_REVIEW', 'APPROVED']),
            },
            order: { updatedAt: 'DESC' },
        });

        if (existingSubmittedOrReview) {
            throw new BadRequestException({
                code: 'APPLICATION_ALREADY_EXISTS',
                message: `Application already exists for this mobile number with status ${existingSubmittedOrReview.status}.`,
                applicationId: existingSubmittedOrReview.id,
                status: existingSubmittedOrReview.status,
            });
        }

        if (dto.barCouncilEnrollmentNumber?.trim()) {
            const normalizedBarCouncilNumber =
                this.normalizeBarCouncilEnrollmentNumber(dto.barCouncilEnrollmentNumber);

            const existingByBarCouncil = await this.findByBarCouncilEnrollmentNumber(
                normalizedBarCouncilNumber,
            );

            if (existingByBarCouncil) {
                throw new BadRequestException({
                    code: 'BAR_COUNCIL_ALREADY_EXISTS',
                    message: 'Lawyer with same Bar Council Number already exists',
                    applicationId: existingByBarCouncil.id,
                });
            }
        }

        const existingDraft = await this.repo.findOne({
            where: {
                userId: user.id,
                status: 'DRAFT',
            },
            order: { updatedAt: 'DESC' },
        });

        if (existingDraft) {
            existingDraft.firstName = dto.firstName?.trim() || null;
            existingDraft.lastName = dto.lastName?.trim() || null;
            existingDraft.email = normalizedEmail;
            existingDraft.phone = normalizedPhone;
            existingDraft.code = normalizedCode;
            existingDraft.city = dto.city?.trim() || null;
            existingDraft.state = dto.state?.trim() || null;
            existingDraft.officeAddress = dto.officeAddress?.trim() || null;
            existingDraft.legalCategoryIds = dto.legalCategoryIds;
            existingDraft.languages = dto.languages;
            existingDraft.selectedPlan = dto.selectedPlan;

            return this.repo.save(existingDraft);
        }

        const app = this.repo.create({
            ...dto,
            firstName: dto.firstName?.trim() || null,
            lastName: dto.lastName?.trim() || null,
            email: normalizedEmail,
            phone: normalizedPhone,
            code: normalizedCode,
            city: dto.city?.trim() || null,
            state: dto.state?.trim() || null,
            officeAddress: dto.officeAddress?.trim() || null,
            userId: user.id,
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
            const normalizedEmail = dto.email?.trim() || null;

            const user = await this.usersService.findOrCreateByMobile(
                `${normalizedCode}${normalizedPhone}`,
                normalizedEmail,
                'LAWYER',
            );

            const existingActive = await this.repo.findOne({
                where: {
                    userId: user.id,
                    status: In(['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED']),
                },
                order: { updatedAt: 'DESC' },
            });

            if (existingActive && existingActive.id !== app.id) {
                throw new BadRequestException({
                    code: 'APPLICATION_ALREADY_EXISTS',
                    message: `An active lawyer application already exists for this mobile number. Application ID: ${existingActive.id}`,
                    applicationId: existingActive.id,
                    status: existingActive.status,
                });
            }

            app.userId = user.id;
            app.phone = normalizedPhone;
            app.code = normalizedCode;
        }

        if (dto.barCouncilEnrollmentNumber !== undefined) {
            const normalizedBarCouncilNumber =
                dto.barCouncilEnrollmentNumber?.trim()
                    ? this.normalizeBarCouncilEnrollmentNumber(dto.barCouncilEnrollmentNumber)
                    : null;

            if (normalizedBarCouncilNumber) {
                const existingByBarCouncil = await this.findByBarCouncilEnrollmentNumber(
                    normalizedBarCouncilNumber,
                );

                if (existingByBarCouncil && existingByBarCouncil.id !== app.id) {
                    throw new BadRequestException({
                        code: 'BAR_COUNCIL_ALREADY_EXISTS',
                        message: 'Lawyer with same Bar Council Number already exists',
                        applicationId: existingByBarCouncil.id,
                    });
                }
            }

            app.barCouncilEnrollmentNumber = normalizedBarCouncilNumber;
        }

        if (dto.email !== undefined) app.email = dto.email?.trim() || null;
        if (dto.firstName !== undefined) app.firstName = dto.firstName?.trim() || null;
        if (dto.lastName !== undefined) app.lastName = dto.lastName?.trim() || null;
        if (dto.city !== undefined) app.city = dto.city?.trim() || null;
        if (dto.state !== undefined) app.state = dto.state?.trim() || null;
        if (dto.officeAddress !== undefined) {
            app.officeAddress = dto.officeAddress?.trim() || null;
        }

        if (dto.legalCategoryIds !== undefined) app.legalCategoryIds = dto.legalCategoryIds;
        if (dto.languages !== undefined) app.languages = dto.languages;
        if (dto.selectedPlan !== undefined) app.selectedPlan = dto.selectedPlan;

        if (dto.barCouncilState !== undefined) {
            app.barCouncilState = dto.barCouncilState?.trim() || null;
        }

        if (dto.yearsOfExperience !== undefined) {
            app.yearsOfExperience = dto.yearsOfExperience;
        }

        if (dto.courtsOfPractice !== undefined) {
            app.courtsOfPractice = dto.courtsOfPractice?.trim() || null;
        }

        if (dto.photoFileName !== undefined) {
            app.photoFileName = dto.photoFileName?.trim() || null;
        }

        if (dto.photoMimeType !== undefined) {
            app.photoMimeType = dto.photoMimeType?.trim() || null;
        }

        if (dto.photoPath !== undefined) {
            app.photoPath = dto.photoPath?.trim() || null;
        }

        if (dto.barCouncilIdFileName !== undefined) {
            app.barCouncilIdFileName = dto.barCouncilIdFileName?.trim() || null;
        }

        if (dto.barCouncilIdMimeType !== undefined) {
            app.barCouncilIdMimeType = dto.barCouncilIdMimeType?.trim() || null;
        }

        if (dto.barCouncilIdPath !== undefined) {
            app.barCouncilIdPath = dto.barCouncilIdPath?.trim() || null;
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