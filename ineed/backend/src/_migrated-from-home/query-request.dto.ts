import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Max,
  Min,
} from 'class-validator';
import { RequestType } from '@prisma/client';

export class QueryRequestDto {
  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @IsNumber()
  @Min(1)
  @Max(50000) // 50km
  @Type(() => Number)
  radius: number; // em metros

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsString()
  q?: string; // For text search
}