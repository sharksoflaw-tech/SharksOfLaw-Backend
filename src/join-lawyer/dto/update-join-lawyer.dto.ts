import {
    IsBoolean,
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class UpdateJoinLawyerDto {
    // Step 2
    @IsOptional() @IsString() firstName?: string;
    @IsOptional() @IsString() lastName?: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsEmail() email?: string;
    @IsOptional() @IsString() primaryCity?: string;
    @IsOptional() @IsString() officeAddress?: string;

    // Step 3
    @IsOptional() @IsString() barCouncilEnrollmentNumber?: string;
    @IsOptional() @IsString() barCouncilState?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(70)
    yearsOfExperience?: number;

    @IsOptional() @IsString() courtsOfPractice?: string; // e.g. "District Court, High Court"
    @IsOptional() @IsString() primaryExpertise?: string; // CSV or JSON string

    // Step 5
    @IsOptional() @IsBoolean() consentAccepted?: boolean;
}