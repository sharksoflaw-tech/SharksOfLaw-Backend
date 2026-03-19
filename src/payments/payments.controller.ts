import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateConsultationAttemptDto } from './dto/create-consultation-attempt.dto';
import { CreateJoinLawyerAttemptDto } from './dto/create-joinlawyer-attempt.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private payments: PaymentsService) {}

    @Post('consultations/attempts')
    createConsultAttempt(@Body() dto: CreateConsultationAttemptDto) {
        const frontendBaseUrl = process.env.FRONTEND_URL!;
        const backendBaseUrl = process.env.BACKEND_URL!;
        return this.payments.createAttemptForConsultation(dto.consultationId, dto.amountInr, frontendBaseUrl, backendBaseUrl);
    }

    @Post('join-lawyer/attempts')
    createJoinLawyerAttempt(@Body() dto: CreateJoinLawyerAttemptDto) {
        const frontendBaseUrl = process.env.FRONTEND_URL!;
        const backendBaseUrl = process.env.BACKEND_URL!;
        return this.payments.createAttemptForJoinLawyer(dto.joinLawyerApplicationId, dto.amountInr, frontendBaseUrl, backendBaseUrl);
    }

    @Post('phonepe/callback')
    phonepeCallback(@Body() payload: any) {
        return this.payments.handlePhonepeCallback(payload);
    }
}