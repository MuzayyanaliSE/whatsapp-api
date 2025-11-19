import { Injectable, Logger } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';

@Injectable()
export class WhatsappwService {
  private client: Client | null = null;
  private qrCodeDataUrl: string | null = null;
  private isReady = false;
  private initStarted = false; // prevent multiple initializations

  private readonly logger = new Logger(WhatsappwService.name);

  private initializeClient() {
    if (this.initStarted) return; // avoid re-init
    this.initStarted = true;

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
      this.qrCodeDataUrl = null; // clear QR after ready
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error('AUTH ERROR: ' + msg);
      this.isReady = false;
      this.initStarted = false; // allow retry
    });

    this.client.on('message', (msg: Message) => {
      this.logger.log(`Incoming message from ${msg.from}: ${msg.body}`);
    });

    this.client.initialize();
  }

  // ⬇️ FIXED VERSION
  async getQrCode(timeoutMs = 15000): Promise<string | null> {
    // If already logged in, no QR is needed
    if (this.isReady) {
      return null;
    }

    // Lazily initialize the client ONLY when API is called
    if (!this.client) {
      this.initializeClient();
    }

    const start = Date.now();

    // Wait for qrCodeDataUrl to be filled by the 'qr' event (up to timeoutMs)
    while (!this.qrCodeDataUrl && Date.now() - start < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // check every 500ms
    }

    // After waiting, either we have the QR or not
    return this.qrCodeDataUrl;
  }

  async sendMessage(jid: string, message: string) {
    if (!this.isReady) {
      throw new Error('WhatsApp is not ready (not authenticated yet)');
    }
    return this.client!.sendMessage(jid, message);
  }

  async getChats() {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    return this.client!.getChats();
  }

  async getMessages(chatId: string, limit = 50) {
    if (!this.isReady) throw new Error('WhatsApp not ready');
    const chat = await this.client!.getChatById(chatId);
    return chat.fetchMessages({ limit });
  }
}
