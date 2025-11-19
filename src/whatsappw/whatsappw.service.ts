import { Injectable, Logger } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';

@Injectable()
export class WhatsappwService {
  private client: Client;
  private qrCodeDataUrl: string | null = null;
  private isReady = false;

  private readonly logger = new Logger(WhatsappwService.name);

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: 'my-whatsapp-session' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.client.on('qr', async (qr) => {
      this.logger.log('QR RECEIVED');
      this.qrCodeDataUrl = await QRCode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp is ready!');
      this.isReady = true;
      this.qrCodeDataUrl = null; // clear QR
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error('AUTH ERROR: ' + msg);
    });

    this.client.on('message', (msg: Message) => {
      this.logger.log(`Incoming message from ${msg.from}: ${msg.body}`);
    });

    this.client.initialize();
  }

  async getQrCode(): Promise<string | null> {
    if (this.isReady) return null;
    return this.qrCodeDataUrl;
  }

  async sendMessage(jid: string, message: string) {
    if (!this.isReady) throw new Error('WhatsApp is not ready');
    return this.client.sendMessage(jid, message);
  }

  async getChats() {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    return this.client.getChats();
  }

  async getMessages(chatId: string, limit = 50) {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client.getChatById(chatId);
    return chat.fetchMessages({ limit });
  }
}
