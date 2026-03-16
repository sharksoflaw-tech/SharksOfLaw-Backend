import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import * as crypto from "crypto";

@Injectable()
export class PhonePeService {
    private merchantId = process.env.PHONEPE_MERCHANT_ID;
    private saltKey = process.env.PHONEPE_SALT_KEY;
    private saltIndex = process.env.PHONEPE_SALT_INDEX;
    private baseUrl = process.env.PHONEPE_BASE_URL;

    async createPayment(amount: number, customerId: string) {
        const payload = {
            merchantId: this.merchantId,
            merchantTransactionId: "txn_" + Date.now(),
            merchantUserId: customerId,
            amount: amount * 100,
            redirectUrl: `${process.env.FRONTEND_REDIRECT_URL}?txnId=txn_${Date.now()}`,
            redirectMode: "REDIRECT",
            mobileNumber: "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE",
            },
        };

        const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
        const hashString = payloadBase64 + "/pg/v1/pay" + this.saltKey;
        const sha256Hash = crypto.createHash("sha256").update(hashString).digest("hex");
        const finalXHeader = sha256Hash + "###" + this.saltIndex;

        const res = await axios.post(
            `${this.baseUrl}/pg/v1/pay`,
            { request: payloadBase64 },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": finalXHeader,
                    "X-MERCHANT-ID": this.merchantId,
                },
            },
        );

        if (!res.data.success) throw new InternalServerErrorException("PhonePe order creation failed");

        return res.data.data.instrumentResponse.redirectInfo.url;
    }
}