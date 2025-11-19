import { Module } from '@nestjs/common';
import { WhatsappwService } from './whatsappw.service';
import { WhatsappController } from './whatsappw.controller';

@Module({
  providers: [WhatsappwService],
  controllers: [WhatsappController],
  exports: [WhatsappwService],
})
export class WhatsappwModule {}
