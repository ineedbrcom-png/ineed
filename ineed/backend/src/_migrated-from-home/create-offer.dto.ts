import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;

  @IsString()
  @IsOptional()
  message?: string;
}