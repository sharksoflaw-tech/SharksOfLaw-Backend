import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from '../consultations/consultation.entity';

@Injectable()
export class PhonePeService {
    private readonly merchantId: string;
    private readonly apiKey: string;
    private readonly backendUrl: string;
    private readonly baseUrl =
        'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/pay';

    constructor(
        @InjectRepository(Consultation)
        private readonly repo: Repository<Consultation>,
    ) {
        this.merchantId = process.env.PHONEPE_MERCHANT_ID ?? '';
        this.apiKey = process.env.PHONEPE_API_KEY ?? '';
        this.backendUrl = process.env.BACKEND_URL ?? '';

        // Optional: fail fast if envs missing
        if (!this.merchantId || !this.apiKey || !this.backendUrl) {
            throw new InternalServerErrorException(
                'PhonePe configuration missing (PHONEPE_MERCHANT_ID, PHONEPE_API_KEY, BACKEND_URL)',
            );
        }
    }

    async initiatePayment(consultationId: number, amount: number) {
        const merchantTransactionId = `MT_${Date.now()}`;

        const payload = {
            merchantId: this.merchantId,
            merchantTransactionId,
            merchantUserId: 'USER_' + consultationId,
            amount: amount * 100,
            redirectUrl: `${this.backendUrl}/api/phonepe/callback`,
            callbackUrl: `${this.backendUrl}/api/phonepe/callback`,
            mobileNumber: '9999999999',
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const bodyString = JSON.stringify(payload);

        // ✅ this.apiKey is now guaranteed string (not undefined)
        const hmac = crypto
            .createHmac('sha256', this.apiKey)
            .update(bodyString)
            .digest('hex');

        const headers = {
            'Content-Type': 'application/json',
            'X-VERIFY': hmac,
            'X-MERCHANT-ID': this.merchantId,
        };

        const response = await axios.post(this.baseUrl, payload, { headers });

        await this.repo.update(consultationId, {
            phonepeMerchantTransactionId: merchantTransactionId,
            paymentStatus: 'PENDING',
        });

        return response.data;
    }

    async handleCallback(body: any) {
        const data = body.data;

        await this.repo.update(
            { phonepeMerchantTransactionId: data.merchantTransactionId },
            {
                phonepeTransactionId: data.transactionId,
                phonepeProviderReferenceId: data.providerReferenceId,
                paymentStatus: data.status,
            },
        );

        return { success: true };
    }
}