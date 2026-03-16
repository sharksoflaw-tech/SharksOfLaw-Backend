import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PhonePeService } from './phonepe.service';

@Controller('phonepe')
export class PhonePeController {
    constructor(private readonly phonePeService: PhonePeService) {}

    @Post('initiate')
    initiatePayment(@Body() body: { consultationId: number; amount: number }) {
        return this.phonePeService.initiatePayment(body.consultationId, body.amount);
    }

    @Post('callback')
    async callback(@Body() body: any) {
        return this.phonePeService.handleCallback(body);
    }
}