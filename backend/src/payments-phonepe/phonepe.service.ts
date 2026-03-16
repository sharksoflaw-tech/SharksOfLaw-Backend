import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from '../consultations/consultation.entity';

@Injectable()
export class PhonePeService {
    constructor(
        @InjectRepository(Consultation)
        private readonly repo: Repository<Consultation>,
    ) {}

    private readonly merchantId = process.env.PHONEPE_MERCHANT_ID || '';
    private readonly apiKey = process.env.PHONEPE_API_KEY || '';
    private readonly backendUrl = process.env.BACKEND_URL || '';

    private readonly baseUrl =
        'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/pay';

    async initiatePayment(consultationId: number, amount: number) {
        const merchantTransactionId = `MT_${Date.now()}`;

        const payload = {
            merchantId: this.merchantId,
            merchantTransactionId,
            merchantUserId: "USER_" + consultationId,
            amount: amount * 100,
            redirectUrl: `${this.backendUrl}/api/phonepe/callback`,
            callbackUrl: `${this.backendUrl}/api/phonepe/callback`,
            mobileNumber: "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        // NEW authentication → HMAC256(API_KEY + payload)
        const bodyString = JSON.stringify(payload);
        const hmac = crypto
            .createHmac('sha256', this.apiKey)
            .update(bodyString)
            .digest('hex');

        const headers = {
            "Content-Type": "application/json",
            "X-VERIFY": hmac,
            "X-MERCHANT-ID": this.merchantId
        };

        const response = await axios.post(
            this.baseUrl,
            payload,
            { headers }
        );

        await this.repo.update(consultationId, {
            phonepeMerchantTransactionId: merchantTransactionId,
            paymentStatus: 'PENDING',
        });

        return response.data;
    }

    async handleCallback(body: any) {
        const data = body.data;

        const updateData = {
            phonepeTransactionId: data.transactionId,
            phonepeProviderReferenceId: data.providerReferenceId,
            paymentStatus: data.status,
        };

        await this.repo.update(
            { phonepeMerchantTransactionId: data.merchantTransactionId },
            updateData,
        );

        return { success: true };
    }
}