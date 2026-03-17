import { IsString, IsOptional } from "class-validator";

export class ContactDto {
    @IsString()
    fullName: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    message?: string;
}