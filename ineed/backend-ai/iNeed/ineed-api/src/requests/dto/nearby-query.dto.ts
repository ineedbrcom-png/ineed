import { IsNumber, IsOptional } from 'class-validator';

export class NearbyQueryDto {
  @IsNumber() lat: number;
  @IsNumber() lng: number;
  @IsNumber() radius: number;
  @IsOptional() @IsNumber() limit?: number;
}