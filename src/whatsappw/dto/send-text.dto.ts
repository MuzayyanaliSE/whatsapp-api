import { ApiProperty } from '@nestjs/swagger';

export class SendTextDto {
  @ApiProperty({ example: '923187056810@c.us' })
  jid: string;

  @ApiProperty({ example: 'Hello from NestJS!' })
  message: string;
}
