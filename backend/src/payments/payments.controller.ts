import { Body, Controller, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@Controller("payments")
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post("create-order")
    createOrder(@Body() dto: CreateOrderDto) {
        return this.paymentsService.createOrder(dto);
    }

    @Post("verify")
    verify(@Body() dto: VerifyPaymentDto) {
        return this.paymentsService.verifyPayment(dto);
    }
}