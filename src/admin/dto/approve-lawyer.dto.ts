import { IsOptional, IsString } from 'class-validator';

export class ApproveLawyerDto {
    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    city?: string;
}