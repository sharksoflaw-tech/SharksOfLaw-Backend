import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateConsultationDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value?.trim()))
  @IsEmail()
  email?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  caseDetails?: string;

  @Type(() => Number)
  @IsInt()
  legalIssueId: number;

  @IsString()
  language: string;

  @IsString()
  @IsIn(['quick', 'standard', 'detailed'])
  selectedPlan: 'quick' | 'standard' | 'detailed';

  @IsOptional()
  @IsUUID()
  lawyerProfileId?: string;
}