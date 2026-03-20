import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
    ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateJoinLawyerDto {
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    legalCategoryIds?: number[];

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    languages?: string[];

    @IsOptional()
    @IsString()
    @IsIn(['starter', 'growth', 'pro'])
    selectedPlan?: 'starter' | 'growth' | 'pro';

    @IsOptional()
    @IsIn(['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'])
    status?: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

    @IsOptional()
    @IsString()
    @MaxLength(80)
    firstName?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    lastName?: string | null;

    @IsOptional()
    @IsString()
    @Length(10, 10)
    phone?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    code?: string | null;

    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    city?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    state?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    officeAddress?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    barCouncilEnrollmentNumber?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    barCouncilState?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    yearsOfExperience?: number | null;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    courtsOfPractice?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    photoFileName?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    photoMimeType?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    photoPath?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    barCouncilIdFileName?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    barCouncilIdMimeType?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    barCouncilIdPath?: string | null;

    @IsOptional()
    @IsBoolean()
    consentAccepted?: boolean;
}