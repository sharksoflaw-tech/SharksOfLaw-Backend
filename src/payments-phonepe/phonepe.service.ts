// import { Injectable, InternalServerErrorException } from "@nestjs/common";
// import axios, { AxiosError } from "axios";
// import * as crypto from "crypto";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { Consultation } from "../consultations/consultation.entity";
// import { JoinLawyerService } from "../join-lawyer/join-lawyer.service";
//
// interface PhonePePaymentResponse {
//   success: boolean;
//   code: string;
//   message: string;
//   data?: {
//     merchantId: string;
//     merchantTransactionId: string;
//     instrumentResponse?: {
//       redirectInfo?: {
//         url: string;
//       };
//     };
//   };
// }
//
// interface PhonePeStatusResponse {
//   success: boolean;
//   code: string;
//   message: string;
//   data?: {
//     merchantId: string;
//     merchantTransactionId: string;
//     transactionId: string;
//     amount: number;
//     state: string;
//     responseCode: string;
//     providerReferenceId?: string;
//   };
// }
//
// interface PhonePeCallbackBody {
//   merchantTransactionId: string;
//   transactionId?: string;
//   amount?: number;
//   state?: string;
//   responseCode?: string;
// }
//
// @Injectable()
// export class PhonePeService {
//   constructor(
//     @InjectRepository(Consultation)
//     private readonly repo: Repository<Consultation>,
//     private readonly joinLawyerService: JoinLawyerService,
//   ) {}
//
//   private readonly merchantId = process.env.PHONEPE_MERCHANT_ID!;
//   private readonly saltKey = process.env.PHONEPE_SALT_KEY!;
//   private readonly saltIndex = process.env.PHONEPE_SALT_INDEX!;
//   private readonly backendUrl = process.env.BACKEND_URL!;
//   private readonly frontendUrl = process.env.FRONTEND_URL!;
//
//   // ✅ SANDBOX URLS (change to prod later)
//   private readonly PAYMENT_URL =
//     "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
//
//   private readonly STATUS_URL =
//     "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";
//
//   /**
//    * STEP 1: INITIATE PAYMENT
//    */
//   async initiatePayment(consultationId: number, amount: number) {
//     try {
//       const consultation = await this.repo.findOneBy({ id: consultationId });
//
//       if (!consultation) throw new Error("Consultation not found");
//
//       const merchantTransactionId = "MT" + Date.now();
//
// // ✅ SAVE BEFORE CALLING PHONEPE
//       await this.repo.update(
//           { id: consultationId },
//           { phonepeMerchantTransactionId: merchantTransactionId }
//       );
//
// // then call PhonePe API
//
//       console.log("Updating consultation for txn:", merchantTransactionId);
//
//       console.log("CALLBACK URL:", `${this.backendUrl}/api/phonepe/callback`);
//
//       const payload = {
//         merchantId: this.merchantId,
//         merchantTransactionId,
//         merchantUserId: `MUID${consultationId}`,
//         amount: Math.floor(amount * 100),
//         redirectUrl: `${this.frontendUrl}/consult-success?txnId=${merchantTransactionId}`,
//         redirectMode: "REDIRECT",
//         callbackUrl: `${this.backendUrl}/api/phonepe/callback`,
//         mobileNumber: consultation.phone || "9999999999",
//         paymentInstrument: {
//           type: "PAY_PAGE",
//         },
//       };
//
//       const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
//         "base64",
//       );
//
//       const stringToHash = base64Payload + "/pg/v1/pay" + this.saltKey;
//
//       const sha256 = crypto
//         .createHash("sha256")
//         .update(stringToHash)
//         .digest("hex");
//
//       const xVerify = `${sha256}###${this.saltIndex}`;
//
//       const response = await axios.post<PhonePePaymentResponse>(
//         this.PAYMENT_URL,
//         { request: base64Payload },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-VERIFY": xVerify,
//             accept: "application/json",
//           },
//         },
//       );
//
//       console.log("PHONEPE RESPONSE:", response.data);
//
//       const redirectUrl =
//         response.data?.data?.instrumentResponse?.redirectInfo?.url;
//
//       if (!redirectUrl) {
//         throw new Error("No redirect URL received");
//       }
//
//       // Save transaction
//       await this.repo.update(consultationId, {
//         phonepeMerchantTransactionId: merchantTransactionId,
//         paymentStatus: "PENDING",
//       });
//
//       return { redirectUrl };
//     } catch (error) {
//       const axiosError = error as AxiosError;
//       console.error(
//         "PAYMENT ERROR:",
//         axiosError.response?.data || axiosError.message,
//       );
//
//       throw new InternalServerErrorException(
//         axiosError.response?.data || "Payment initiation failed",
//       );
//     }
//   }
//
//   /**
//    * STEP 2: VERIFY PAYMENT STATUS (LIKE PHP)
//    */
//   private async verifyPaymentStatus(merchantTransactionId: string) {
//     try {
//       const path = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
//
//       const sha256 = crypto
//         .createHash("sha256")
//         .update(path + this.saltKey)
//         .digest("hex");
//
//       const xVerify = `${sha256}###${this.saltIndex}`;
//
//       const url = `${this.STATUS_URL}/${this.merchantId}/${merchantTransactionId}`;
//
//       const response = await axios.get<PhonePeStatusResponse>(url, {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerify,
//           "X-MERCHANT-ID": this.merchantId,
//           accept: "application/json",
//         },
//       });
//
//       console.log("STATUS RESPONSE:", response.data);
//
//       return response.data;
//     } catch (error) {
//       const axiosError = error as AxiosError;
//       console.error(
//         "STATUS CHECK ERROR:",
//         axiosError.response?.data || axiosError.message,
//       );
//       throw new Error("Status check failed");
//     }
//   }
//
//   /**
//    * STEP 3: HANDLE CALLBACK + VERIFY (IMPORTANT)
//    */
//   async handleCallback(body: any) {
//     try {
//       console.log("RAW BODY:", body);
//
//       // 👇 TEMP FIX: avoid crash for empty body
//       if (!body || !body.response) {
//         console.log("⚠️ Invalid callback hit (likely browser/manual)");
//         return { message: "Callback endpoint working" };
//       }
//
//       const decoded = JSON.parse(
//           Buffer.from(body.response, "base64").toString("utf-8"),
//       );
//
//       console.log("DECODED:", decoded);
//
//       const merchantTransactionId = decoded?.data?.merchantTransactionId;
//
//       if (!merchantTransactionId) {
//         throw new Error("Missing merchantTransactionId");
//       }
//
//       const state = decoded?.data?.state;
//
//       let paymentStatus: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
//
//       if (state === "COMPLETED") {
//         paymentStatus = "SUCCESS";
//       } else if (state === "FAILED") {
//         paymentStatus = "FAILED";
//       } else {
//         paymentStatus = "PENDING"; // safety
//       }
//
//       const updateData: Partial<Consultation> = {
//         phonepeTransactionId: decoded?.data?.transactionId,
//         phonepeProviderReferenceId: decoded?.data?.providerReferenceId,
//         paymentStatus,
//       };
//
//       const consultation = await this.repo.findOne({
//         where: { phonepeMerchantTransactionId: merchantTransactionId },
//       });
//
//       if (!consultation) {
//         console.log("❌ No consultation found for txn:", merchantTransactionId);
//         return;
//       }
//
//       await this.repo.update(
//           { id: consultation.id },
//           updateData
//       );
//
//       try {
//         await this.joinLawyerService.handlePhonepeCallback({
//           merchantTransactionId,
//           data: {
//             state,
//             transactionId: decoded?.data?.transactionId,
//           },
//         });
//       } catch (err) {
//         console.log("JoinLawyer callback skipped:", err.message);
//       }
//
//       return {
//         success: paymentStatus === "SUCCESS",
//         status: paymentStatus,
//       };
//
//     } catch (error) {
//       console.error("❌ CALLBACK ERROR FULL:", error);
//       throw new InternalServerErrorException("Callback handling failed");
//     }
//   }
// }
