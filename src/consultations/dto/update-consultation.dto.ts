import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  IsIn,
} from 'class-validator';

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
  @IsNumber()
  legalIssueId?: number;

  @IsOptional()
  @IsString()
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