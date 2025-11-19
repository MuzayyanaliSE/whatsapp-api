import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { WhatsappwService } from './whatsappw.service';
import { SendTextDto } from './dto/send-text.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappwService) {}

  @Get('qr')
  @ApiOperation({ summary: 'Get QR code (PNG)' })
  async getQr(@Res() res: any) {
    const qr = await this.whatsapp.getQrCode();

    if (!qr) {
      return res
        .status(200)
        .json({
          message:
            'Already authenticated or QR not ready yet. Try again if not logged in.',
        });
    }

    const base64 = qr.split(',')[1];
    const img = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/png');
    return res.send(img);
  }

  @Post('send-text')
  @ApiOperation({ summary: 'Send WhatsApp text message' })
  @ApiBody({ type: SendTextDto })
  async sendText(@Body() body: SendTextDto) {
    return this.whatsapp.sendMessage(body.jid, body.message);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all chats' })
  async getChats() {
    return this.whatsapp.getChats();
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get chat messages by chat ID' })
  async getMessages(@Param('id') id: string, @Query('limit') limit = 50) {
    return this.whatsapp.getMessages(id, Number(limit));
  }
}
