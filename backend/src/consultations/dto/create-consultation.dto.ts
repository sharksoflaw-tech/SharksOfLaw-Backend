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

    @IsOptional()
    @IsString()
    razorpayOrderId?: string;

    @IsOptional()
    @IsString()
    razorpayPaymentId?: string;
}