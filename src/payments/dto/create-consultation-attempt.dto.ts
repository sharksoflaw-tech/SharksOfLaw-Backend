import { IsInt, IsIn } from 'class-validator';

export class CreateConsultationAttemptDto {
    @IsInt()
    consultationId: number;

    @IsInt()
    @IsIn([99, 199, 499]) // align with your plans
    amountInr: number;
}