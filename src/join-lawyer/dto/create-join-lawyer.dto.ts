import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsString } from 'class-validator';

export class CreateJoinLawyerDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    legalCategoryIds: number[];

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    languages: string[];

    @IsInt()
    @IsIn([1, 2, 3])
    planYears: number;

    @IsInt()
    @IsIn([499, 899, 1299])
    amountInr: number;
}