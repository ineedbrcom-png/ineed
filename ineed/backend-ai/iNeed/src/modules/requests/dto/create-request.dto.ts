import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}