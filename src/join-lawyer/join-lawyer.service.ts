import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JoinLawyerApplicationEntity } from './join-lawyer-application.entity';
import { CreateJoinLawyerDto } from './dto/create-join-lawyer.dto';
import { UpdateJoinLawyerDto } from './dto/update-join-lawyer.dto';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JoinLawyerService {
    constructor(
        @InjectRepository(JoinLawyerApplicationEntity)
        private readonly repo: Repository<JoinLawyerApplicationEntity>,

        @Inject(forwardRef(() => PaymentsService))
        private readonly paymentsService: PaymentsService,

        private readonly usersService: UsersService,
    ) {}

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

    // ─────────────────────────────────────────────
    // CREATE DRAFT (STEP 1)
    // ─────────────────────────────────────────────
    async createDraft(dto: CreateJoinLawyerDto) {
        const app = this.repo.create({
            ...dto,
            paymentStatus: 'DRAFT',
            applicationStatus: 'DRAFT',
        });
        return this.repo.save(app);
    }

    // ─────────────────────────────────────────────
    async getById(id: string) {
        const app = await this.repo.findOne({
            where: { id },
            relations: { user: true } as any,
        });
        if (!app) throw new NotFoundException('Application not found');
        return app;
    }

    // ─────────────────────────────────────────────
    async update(id: string, dto: UpdateJoinLawyerDto) {
        const app = await this.getById(id);

        // ✅ Step 2 identity binding
        const hasPhoneData = dto.phone && dto.code;

        if (hasPhoneData) {
            const mobileE164 = `${dto.code}${dto.phone}`.replace(/\s+/g, '');

            const user = await this.usersService.findOrCreateByMobile(
                mobileE164,
                dto.email?.trim() || null,
            );

            const existingActive = await this.findActiveApplicationByUserId(user.id);

            // another active app already exists for same user
            if (existingActive && existingActive.id !== app.id) {
                throw new BadRequestException(
                    `An active lawyer application already exists for this mobile number. Application ID: ${existingActive.id}`,
                );
            }

            app.userId = user.id;
        }

        if (dto.email !== undefined) {
            app.email = dto.email?.trim() || null;
        }

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

        if (dto.barCouncilEnrollmentNumber !== undefined) {
            app.barCouncilEnrollmentNumber = dto.barCouncilEnrollmentNumber;
        }

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

    // ─────────────────────────────────────────────
    async setPhoto(id: string, buffer: Buffer, mimeType: string) {
        const app = await this.getById(id);
        app.photo = buffer;
        app.photoMimeType = mimeType;
        return this.repo.save(app);
    }

    async getPhoto(id: string) {
        const app = await this.repo.findOne({
            where: { id },
            select: { id: true, photo: true, photoMimeType: true },
        });
        if (!app) throw new NotFoundException('Application not found');
        return { photo: app.photo, photoMimeType: app.photoMimeType };
    }

    // ─────────────────────────────────────────────
    // ✅ INITIATE PAYMENT (CORRECT WAY)
    // ─────────────────────────────────────────────
    async initiatePayment(
        applicationId: string,
        frontendBaseUrl: string,
        backendBaseUrl: string,
    ) {
        const app = await this.getById(applicationId);

        // ✅ Validation
        if (!app.legalCategoryIds?.length) {
            throw new BadRequestException('Select at least one legal category');
        }

        if (!app.languages?.length) {
            throw new BadRequestException('Select at least one language');
        }

        const required = [
            app.planYears,
            app.amountInr,
            app.firstName,
            app.lastName,
            app.phone,
            app.email,
            app.primaryCity,
            app.barCouncilEnrollmentNumber,
            app.barCouncilState,
            app.yearsOfExperience,
            app.courtsOfPractice,
            app.primaryExpertise,
            app.photo,
            app.consentAccepted,
        ];

        if (required.some(v => v === null || v === undefined || v === '' || v === false)) {
            throw new BadRequestException('Complete all steps before payment');
        }

        // ✅ Amount validation (KEEP IN SYNC WITH UI)
        const priceMap: Record<number, number> = {
            1: 499,
            2: 899,
            3: 1299, // change to 1499 if UI changed
        };

        if (app.amountInr !== priceMap[app.planYears]) {
            throw new BadRequestException('Invalid plan amount');
        }

        if (!app.userId) {
            throw new BadRequestException('Complete basic information before payment');
        }

        // ✅ Mark payment as pending
        app.paymentStatus = 'PENDING';
        await this.repo.save(app);

        // ✅ CREATE / REUSE PAYMENT + CREATE ATTEMPT
        const paymentAttempt = await this.paymentsService.createAttemptForJoinLawyer(
            applicationId,
            app.amountInr,
            frontendBaseUrl,
            backendBaseUrl,
        );

        // ✅ Store raw response for audit/debug
        app.paymentRaw = paymentAttempt;
        await this.repo.save(app);

        return paymentAttempt;
    }

    // ─────────────────────────────────────────────
    // ❌ REMOVE PhonePe callback from here
    // ✅ Payment callbacks are handled ONLY in PaymentsService
    // ─────────────────────────────────────────────
}
