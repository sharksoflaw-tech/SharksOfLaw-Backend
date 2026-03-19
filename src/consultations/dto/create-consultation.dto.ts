import { IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConsultationDto {
  @IsString() firstName: string;
  @IsString() lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString() phone: string;
  @IsOptional() @IsString() code?: string;

  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() caseDetails?: string;

  @IsInt()
  legalIssueId: number;

  @IsString()
  language: string;

  @IsString()
  @IsIn(['quick', 'standard', 'detailed'])
  selectedPlan: 'quick' | 'standard' | 'detailed';

  // ✅ optional when user comes from lawyer card
  @IsOptional()
  @IsUUID()
  lawyerProfileId?: string;
}