import { Module } from '@nestjs/common';
import { WhatsappwModule } from './whatsappw/whatsappw.module';

@Module({
  imports: [WhatsappwModule],
})
export class AppModule {}
