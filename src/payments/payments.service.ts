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
        let payment = await this.paymentsRepo.findOne({
            where: { consultationId },
            order: { createdAt: 'DESC' }, // 👈 IMPORTANT
        });

        if (payment && payment.status === 'SUCCESS') {
            throw new BadRequestException('Payment already successful');
        }

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
        const callbackUrl = `${backendBaseUrl}/api/payments/phonepe/callback`;

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
        const callbackUrl = `${backendBaseUrl}/api/payments/phonepe/callback`;

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

    async getPaymentStatus({
                               consultationId,
                               appId,
                           }: {
        consultationId?: number;
        appId?: string;
    }) {
        let payment;

        if (consultationId) {
            payment = await this.paymentsRepo.findOne({
                where: { consultationId },
            });
        }

        if (appId) {
            payment = await this.paymentsRepo.findOne({
                where: { joinLawyerApplicationId: appId },
            });
        }

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return {
            status: payment.status, // PENDING | SUCCESS | FAILED
        };
    }

    async handlePhonepeCallback(payload: any) {
        console.log(
            "PHONEPE CALLBACK RECEIVED:",
            JSON.stringify(payload).slice(0, 1200)
        );

        // ✅ STEP 1: Decode payload properly
        let decoded: any;

        try {
            if (payload?.response) {
                decoded = JSON.parse(
                    Buffer.from(payload.response, "base64").toString("utf-8")
                );
            } else {
                decoded = payload;
            }
        } catch (err) {
            console.error("❌ Failed to decode PhonePe payload", err);
            throw new BadRequestException("Invalid PhonePe payload");
        }

        console.log("DECODED CALLBACK:", decoded);

        // ✅ STEP 2: Extract values correctly
        const merchantTransactionId = decoded?.data?.merchantTransactionId;
        const status = decoded?.data?.state; // 👈 MAIN FIELD
        const providerTxnId = decoded?.data?.transactionId ?? null;

        if (!merchantTransactionId) {
            throw new BadRequestException("Missing merchantTransactionId");
        }

        // ✅ STEP 3: Fetch attempt & payment
        const attempt = await this.attemptsRepo.findOne({
            where: { merchantTransactionId },
        });

        if (!attempt) {
            throw new NotFoundException("Payment attempt not found");
        }

        const payment = await this.paymentsRepo.findOne({
            where: { id: attempt.paymentId },
        });

        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        // ✅ STEP 4: Save raw data
        attempt.providerTransactionId = providerTxnId;
        attempt.rawResponse = decoded;

        console.log("PHONEPE STATUS:", status);

        // ✅ HANDLE PENDING (do NOT mark failed)
        if (status === "PENDING") {
            attempt.status = "PENDING";
            attempt.rawResponse = decoded;

            await this.attemptsRepo.save(attempt);

            console.log("⏳ PAYMENT STILL PENDING:", merchantTransactionId);

            return { success: false, status: "PENDING" };
        }

        // ✅ STEP 5: Determine success (ONLY THIS MATTERS)
        const isSuccess = status === "COMPLETED";

        // =========================
        // ✅ SUCCESS FLOW
        // =========================
        if (isSuccess) {
            attempt.status = "SUCCESS";
            payment.status = "SUCCESS";

            await this.attemptsRepo.save(attempt);
            await this.paymentsRepo.save(payment);

            console.log("✅ PAYMENT SUCCESS:", payment.id);

            // ✅ Update Consultation
            if (payment.consultationId) {
                await this.consultationsRepo.update(
                    { id: payment.consultationId },
                    { status: "SUBMITTED" } as any
                );
            }

            // ✅ Update Join Lawyer
            if (payment.joinLawyerApplicationId) {
                await this.joinLawyerRepo.update(
                    { id: payment.joinLawyerApplicationId },
                    {
                        paymentStatus: "SUCCESS",
                        applicationStatus: "SUBMITTED",
                    } as any
                );
            }

            return { success: true, status: "SUCCESS" };
        }

        // =========================
        // ❌ FAILED FLOW
        // =========================
        attempt.status = "FAILED";
        payment.status = "FAILED";

        await this.attemptsRepo.save(attempt);
        await this.paymentsRepo.save(payment);

        console.log("❌ PAYMENT FAILED:", payment.id);

        if (payment.joinLawyerApplicationId) {
            await this.joinLawyerRepo.update(
                { id: payment.joinLawyerApplicationId },
                { paymentStatus: "FAILED" } as any
            );
        }

        return { success: false, status: "FAILED" };
    }

}