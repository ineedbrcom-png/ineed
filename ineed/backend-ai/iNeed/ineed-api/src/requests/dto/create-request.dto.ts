import { IsNumber, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  userId: string;
}