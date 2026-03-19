import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { PaymentAttemptEntity } from './payment-attempt.entity';
import { PhonePeClient } from './phonepe.client';
import { Consultation } from '../consultations/consultation.entity';
import { JoinLawyerApplicationEntity } from '../join-lawyer/join-lawyer-application.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(PaymentEntity) private paymentsRepo: Repository<PaymentEntity>,
        @InjectRepository(PaymentAttemptEntity) private attemptsRepo: Repository<PaymentAttemptEntity>,
        @InjectRepository(Consultation) private consultationsRepo: Repository<Consultation>,
        @InjectRepository(JoinLawyerApplicationEntity) private joinLawyerRepo: Repository<JoinLawyerApplicationEntity>,
        private phonepe: PhonePeClient,
    ) {}

    private newMerchantTxnId(prefix: string) {
        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    }

    async createAttemptForConsultation(consultationId: number, amountInr: number, frontendBaseUrl: string, backendBaseUrl: string) {
        const consult = await this.consultationsRepo.findOne({ where: { id: consultationId } as any });
        if (!consult) throw new NotFoundException('Consultation not found');

        // ✅ ensure payment record exists
        let payment = await this.paymentsRepo.findOne({ where: { consultationId } });
        if (!payment) {
            payment = await this.paymentsRepo.save(this.paymentsRepo.create({
                consultationId,
                amountInr,
                status: 'PENDING',
                currency: 'INR',
            }));
        } else {
            // prevent mismatch amounts
            if (payment.amountInr !== amountInr) throw new BadRequestException('Amount mismatch for consultation');
            if (payment.status === 'SUCCESS') throw new BadRequestException('Payment already successful');
        }

        // ✅ new attempt per retry
        const merchantTransactionId = this.newMerchantTxnId('CONSULT');
        const attempt = await this.attemptsRepo.save(this.attemptsRepo.create({
            paymentId: payment.id,
            merchantTransactionId,
            status: 'PENDING',
            provider: 'PHONEPE',
        }));

        const redirectUrl = `${frontendBaseUrl}/consult/payment-status?consultationId=${consultationId}`;
        const callbackUrl = `${backendBaseUrl}/payments/phonepe/callback`;

        const resp = await this.phonepe.initiatePayPage({
            merchantTransactionId,
            amountInPaise: amountInr * 100,
            redirectUrl,
            callbackUrl,
        });

        attempt.rawResponse = resp;
        await this.attemptsRepo.save(attempt);

        return { paymentId: payment.id, attemptId: attempt.id, phonepe: resp };
    }

    async createAttemptForJoinLawyer(appId: string, amountInr: number, frontendBaseUrl: string, backendBaseUrl: string) {
        const app = await this.joinLawyerRepo.findOne({ where: { id: appId } });
        if (!app) throw new NotFoundException('Join lawyer application not found');

        let payment = await this.paymentsRepo.findOne({ where: { joinLawyerApplicationId: appId } });
        if (!payment) {
            payment = await this.paymentsRepo.save(this.paymentsRepo.create({
                joinLawyerApplicationId: appId,
                amountInr,
                status: 'PENDING',
                currency: 'INR',
            }));
        } else {
            if (payment.amountInr !== amountInr) throw new BadRequestException('Amount mismatch for application');
            if (payment.status === 'SUCCESS') throw new BadRequestException('Payment already successful');
        }

        const merchantTransactionId = this.newMerchantTxnId('JOINLAW');
        const attempt = await this.attemptsRepo.save(this.attemptsRepo.create({
            paymentId: payment.id,
            merchantTransactionId,
            status: 'PENDING',
            provider: 'PHONEPE',
        }));

        const redirectUrl = `${frontendBaseUrl}/join-lawyer/payment-status?appId=${appId}`;
        const callbackUrl = `${backendBaseUrl}/payments/phonepe/callback`;

        const resp = await this.phonepe.initiatePayPage({
            merchantTransactionId,
            amountInPaise: amountInr * 100,
            redirectUrl,
            callbackUrl,
        });

        attempt.rawResponse = resp;
        await this.attemptsRepo.save(attempt);

        return { paymentId: payment.id, attemptId: attempt.id, phonepe: resp };
    }

    async handlePhonepeCallback(payload: any) {
        const merchantTransactionId =
            payload?.data?.merchantTransactionId || payload?.merchantTransactionId;

        if (!merchantTransactionId) {
            throw new BadRequestException('Missing merchantTransactionId');
        }

        const attempt = await this.attemptsRepo.findOne({
            where: {merchantTransactionId},
        });
        if (!attempt) {
            throw new NotFoundException('Payment attempt not found');
        }

        const payment = await this.paymentsRepo.findOne({
            where: {id: attempt.paymentId},
        });
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const status =
            payload?.data?.state ||
            payload?.code ||
            payload?.status;

        const providerTxnId = payload?.data?.transactionId ?? null;

        attempt.providerTransactionId = providerTxnId;
        attempt.rawResponse = payload;

        const isSuccess = status === 'COMPLETED' || status === 'SUCCESS';

        if (isSuccess) {
            // ✅ Update payment tables
            attempt.status = 'SUCCESS';
            payment.status = 'SUCCESS';

            await this.attemptsRepo.save(attempt);
            await this.paymentsRepo.save(payment);

            // ✅ CRITICAL: update BUSINESS entity
            if (payment.consultationId) {
                await this.consultationsRepo.update(
                    {id: payment.consultationId},
                    {status: 'SUBMITTED'} as any,
                );
            }

            if (payment.joinLawyerApplicationId) {
                await this.joinLawyerRepo.update(
                    {id: payment.joinLawyerApplicationId},
                    {
                        paymentStatus: 'SUCCESS',
                        applicationStatus: 'SUBMITTED',
                    } as any,
                );
            }

            return {success: true, status: 'SUCCESS'};
        }

        // ❌ FAILED or CANCELLED
        attempt.status = 'FAILED';
        payment.status = 'FAILED';

        await this.attemptsRepo.save(attempt);
        await this.paymentsRepo.save(payment);

        // ✅ optional: mark business entity as failed (do NOT submit)
        if (payment.joinLawyerApplicationId) {
            await this.joinLawyerRepo.update(
                {id: payment.joinLawyerApplicationId},
                {paymentStatus: 'FAILED'} as any,
            );
        }

        return {success: false};
    }

}