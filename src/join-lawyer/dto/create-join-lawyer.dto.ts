import { IsArray, IsInt } from 'class-validator';

export class CreateJoinLawyerDto {
    @IsArray()
    legalCategoryIds: number[];

    @IsArray()
    languages: string[];

    @IsInt()
    planYears: number;

    @IsInt()
    amountInr: number;
}