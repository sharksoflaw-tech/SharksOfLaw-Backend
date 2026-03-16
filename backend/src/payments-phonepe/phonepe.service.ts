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

    private readonly merchantId = process.env.PHONEPE_MERCHANT_ID;
    private readonly saltKey = process.env.PHONEPE_SALT_KEY;
    private readonly saltIndex = process.env.PHONEPE_SALT_INDEX;
    private readonly backendUrl = process.env.BACKEND_URL;

    // ★★★ Correct Sandbox Base Path ★★★
    private readonly baseUrl = process.env.PHONEPE_BASE_URL;

    async initiatePayment(consultationId: number, amount: number) {
        const merchantTransactionId = `MT_${Date.now()}`;

        const payload = {
            merchantId: this.merchantId,
            merchantTransactionId,
            amount: amount * 100, // paise
            merchantOrderId: consultationId.toString(),
            redirectUrl: `${this.backendUrl}/api/phonepe/callback`,
            callbackUrl: `${this.backendUrl}/api/phonepe/callback`,
            mobileNumber: '9999999999',
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        // Step 1: Payload -> Base64
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Step 2: Checksum must match EXACT endpoint path
        const toSign = base64Payload + '/pg/v1/pay' + this.saltKey;
        const sha256 = crypto.createHash('sha256').update(toSign).digest('hex');
        const checksum = sha256 + '###' + this.saltIndex;

        // Step 3: Hit Sandbox URL
        const response = await axios.post(
            `${this.baseUrl}/v1/pay`, // 👈 Correct path now
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': this.merchantId,
                },
            },
        );

        // Save metadata
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