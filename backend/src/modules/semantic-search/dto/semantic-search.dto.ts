import { IsString, MaxLength, MinLength } from 'class-validator';

export class SemanticSearchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  query: string;
}
