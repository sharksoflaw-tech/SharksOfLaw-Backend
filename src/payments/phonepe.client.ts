import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class PhonePeClient {
    private merchantId = process.env.PHONEPE_MERCHANT_ID!;
    private saltKey = process.env.PHONEPE_SALT_KEY!;
    private saltIndex = process.env.PHONEPE_SALT_INDEX!;
    private baseUrl = process.env.PHONEPE_BASE_URL!; // e.g. https://api.phonepe.com or sandbox

    async initiatePayPage(input: {
        merchantTransactionId: string;
        amountInPaise: number;
        redirectUrl: string;
        callbackUrl: string;
        merchantUserId?: string;
        mobileNumber?: string;
    }) {
        const path = '/pg/v1/pay';

        const payload = {
            merchantId: this.merchantId,
            merchantTransactionId: input.merchantTransactionId,
            merchantUserId: input.merchantUserId ?? 'MUID_' + Date.now(),
            amount: input.amountInPaise,
            redirectUrl: input.redirectUrl,
            redirectMode: 'REDIRECT',
            callbackUrl: input.callbackUrl,
            mobileNumber: input.mobileNumber,
            paymentInstrument: { type: 'PAY_PAGE' },
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        const checksum = crypto
            .createHash('sha256')
            .update(base64Payload + path + this.saltKey)
            .digest('hex');

        const xVerify = `${checksum}###${this.saltIndex}`;

        const res = await fetch(`${this.baseUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            },
            body: JSON.stringify({ request: base64Payload }),
        });

        const data = await res.json();
        return data;
    }
}