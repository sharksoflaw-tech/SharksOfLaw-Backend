import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLawyerDto {
    @IsString()
    fullName: string;

    @IsString()
    avatarInitials: string;

    @IsString()
    expertise: string;

    @IsString()
    practiceArea: string;

    @IsNumber()
    experienceYears: number;

    @IsString()
    city: string;

    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    @IsBoolean()
    verified?: boolean;
}