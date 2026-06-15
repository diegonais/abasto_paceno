import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
  })
  status!: string;

  @ApiProperty({
    example: 'backend',
  })
  service!: string;

  @ApiProperty({
    example: '2026-06-14T23:30:00.000Z',
  })
  timestamp!: string;
}
