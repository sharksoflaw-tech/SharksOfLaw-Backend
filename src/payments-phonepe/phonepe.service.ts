import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from '../consultations/consultation.entity';

@Injectable()
export class PhonePeService {
    constructor(
        @InjectRepository(Consultation)
        private readonly repo: Repository<Consultation>,
    ) {}

    private readonly clientId: string = process.env.PHONEPE_CLIENT_ID || '';
    private readonly clientSecret: string = process.env.PHONEPE_CLIENT_SECRET || '';
    private readonly clientVersion = '1';

    private readonly backendUrl: string = process.env.BACKEND_URL || '';

    // ✅ PRODUCTION URLs
    private readonly AUTH_URL =
        // 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
        'https://api-preprod.phonepe.com/apis/pg-sandbox/identity-manager/v1/oauth/token';

    private readonly PAYMENT_URL =
        // 'https://api.phonepe.com/apis/hermes/checkout/v2/pay';
        'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

    /**
     * STEP 1: Get OAuth Token
     */
    private async getAccessToken(): Promise<string> {
        try {
            const response = await axios.post(
                this.AUTH_URL,
                new URLSearchParams(
                    {
                        client_id: this.clientId,
                        client_secret: this.clientSecret,
                        client_version: this.clientVersion,
                        grant_type: 'client_credentials',
                    } as Record<string, string>,
                ),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            return response.data.access_token;
        } catch (error) {
            console.error(
                'PhonePe Auth Error:',
                error.response?.data || error.message,
            );
            throw new InternalServerErrorException('PhonePe auth failed');
        }
    }

    /**
     * STEP 2: Initiate Payment
     */
    async initiatePayment(consultationId: number, amount: number) {
        try {
            // ✅ STEP 0: Validate consultation exists
            const consultation = await this.repo.findOneBy({ id: consultationId });

            if (!consultation) {
                throw new Error('Consultation not found');
            }

            // ✅ STEP 1: Get token
            const token = await this.getAccessToken();
            console.log('TOKEN:', token);

            const merchantTransactionId = `MT_${Date.now()}`;

            if (!this.backendUrl) {
                throw new Error("BACKEND_URL is not set");
            }

            // ✅ STEP 2: Prepare payload
            const payload = {
                merchantId: this.clientId, // ✅ In V2, this is clientId
                merchantTransactionId,
                amount: Math.floor(amount * 100), // convert to paise
                redirectUrl: `${this.backendUrl}/api/phonepe/callback`,
                callbackUrl: `${this.backendUrl}/api/phonepe/callback`,
                merchantUserId: `USER_${consultationId}`, // 🔥 REQUIRED
                mobileNumber: consultation.phone || '9999999999',
                paymentFlow: {
                    type: 'PG_CHECKOUT',
                },
            };

            // ✅ STEP 3: Call PhonePe
            const response = await axios.post(this.PAYMENT_URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // ✅ STEP 4: Update DB AFTER success
            // Save transaction details
            await this.repo.update(consultationId, {
                phonepeMerchantTransactionId: merchantTransactionId,
                paymentStatus: 'PENDING',
            });

            return response.data;
        } catch (error) {
            console.error('FULL ERROR:', {
                data: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
            });

            throw new InternalServerErrorException(
                error.response?.data || 'Payment initiation failed',
            );
        }
    }

    /**
     * STEP 3: Handle Callback (Webhook)
     */
    async handleCallback(body: any) {
        try {
            const data = body;

            const updateData = {
                phonepeTransactionId: data.transactionId || null,
                phonepeProviderReferenceId: data.providerReferenceId || null,
                paymentStatus: data.state || 'FAILED',
            };

            await this.repo.update(
                { phonepeMerchantTransactionId: data.merchantTransactionId },
                updateData,
            );

            return { success: true };
        } catch (error) {
            console.error('Callback Error:', error);
            throw new InternalServerErrorException('Callback handling failed');
        }
    }
}