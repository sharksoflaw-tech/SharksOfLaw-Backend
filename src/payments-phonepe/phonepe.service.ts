import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

    private readonly merchantId = process.env.PHONEPE_MERCHANT_ID!;
    private readonly saltKey = process.env.PHONEPE_SALT_KEY!;
    private readonly saltIndex = process.env.PHONEPE_SALT_INDEX!;
    private readonly backendUrl = process.env.BACKEND_URL!;

    private readonly PAYMENT_URL =
        'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    async initiatePayment(consultationId: number, amount: number) {
        try {
            const consultation = await this.repo.findOneBy({ id: consultationId });

            if (!consultation) throw new Error('Consultation not found');

            const merchantTransactionId = `MT${Date.now()}`;

            const payload = {
                merchantId: this.merchantId,
                merchantTransactionId,
                merchantUserId: `MUID${consultationId}`,
                amount: Math.floor(amount * 100),
                redirectUrl: `${this.backendUrl}/api/phonepe/callback`,
                redirectMode: 'POST',
                callbackUrl: `${this.backendUrl}/api/phonepe/callback`,
                mobileNumber: consultation.phone || '9999999999',
                paymentInstrument: {
                    type: 'PAY_PAGE',
                },
            };

            const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
                'base64',
            );

            const stringToHash =
                base64Payload + '/pg/v1/pay' + this.saltKey;

            const sha256 = crypto
                .createHash('sha256')
                .update(stringToHash)
                .digest('hex');

            const xVerify = `${sha256}###${this.saltIndex}`;

            console.log('PAYLOAD:', payload);
            console.log('X-VERIFY:', xVerify);

            const response = await axios.post(
                this.PAYMENT_URL,
                { request: base64Payload },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': xVerify,
                        accept: 'application/json',
                    },
                },
            );

            console.log('PHONEPE RESPONSE:', response.data);

            const redirectUrl =
                response.data?.data?.instrumentResponse?.redirectInfo?.url;

            if (!redirectUrl) {
                throw new Error('No redirect URL received');
            }

            await this.repo.update(consultationId, {
                phonepeMerchantTransactionId: merchantTransactionId,
                paymentStatus: 'PENDING',
            });

            return { redirectUrl };
        } catch (error) {
            console.error('FULL ERROR:', error.response?.data || error.message);

            throw new InternalServerErrorException(
                error.response?.data || 'Payment initiation failed',
            );
        }
    }
}