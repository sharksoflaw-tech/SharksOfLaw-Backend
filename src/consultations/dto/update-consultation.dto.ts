import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateConsultationDto {
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
  @Transform(({ value }) => (value === '' ? undefined : value?.trim()))
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  legalIssueId?: number;

  @IsOptional()
  @IsUUID()
  lawyerProfileId?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsIn(['quick', 'standard', 'detailed'])
  selectedPlan?: 'quick' | 'standard' | 'detailed';

  @IsOptional()
  @IsString()
  caseDetails?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'SUBMITTED', 'CLOSED'])
  status?: 'DRAFT' | 'SUBMITTED' | 'CLOSED';
}