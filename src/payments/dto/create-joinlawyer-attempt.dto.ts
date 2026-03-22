import { IsInt, IsUUID, IsIn } from 'class-validator';

export class CreateJoinLawyerAttemptDto {
    @IsInt()
    joinLawyerApplicationId: number;

    @IsInt()
    @IsIn([499, 899, 1299])
    amountInr: number;
}