const pino = require('pino');
const logger = pino();

class MessageHandler {
  constructor(sock, protectionSystem, aiReplySystem) {
    this.sock = sock;
    this.protectionSystem = protectionSystem;
    this.aiReplySystem = aiReplySystem;
    this.prefix = process.env.BOT_PREFIX || '/';
    this.ownerNumber = process.env.BOT_OWNER_NUMBER;
  }

  async handleCommand(text, sender, message) {
    try {
      const args = text.split(' ');
      const command = args[0].toLowerCase().substring(this.prefix.length);

      logger.info(`📝 Command received: ${command} from ${sender}`);

      switch (command) {
        case 'help':
          await this.handleHelp(sender);
          break;
        case 'status':
          await this.handleStatus(sender);
          break;
        case 'info':
          await this.handleInfo(sender);
          break;
        case 'ping':
          await this.handlePing(sender);
          break;
        case 'clear':
          await this.handleClear(sender);
          break;
        case 'stats':
          await this.handleStats(sender);
          break;
        case 'badword':
          await this.handleBadwordCommand(args, sender);
          break;
        case 'rules':
          await this.handleRules(sender);
          break;
        default:
          await this.sock.sendMessage(sender, {
            text: `❌ Unknown command: ${command}\n\nUse ${this.prefix}help for available commands.`
          });
      }
    } catch (error) {
      logger.error('Error handling command:', error);
      await this.sock.sendMessage(sender, {
        text: '❌ An error occurred while processing your command.'
      });
    }
  }

  async handleHelp(sender) {
    const helpText = `
╔════════════════════════════════════╗
║        🤖 Bot Commands Help        ║
╠════════════════════════════════════╣
║                                    ║
║ ${this.prefix}help   - Show this help menu        ║
║ ${this.prefix}status - Bot status & protections ║
║ ${this.prefix}ping   - Check if bot is online   ║
║ ${this.prefix}info   - Bot information         ║
║ ${this.prefix}stats  - View bot statistics     ║
║ ${this.prefix}clear  - Clear chat history      ║
║ ${this.prefix}rules  - Display group rules     ║
║ ${this.prefix}badword add <word> - Add badword ║
║ ${this.prefix}badword remove <word> - Remove   ║
║                                    ║
╠════════════════════════════════════╣
║ 🛡️  Protection Features            ║
╠════════════════════════════════════╣
║ ✅ Anti-Spam Protection            ║
║ ✅ Anti-Link Detection             ║
║ ✅ Anti-Badword Filtering          ║
║ ✅ Anti-Delete Tracking            ║
║ ✅ AI-Powered Replies              ║
║                                    ║
╚════════════════════════════════════╝
    `;

    await this.sock.sendMessage(sender, { text: helpText });
  }

  async handleStatus(sender) {
    const protectionStats = this.protectionSystem.getStats();
    const aiStatus = this.aiReplySystem.getStatus();
    const uptime = this.formatUptime(process.uptime());

    const statusText = `
╔════════════════════════════════════╗
║       ✅ Bot Status Report         ║
╠════════════════════════════════════╣
║ Status: ONLINE ✅                  ║
║ Uptime: ${uptime.padEnd(28)}║
║ Bot Name: ${(process.env.BOT_NAME || 'WhatsApp Bot').padEnd(23)}║
╠════════════════════════════════════╣
║ 🛡️  Protection Status              ║
╠════════════════════════════════════╣
║ Anti-Spam: ${(protectionStats.features.antiSpam ? '✅' : '❌').padEnd(30)}║
║ Anti-Link: ${(protectionStats.features.antiLink ? '✅' : '❌').padEnd(30)}║
║ Anti-BadWord: ${(protectionStats.features.antiBadword ? '✅' : '❌').padEnd(28)}║
║ Anti-Delete: ${(protectionStats.features.antiDelete ? '✅' : '❌').padEnd(28)}║
║ Tracked Users: ${protectionStats.trackedUsers.toString().padEnd(25)}║
║ Bad Words: ${protectionStats.badWords.toString().padEnd(27)}║
╠════════════════════════════════════╣
║ 🧠 AI Status                       ║
╠════════════════════════════════════╣
║ Google Gemini: ${(aiStatus.googleGemini ? '✅' : '❌').padEnd(21)}║
║ OpenAI GPT: ${(aiStatus.openai ? '✅' : '❌').padEnd(23)}║
║ Active Conversations: ${aiStatus.activeConversations.toString().padEnd(15)}║
╚════════════════════════════════════╝
    `;

    await this.sock.sendMessage(sender, { text: statusText });
  }

  async handlePing(sender) {
    const startTime = Date.now();
    const message = await this.sock.sendMessage(sender, { text: '🏓 Pong!' });
    const latency = Date.now() - startTime;

    await this.sock.sendMessage(sender, { 
      text: `✅ Bot is online!\n⏱️ Latency: ${latency}ms` 
    });
  }

