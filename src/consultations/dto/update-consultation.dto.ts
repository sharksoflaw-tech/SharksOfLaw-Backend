import { IsString, IsOptional, IsNumber, IsEmail, IsIn, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => {
    if (value === '') return null;
    return value;
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsEmail()
  email?: string | null;

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
  legalCategoryId?: number;

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