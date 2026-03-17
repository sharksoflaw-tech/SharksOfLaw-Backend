import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsNumber()
  rating: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
