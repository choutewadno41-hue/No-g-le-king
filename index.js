const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ProtectionSystem = require('./modules/protectionSystem');
const AIReplySystem = require('./modules/aiReplySystem');
const MessageHandler = require('./modules/messageHandler');

const logger = pino();

class WhatsAppBot {
  constructor() {
    this.sock = null;
    this.protectionSystem = new ProtectionSystem();
    this.aiReplySystem = new AIReplySystem();
    this.messageHandler = null;
    this.authPath = path.join(__dirname, 'auth');
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing WhatsApp Bot...');

      // Create auth directory if not exists
      if (!fs.existsSync(this.authPath)) {
        fs.mkdirSync(this.authPath);
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: process.env.LOG_LEVEL || 'silent' }),
        browser: ['WhatsApp Bot', 'Chrome', '120.0']
      });

      this.messageHandler = new MessageHandler(
        this.sock,
        this.protectionSystem,
        this.aiReplySystem
      );

      // Save credentials
      this.sock.ev.on('creds.update', saveCreds);

      // Connection updates
      this.sock.ev.on('connection.update', (update) => {
        this.handleConnectionUpdate(update);
      });

      // Message events
      this.sock.ev.on('messages.upsert', (m) => {
        this.handleMessageUpsert(m);
      });

      logger.info('✅ Bot initialized successfully');
    } catch (error) {
      logger.error('❌ Initialization error:', error);
      process.exit(1);
    }
  }

  handleConnectionUpdate(update) {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        logger.warn('⚠️ Connection closed, reconnecting...');
        this.initialize();
      } else {
        logger.info('❌ Device logged out');
      }
    } else if (connection === 'open') {
      logger.info('✅ Bot connected successfully!');
      this.sendStartupMessage();
    }

    if (update.qr) {
      logger.info('📱 Scan the QR code below with your WhatsApp:');
      qrcode.generate(update.qr, { small: true });
    }
  }

  async handleMessageUpsert(m) {
    if (!m.messages) return;

    for (const message of m.messages) {
      try {
        if (message.key.fromMe) continue;

        const sender = message.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        
        // Extract text content
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    message.message?.imageMessage?.caption || '';

        if (!text) continue;

        logger.info(`📨 Message from ${sender}: ${text.substring(0, 50)}`);

        // Check for deletion
        if (this.protectionSystem.checkDeletion(message)) {
          const warning = '⚠️ Message deletion detected and blocked.';
          await this.sock.sendMessage(sender, { text: warning });
          continue;
        }

        // Track message for anti-delete
        this.protectionSystem.trackMessage(
          message.key.id,
          sender,
          text,
          Date.now()
        );

        // Check spam
        const spamResult = this.protectionSystem.checkSpam(sender);
        if (spamResult === 'muted') {
          logger.warn(`🔇 Muted user attempted to send message: ${sender}`);
          continue;
        }

        if (spamResult?.startsWith('warning')) {
          const warningNum = spamResult.split('_')[1];
          const response = `⚠️ Stop spamming! Warning ${warningNum}/${this.protectionSystem.config.spamWarningThreshold}`;
          await this.sock.sendMessage(sender, { text: response });
          this.protectionSystem.stats.messagesBlocked++;
          continue;
        }

        // Check for links
        if (this.protectionSystem.checkLinks(text)) {
          try {
            await this.sock.sendMessage(sender, { 
              text: '🔗 Links are not allowed in this group!' 
            });
          } catch (e) {
            logger.warn('Could not send link warning');
          }
          continue;
        }

        // Check for bad words
        if (this.protectionSystem.checkBadwords(text)) {
          try {
            await this.sock.sendMessage(sender, { 
              text: '🤐 Inappropriate language detected!' 
            });
          } catch (e) {
            logger.warn('Could not send badword warning');
          }
          continue;
        }

        // Handle commands
        if (text.startsWith(this.messageHandler.prefix)) {
          await this.messageHandler.handleCommand(text, sender, message);
          continue;
        }

        // Send AI reply
        const reply = await this.aiReplySystem.getReply(sender, text);
        if (reply) {
          await this.sock.sendMessage(sender, { text: reply });
        }

      } catch (error) {
        logger.error('Error processing message:', error);
      }
    }
  }

  async sendStartupMessage() {
    try {
      const ownerNumber = process.env.BOT_OWNER_NUMBER;
      if (ownerNumber) {
        const message = `
✅ Bot Started Successfully!

🤖 Bot Name: ${process.env.BOT_NAME || 'WhatsApp Bot'}
📍 Status: Online

🛡️ Protection Features:
✅ Anti-Spam
✅ Anti-Link
✅ Anti-BadWord
✅ Anti-Delete
✅ AI Reply

Use ${this.messageHandler?.prefix || '/'}help for commands

Powered by Baileys ⚡
        `.trim();

        await this.sock.sendMessage(ownerNumber, { text: message });
      }
    } catch (error) {
      logger.warn('Could not send startup message:', error.message);
    }
  }
}

// Main execution
async function main() {
  const bot = new WhatsAppBot();
  await bot.initialize();

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('👋 Bot shutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('👋 Bot shutting down (SIGTERM)...');
    process.exit(0);
  });
}

main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

module.exports = WhatsAppBot;
