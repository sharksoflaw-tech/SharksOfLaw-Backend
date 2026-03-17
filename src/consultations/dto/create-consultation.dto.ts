import { IsString, IsOptional, IsNumber, IsIn } from "class-validator";

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

    @IsOptional()
    @IsNumber()
    legalIssueId: number;

    @IsOptional()
    @IsNumber()
    lawyerId?: number;

    @IsOptional()
    @IsString()
    caseDetails?: string;

    // ---------------------
    // ✅ PHONEPE FIELDS
    // ---------------------

    @IsOptional()
    @IsString()
    phonepeMerchantTransactionId?: string;

    @IsOptional()
    @IsString()
    phonepeTransactionId?: string;

    @IsOptional()
    @IsString()
    phonepeProviderReferenceId?: string;

    @IsOptional()
    @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
    paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
}