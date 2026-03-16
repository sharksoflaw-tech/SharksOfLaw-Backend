import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateLegalIssueDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}