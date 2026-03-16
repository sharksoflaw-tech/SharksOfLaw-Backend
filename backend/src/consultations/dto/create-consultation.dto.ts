import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreateConsultationDto {
    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsNumber()
    legalIssueId: number;

    @IsOptional()
    @IsNumber()
    lawyerId?: number;

    @IsOptional()
    @IsString()
    caseDetails?: string;

    // ❌ REMOVED Razorpay fields
    // razorpayOrderId?: string;
    // razorpayPaymentId?: string;

    // ✅ If PhonePe adds transaction reference later, add like:
    @IsOptional()
    @IsString()
    phonepeTransactionId?: string;
}