  async handleInfo(sender) {
    const infoText = `
╔════════════════════════════════════╗
║        ℹ️  Bot Information        ║
╠════════════════════════════════════╣
║ Name: ${(process.env.BOT_NAME || 'WhatsApp Bot').padEnd(26)}║
║ Version: 1.0.0                     ║
║ Author: choutewadno41-hue          ║
║ Platform: Baileys WhatsApp API     ║
║ Language: JavaScript (Node.js)     ║
║                                    ║
║ Features:                          ║
║ • Anti-Spam Protection             ║
║ • Anti-Link Detection              ║
║ • Anti-BadWord Filtering           ║
║ • Anti-Delete Tracking             ║
║ • AI-Powered Conversations         ║
║ • Multi-API Support                ║
║                                    ║
║ Powered by:                        ║
║ • Baileys (WhatsApp Web)           ║
║ • Google Gemini API                ║
║ • OpenAI GPT                       ║
║                                    ║
╚════════════════════════════════════╝
    `;

    await this.sock.sendMessage(sender, { text: infoText });
  }

  async handleClear(sender) {
    this.aiReplySystem.clearHistory(sender);
    await this.sock.sendMessage(sender, { 
      text: '✅ Conversation history cleared!' 
    });
  }

  async handleStats(sender) {
    const protectionStats = this.protectionSystem.getStats();
    const aiStatus = this.aiReplySystem.getStatus();

    const statsText = `
╔════════════════════════════════════╗
║          📊 Bot Statistics         ║
╠════════════════════════════════════╣
║ Protection Tracking:               ║
║  • Tracked Users: ${protectionStats.trackedUsers.toString().padEnd(20)}║
║  • Active Warnings: ${protectionStats.warningsIssued.toString().padEnd(18)}║
║  • Muted Users: ${protectionStats.mutedUsers.toString().padEnd(20)}║
║  • Bad Words List: ${protectionStats.badWords.toString().padEnd(19)}║
║                                    ║
║ AI System:                         ║
║  • Active Chats: ${aiStatus.activeConversations.toString().padEnd(20)}║
║  • Max History: ${aiStatus.maxHistoryLength.toString().padEnd(21)}║
║  • Gemini API: ${(aiStatus.googleGemini ? 'Active' : 'Inactive').padEnd(23)}║
║  • OpenAI API: ${(aiStatus.openai ? 'Active' : 'Inactive').padEnd(23)}║
║                                    ║
║ System:                            ║
║  • Uptime: ${this.formatUptime(process.uptime()).padEnd(25)}║
║  • Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB  ║
║                                    ║
╚════════════════════════════════════╝
    `;

    await this.sock.sendMessage(sender, { text: statsText });
  }

  async handleRules(sender) {
    const rulesText = `
╔════════════════════════════════════╗
║         📜 Group Rules             ║
╠════════════════════════════════════╣
║                                    ║
║ 🚫 PROHIBITED:                     ║
║  • Spam messages                   ║
║  • Malicious links                 ║
║  • Inappropriate language          ║
║  • Message deletion                ║
║  • Flood attacks                   ║
║                                    ║
║ ✅ RECOMMENDED:                    ║
║  • Be respectful                   ║
║  • Keep messages relevant          ║
║  • Use appropriate language        ║
║  • Follow group topic              ║
║  • Help other members              ║
║                                    ║
║ ⚠️  CONSEQUENCES:                  ║
║  • 1st Violation: Warning          ║
║  • 2nd Violation: Warning          ║
║  • 3rd Violation: Mute             ║
║  • Repeated: Removal               ║
║                                    ║
║ 📞 For issues, contact admin       ║
║                                    ║
╚════════════════════════════════════╝
    `;

    await this.sock.sendMessage(sender, { text: rulesText });
  }

  async handleBadwordCommand(args, sender) {
    if (sender !== this.ownerNumber && !sender.includes(this.ownerNumber)) {
      await this.sock.sendMessage(sender, { 
        text: '❌ Only the bot owner can modify bad words.' 
      });
      return;
    }

    const action = args[1]?.toLowerCase();
    const word = args.slice(2).join(' ');

    if (action === 'add') {
      if (!word) {
        await this.sock.sendMessage(sender, { 
          text: '❌ Please provide a word to add.' 
        });
        return;
      }

      const added = this.protectionSystem.addBadword(word);
      const message = added 
        ? `✅ Bad word "${word}" added successfully.`
        : `⚠️ Bad word "${word}" already exists.`;

      await this.sock.sendMessage(sender, { text: message });
    } 
    else if (action === 'remove') {
      if (!word) {
        await this.sock.sendMessage(sender, { 
          text: '❌ Please provide a word to remove.' 
        });
        return;
      }

      const removed = this.protectionSystem.removeBadword(word);
      const message = removed 
        ? `✅ Bad word "${word}" removed successfully.`
        : `⚠️ Bad word "${word}" not found.`;

      await this.sock.sendMessage(sender, { text: message });
    }
    else {
      await this.sock.sendMessage(sender, { 
        text: `Usage:\n${this.prefix}badword add <word>\n${this.prefix}badword remove <word>` 
      });
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

module.exports = MessageHandler;
