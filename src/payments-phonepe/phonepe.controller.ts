// import {
//   Controller,
//   Post,
//   Body,
//   Get,
//   Param,
//   NotFoundException,
//   Headers,
// } from "@nestjs/common";
// import { PhonePeService } from "./phonepe.service";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { Consultation } from "../consultations/consultation.entity";
// import { JoinLawyerService } from '../join-lawyer/join-lawyer.service';
//
// @Controller("phonepe")
// export class PhonePeController {
//   constructor(
//       private readonly phonePeService: PhonePeService,
//       private readonly joinLawyerService: JoinLawyerService,
//
//       @InjectRepository(Consultation) // ✅ THIS WAS MISSING
//       private readonly repo: Repository<Consultation>,
//   ) {}
//
//   @Post("initiate")
//   initiatePayment(@Body() body: { consultationId: number; amount: number }) {
//     return this.phonePeService.initiatePayment(
//         body.consultationId,
//         body.amount,
//     );
//   }
//
//   @Post("callback")
//   async callback(@Body() body: any) {
//     return this.phonePeService.handleCallback(body);
//   }
//
//
//   @Post('callback/join-lawyer')
//   async joinLawyerCallback(@Body() body: any, @Headers() headers: any) {
//     // If you do checksum verification in your phonepeService:
//     // await this.phonepeService.verifyCallback(headers, body);
//
//     return this.joinLawyerService.handlePhonepeCallback(body);
//   }
//
//
//   @Get("status/:txnId")
//   async getPaymentStatus(@Param("txnId") txnId: string) {
//     const consultation = await this.repo.findOne({
//       where: { phonepeMerchantTransactionId: txnId },
//     });
//
//     if (!consultation) {
//       throw new NotFoundException("Transaction not found");
//     }
//
//     return {
//       status: consultation.paymentStatus, // SUCCESS | FAILED | PENDING
//     };
//   }
// }