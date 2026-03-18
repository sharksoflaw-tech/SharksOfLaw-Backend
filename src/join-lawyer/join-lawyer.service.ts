import {Injectable, BadRequestException, NotFoundException, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinLawyerApplicationEntity } from './join-lawyer-application.entity';
import { CreateJoinLawyerDto } from './dto/create-join-lawyer.dto';
import { UpdateJoinLawyerDto } from './dto/update-join-lawyer.dto';
import { PhonePeService } from '../payments-phonepe/phonepe.service';
import { Consultation } from '../consultations/consultation.entity'; // <-- adjust actual path

@Injectable()
export class JoinLawyerService {
    constructor(
        @InjectRepository(JoinLawyerApplicationEntity)
        private readonly repo: Repository<JoinLawyerApplicationEntity>,

        @InjectRepository(Consultation)
        private readonly consultationRepo: Repository<Consultation>,

        @Inject(forwardRef(() => PhonePeService))
        private readonly phonepeService: PhonePeService,
    ) {}

    async createDraft(dto: CreateJoinLawyerDto) {
        const app = this.repo.create({
            ...dto,
            paymentStatus: 'DRAFT',
            applicationStatus: 'DRAFT',
        });
        return this.repo.save(app);
    }

    async getById(id: string) {
        const app = await this.repo.findOne({ where: { id } });
        if (!app) throw new NotFoundException('Application not found');
        return app;
    }

    async update(id: string, dto: UpdateJoinLawyerDto) {
        const app = await this.getById(id);

        // If consent is being accepted, timestamp it
        if (dto.consentAccepted === true && !app.consentAccepted) {
            app.consentAcceptedAt = new Date();
        }

        Object.assign(app, dto);
        return this.repo.save(app);
    }

    async setPhoto(id: string, buffer: Buffer, mimeType: string) {
        const app = await this.getById(id);
        app.photo = buffer;
        app.photoMimeType = mimeType;
        return this.repo.save(app);
    }

    async getPhoto(id: string) {
        const app = await this.repo.findOne({
            where: {id},
            select: {id: true, photo: true, photoMimeType: true},
        });
        if (!app) throw new NotFoundException('Application not found');
        return {photo: app.photo, photoMimeType: app.photoMimeType};
    }

    /**
     * Initiate PhonePe payment for this application
     */
    async initiatePayment(id: string, frontendBaseUrl: string, backendBaseUrl: string) {
        const app = await this.getById(id);

        if (!app.legalCategories?.length) throw new BadRequestException('Select at least one legal category');
        if (!app.languages?.length) throw new BadRequestException('Select at least one language');

        const required = [
            app.planYears, app.amountInr,
            app.firstName, app.lastName, app.phone, app.email, app.primaryCity,
            app.barCouncilEnrollmentNumber, app.barCouncilState,
            app.yearsOfExperience, app.courtsOfPractice, app.primaryExpertise,
            app.photo, app.consentAccepted,
        ];

        if (required.some(v => v === null || v === undefined || v === '' || v === false)) {
            throw new BadRequestException('Complete all steps before payment');
        }

        // ✅ Keep amount map aligned with your UI
        const map: Record<number, number> = {1: 499, 2: 899, 3: 1299}; // change 1299->1499 if you changed UI
        if (app.amountInr !== map[app.planYears]) throw new BadRequestException('Invalid plan amount');

        // ✅ 1) Create a "consultation" record ONLY to reuse existing PhonePeService
        // IMPORTANT: adapt these fields to match your ConsultationEntity schema
        const consultationToSave = this.consultationRepo.create(
            this.consultationRepo.create({
                amount: app.amountInr,              // or amountInPaise depending on your Consultation schema
                status: 'PENDING',                  // if your schema has it
                type: 'JOIN_LAWYER',                // if your schema has type/category
                referenceId: app.id,                // if your schema has reference field
                phone: app.phone,                   // optional
                email: app.email,                   // optional
            } as any)
        );

        const consultation = await this.consultationRepo.save(consultationToSave);

        const consultationId =
            (consultation as any).id ??
            (consultation as any).consultationId;


        if (!consultationId) {
            throw new BadRequestException('Consultation ID missing after save()');
        }

        // ✅ 2) Store the consultationId on join-lawyer app
        app.phonepeConsultationId = consultationId;
        app.paymentStatus = 'PENDING';
        await this.repo.save(app);

        // ✅ 3) Call PhonePeService with the signature it expects: (consultationId:number, amount:number)
        // NOTE: use the same amount unit book consultation uses (rupees/paise)
        const res = await this.phonepeService.initiatePayment(consultationId, app.amountInr);

        // ✅ 4) After initiatePayment, PhonePeService stores merchantTransactionId in Consultation table
        // Read it back and store into join-lawyer application
        let updatedConsultation = await this.consultationRepo.findOneBy({ id: consultationId } as any);
        if (!updatedConsultation) {
            updatedConsultation = await this.consultationRepo.findOneBy({ consultationId } as any);
        }

        const merchantTxnId = (updatedConsultation as any)?.phonepeMerchantTransactionId;
        if (!merchantTxnId) {
            throw new BadRequestException('Unable to get merchantTransactionId from consultation payment');
        }

        app.merchantTransactionId = merchantTxnId;
        app.paymentRaw = res;
        await this.repo.save(app);

        return res;
    }

    /**
     * PhonePe callback handler
     */
    async handlePhonepeCallback(payload: any) {
        // payload structure depends on your phonepeService verification
        // Usually you will verify checksum in phonepe module first, then call this.
        const merchantTransactionId = payload?.data?.merchantTransactionId || payload?.merchantTransactionId;
        if (!merchantTransactionId) throw new BadRequestException('Missing merchantTransactionId');

        const app = await this.repo.findOne({ where: { merchantTransactionId } });
        if (!app) throw new NotFoundException('Application not found for transaction');

        const status = payload?.data?.state || payload?.code || payload?.status; // adapt
        const phonepeTxnId = payload?.data?.transactionId;

        app.phonepeTransactionId = phonepeTxnId ?? app.phonepeTransactionId;
        app.paymentRaw = payload;

        if (status === 'COMPLETED' || status === 'SUCCESS') {
            app.paymentStatus = 'SUCCESS';
            app.applicationStatus = 'SUBMITTED';
        } else {
            app.paymentStatus = 'FAILED';
        }

        return this.repo.save(app);
    }
}