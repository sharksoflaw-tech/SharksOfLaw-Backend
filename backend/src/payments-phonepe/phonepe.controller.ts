import { Controller, Post, Body } from "@nestjs/common";
import { PhonePeService } from "./phonepe.service";

@Controller("phonepe")
export class PhonePeController {
    constructor(private readonly phonepe: PhonePeService) {}

    @Post("create-order")
    async createOrder(@Body() body: { amount: number; customerId: string }) {
        const redirectUrl = await this.phonepe.createPayment(body.amount, body.customerId);
        return { redirectUrl };
    }
}