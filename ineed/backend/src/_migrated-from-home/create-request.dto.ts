import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsLatitude,
  IsLongitude,
  MaxLength,
} from 'class-validator';
import { RequestType } from '@prisma/client';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(RequestType)
  type: RequestType;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  @IsOptional()
  @IsNumber()
  budget?: number;
}