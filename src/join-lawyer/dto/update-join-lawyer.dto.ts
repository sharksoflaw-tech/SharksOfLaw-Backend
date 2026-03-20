import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateJoinLawyerDto {
    @IsOptional()
    @IsArray()
    legalCategoryIds?: number[];

    @IsOptional()
    @IsArray()
    languages?: string[];

    @IsOptional()
    @IsInt()
    planYears?: number;

    @IsOptional()
    @IsInt()
    amountInr?: number;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    primaryCity?: string;

    @IsOptional()
    @IsString()
    officeAddress?: string;

    @IsOptional()
    @IsString()
    barCouncilEnrollmentNumber?: string;

    @IsOptional()
    @IsString()
    barCouncilState?: string;

    @IsOptional()
    @IsInt()
    yearsOfExperience?: number;

    @IsOptional()
    @IsString()
    courtsOfPractice?: string;

    @IsOptional()
    @IsString()
    primaryExpertise?: string;

    @IsOptional()
    @IsBoolean()
    consentAccepted?: boolean;

    @IsOptional()
    @IsIn(['DRAFT', 'PENDING', 'SUCCESS', 'FAILED'])
    paymentStatus?: 'DRAFT' | 'PENDING' | 'SUCCESS' | 'FAILED';

    @IsOptional()
    @IsIn(['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'])
    applicationStatus?: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
}