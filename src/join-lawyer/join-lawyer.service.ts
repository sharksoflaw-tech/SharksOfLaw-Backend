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

@Injectable()
export class JoinLawyerService {
    constructor(
        @InjectRepository(JoinLawyerApplicationEntity)
        private readonly repo: Repository<JoinLawyerApplicationEntity>,

        @Inject(forwardRef(() => PaymentsService))
        private readonly paymentsService: PaymentsService,
    ) {}

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
        const app = await this.repo.findOne({ where: { id } });
        if (!app) throw new NotFoundException('Application not found');
        return app;
    }

    // ─────────────────────────────────────────────
    async update(id: string, dto: UpdateJoinLawyerDto) {
        const app = await this.getById(id);

        if (dto.consentAccepted === true && !app.consentAccepted) {
            app.consentAcceptedAt = new Date();
        }

        Object.assign(app, dto);
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
