import { IsInt, IsUUID, IsIn } from 'class-validator';

export class CreateJoinLawyerAttemptDto {
    @IsUUID()
    joinLawyerApplicationId: string;

    @IsInt()
    @IsIn([499, 899, 1299])
    amountInr: number;
}