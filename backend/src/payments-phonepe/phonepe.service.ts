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
    private readonly baseUrl = 'https://api.phonepe.com/apis/hermes/pay';

    // Step 1 - Initiate a payment
    async initiatePayment(consultationId: number, amount: number) {
        const merchantTransactionId = `MT_${Date.now()}`;

        const payload = {
            merchantId: this.merchantId,
            merchantTransactionId,
            amount: amount * 100, // in paise
            merchantOrderId: consultationId.toString(),
            redirectUrl: `${process.env.BACKEND_URL}/phonepe/callback`,
            callbackUrl: `${process.env.BACKEND_URL}/phonepe/callback`,
            mobileNumber: '9999999999',
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const checksum = crypto
            .createHash('sha256')
            .update(base64Payload + '/pg/v1/pay' + this.saltKey)
            .digest('hex') + '###' + this.saltIndex;

        const response = await axios.post(
            `${this.baseUrl}/pg/v1/pay`,
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                },
            },
        );

        // Save info
        await this.repo.update(consultationId, {
            phonepeMerchantTransactionId: merchantTransactionId,
            paymentStatus: 'PENDING',
        });

        return response.data;
    }

    // Step 2 - Handle callback
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