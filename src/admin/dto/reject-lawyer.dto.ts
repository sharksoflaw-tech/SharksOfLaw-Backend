import { IsNotEmpty, IsString } from 'class-validator';

export class RejectLawyerDto {
    @IsString()
    @IsNotEmpty()
    reason: string;
}
