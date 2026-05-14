````markdown
# 🤖 WhatsApp Bot with Baileys

A powerful, feature-rich WhatsApp bot built with **Baileys** that includes advanced protection systems and AI-powered responses.

## ✨ Features

### 🛡️ **Protection Systems**

#### 1. **Anti-Spam** 
- Detects message flooding with configurable limits
- Real-time user tracking
- Three-tier warning system before muting
- Automatic cleanup of old spam data

#### 2. **Anti-Link**
- Blocks HTTP, HTTPS, FTP, and WWW links
- Multiple regex patterns for comprehensive detection
- Prevents phishing and malware distribution
- Works in both private and group chats

#### 3. **Anti-BadWord**
- Customizable bad word filtering
- Case-insensitive matching
- Automatic message deletion
- User notifications on violations

#### 4. **Anti-Delete**
- Tracks all messages for preservation
- Detects deletion attempts
- Maintains message evidence
- Logs with timestamps

### 🧠 **AI Reply System**

- **Multiple AI APIs**: Google Gemini + OpenAI GPT
- **Conversation Memory**: Maintains context across messages
- **Smart Fallbacks**: Natural responses if APIs fail
- **Context-Aware**: Understands and responds based on history
- **Automatic**: Works without commands

### 💬 **Command System**

- `/help` - Display help menu
- `/status` - Check bot status and protections
- `/info` - Bot information
- `/ping` - Verify bot is online
- `/clear` - Clear conversation history
- `/rules` - Display group rules
- `/stats` - View detailed statistics
- `/badword add <word>` - Add bad word (Owner only)
- `/badword remove <word>` - Remove bad word (Owner only)

## 📋 Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **WhatsApp Account**: For authentication
- **Optional APIs**:
  - Google Gemini API key (free tier available)
  - OpenAI API key (for GPT support)

## 🚀 Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/choutewadno41-hue/No-g-le-king.git
cd No-g-le-king
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file and add your configuration:

```env
# Required
BOT_NAME=WhatsApp Bot
BOT_PREFIX=/
BOT_OWNER_NUMBER=1234567890

# Optional AI APIs (at least one recommended)
GOOGLE_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Protection Settings
ANTI_SPAM_ENABLED=true
ANTI_LINK_ENABLED=true
ANTI_BADWORD_ENABLED=true
ANTI_DELETE_ENABLED=true

# Tuning
MAX_MESSAGES_PER_INTERVAL=5
MESSAGE_INTERVAL_MS=10000
SPAM_WARNING_THRESHOLD=3
```

### Step 4: Run Bot
```bash
npm start
```

After running, scan the QR code with your WhatsApp to authenticate.

## 📝 Configuration

### Protection Limits
Adjust these in `.env` to fit your needs:

```env
# Allow max 5 messages per 10 seconds
MAX_MESSAGES_PER_INTERVAL=5
MESSAGE_INTERVAL_MS=10000

# Mute user after 3 spam warnings
SPAM_WARNING_THRESHOLD=3
```

### Enable/Disable Features
```env
ANTI_SPAM_ENABLED=true
ANTI_LINK_ENABLED=true
ANTI_BADWORD_ENABLED=true
ANTI_DELETE_ENABLED=true
```

## 🔑 Getting API Keys

### Google Gemini API (Free)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API key"
3. Copy the key to your `.env` file

