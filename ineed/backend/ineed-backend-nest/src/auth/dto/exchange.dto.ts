import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string; // Firebase ID Token
}
