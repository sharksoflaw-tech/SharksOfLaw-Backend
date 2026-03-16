import { IsIn, IsString } from "class-validator";

export class CreateOrderDto {
    @IsString()
    @IsIn(["quick", "standard", "detailed"])
    planId: "quick" | "standard" | "detailed";
}