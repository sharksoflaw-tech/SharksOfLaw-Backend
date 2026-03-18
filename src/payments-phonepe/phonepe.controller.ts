import {Controller, Post, Body, Get, Query, NotFoundException, Param} from "@nestjs/common";
import { PhonePeService } from "./phonepe.service";
import {Repository} from "typeorm";
import {Consultation} from "../consultations/consultation.entity";

@Controller("phonepe")
export class PhonePeController {
  constructor(private readonly phonePeService: PhonePeService) {}
  private readonly repo: Repository<Consultation>

  @Post("initiate")
  initiatePayment(@Body() body: { consultationId: number; amount: number }) {
    return this.phonePeService.initiatePayment(
      body.consultationId,
      body.amount,
    );
  }

  @Post("callback")
  async callback(@Body() body: any) {
    return this.phonePeService.handleCallback(body);
  }

  @Get("status/:txnId")
  async getPaymentStatus(@Param("txnId") txnId: string) {
    const consultation = await this.repo.findOne({
      where: { phonepeMerchantTransactionId: txnId },
    });

    if (!consultation) {
      throw new NotFoundException("Transaction not found");
    }

    return {
      status: consultation.paymentStatus, // SUCCESS | FAILED | PENDING
    };
  }
}