### OpenAI API (Paid - $5 free credits)
1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Go to [API Keys](https://platform.openai.com/api-keys)
3. Create new secret key
4. Copy to your `.env` file

## 📂 Project Structure

```
No-g-le-king/
├── index.js                          # Main bot file
├── package.json                      # Dependencies
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── auth/                             # WhatsApp auth files (auto-generated)
└── modules/
    ├── protectionSystem.js           # Anti-spam, anti-link, etc.
    ├── aiReplySystem.js              # AI engine
    └── messageHandler.js             # Commands & routing
```

## 🏗️ Architecture

### ProtectionSystem
Handles all content filtering:
- Spam tracking per user
- Link detection with regex
- Bad word filtering
- Message deletion tracking

### AIReplySystem
Manages AI conversations:
- Multi-API support
- Conversation history
- Context awareness
- Fallback responses

### MessageHandler
Processes commands:
- Command parsing
- Response generation
- Statistics
- Management commands

## 💡 Usage Examples

### In WhatsApp

**Get Help:**
```
/help
```

**Check Status:**
```
/status
```

**Clear History:**
```
/clear
```

**Add Bad Word (Owner):**
```
/badword add prohibited_word
```

**Regular Chat (AI Responds):**
```
Hey bot, what's the weather like?
```

## 🛡️ Protection Examples

### Anti-Spam in Action
```
User sends 6 messages in 10 seconds
→ ⚠️ Message blocked, warning 1/3
User sends 5 more messages
→ ⚠️ Message blocked, warning 2/3
User sends 5 more messages
→ 🚫 User muted (3 warnings)
```

### Anti-Link in Action
```
User: "Check this http://example.com"
→ Message deleted
→ ⚠️ Link detected and blocked
```

### Anti-BadWord in Action
```
User: "This is a badword"
→ Message deleted
→ ⚠️ Inappropriate language detected
```

## 🤖 AI Examples

**Question:**
```
User: "What is machine learning?"
Bot: [Detailed explanation using Google Gemini or OpenAI]
```

**Conversation:**
```
User: "Tell me about AI"
Bot: [Response with context]
User: "How does it work?"
Bot: [Remembers previous message, gives follow-up answer]
```

## 📊 Monitoring

Check bot statistics:
```
/stats
```

Shows:
- Active conversations
- Tracked users
- Warning records
- API status
- Configuration

## ⚙️ Advanced Configuration

### Customize Bad Words List
Edit the bad words array in `modules/protectionSystem.js`:
```javascript
this.badWords = [
  "badword1", 
  "badword2", 
  "custom_word"
];
```

### Add Fallback Responses
In `modules/aiReplySystem.js`:
```javascript
this.fallbackResponses = [
  "Your response here",
  "Another response"
];
```

## 🐛 Troubleshooting

### Bot Not Connecting
- Ensure WhatsApp account isn't logged in elsewhere
- Scan QR code with WhatsApp on same phone
- Check internet connection
- Clear `auth/` folder and restart

### AI Not Responding
- Verify API keys are correctly set in `.env`
- Check API account has credits
- Review server logs for errors
- Try other API (fallback system should activate)

### Messages Not Being Detected
- Ensure bot has read permissions
- Check message type (text, caption, etc.)
- Verify `MESSAGE_INTERVAL_MS` isn't too long
- Review logs with `DEBUG_MODE=true`

## 🔐 Security

### Best Practices
- ✅ Use environment variables for secrets
- ✅ Keep `.env` file out of git (in .gitignore)
- ✅ Don't share API keys
- ✅ Use strong, unique passwords
- ✅ Keep dependencies updated
- ✅ Review logs regularly

### Sensitive Data
Never commit:
- `.env` file with API keys
- WhatsApp auth credentials
- Personal phone numbers
- API keys or secrets

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| @whiskeysockets/baileys | WhatsApp Web API |
| dotenv | Environment variables |
| axios | HTTP requests |
| google-generative-ai | Google Gemini API |
| openai | OpenAI API |
| pino | Logging |
| nodemon | Development (auto-reload) |

## 🚀 Deployment

### Local Deployment
```bash
npm install
npm start
```

### Cloud Deployment (Heroku)

1. Create `Procfile`:
```
worker: npm start
```

2. Deploy:
```bash
heroku create your-app-name
heroku config:set BOT_OWNER_NUMBER=1234567890
heroku config:set GOOGLE_API_KEY=your_key
git push heroku main
```

### Docker Deployment

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

2. Build and run:
```bash
docker build -t whatsapp-bot .
docker run whatsapp-bot
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📞 Support

For issues and questions:
1. Check [GitHub Issues](https://github.com/choutewadno41-hue/No-g-le-king/issues)
2. Review documentation
3. Check troubleshooting section
4. Create new issue with details

## 🎯 Roadmap

- [ ] Database integration (MongoDB/Firebase)
- [ ] User preferences system
- [ ] Custom welcome messages
- [ ] Automated group moderation
- [ ] Rich media handling
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Advanced analytics

## ⭐ Credits

- **Baileys**: WhatsApp Web API reverse engineering
- **Google Gemini**: AI responses
- **OpenAI**: Alternative AI engine

## ⚖️ Disclaimer

This bot is for educational purposes. Ensure compliance with:
- WhatsApp Terms of Service
- Local laws and regulations
- Group chat rules
- Privacy regulations

---

**Made with ❤️ by choutewadno41-hue**

If you find this useful, please give it a ⭐ star!
````
