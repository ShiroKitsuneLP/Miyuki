<div align="center">
    <img src="https://emojicdn.elk.sh/🦊" width="80" />
    <h1>❄️ Miyuki – The Fox Spirit Bot ❄️</h1>
    <b>A magical fox maiden for your Discord server!</b>
    <br />
    <br />
    <i>One fox maiden split across two forms:<br />
    Her public self greets the world with a wagging tail,<br />
    while her secret self watches over the server from the shadows.</i>
</div>

<h2 align="center">✨ Features ✨</h2>

### 🤗 Action Commands
- Hug, pat, kiss, bite, slap and more – spread the fox love!
- Fun, interactive, and anime-inspired

### 🛡️ Moderation
- Advanced warn system with automatic cleanup (old warnings vanish like fox tracks in the snow)
- Automatic cleanup of old warnings (180 days)

### 🧰 Utility
- /help: See all commands
- /ping: Check bot latency


<h2 align="center">📦 Requirements</h2>

- [Node.js](https://nodejs.org/) v22 or higher
- [npm](https://www.npmjs.com/get-npm) v11 or higher

**npm packages:**
- `discord.js`
- `better-sqlite3`


<h2 align="center">🚀 Getting Started</h2>

```powershell
git clone https://github.com/ShiroKitsuneLP/Miyuki.git
cd Miyuki
npm install
```

1. Create your `config.json` in the `src/config` folder (see below).
2. Setup better-sqlite3 Database with the following command:
   ```powershell
   npm run database:setup
   ```
3. Deploy the commands:
   ```powershell
   npm run deploy:guild
   npm run deploy:admin
   ```
4. Start the bot:
     ```powershell
     npm run start
     ```

<h2 align="center">⚙️ Configuration</h2>

**src/config/config.json**
```json
{
    "ownerIds": [
        "YOUR_ID"
    ],
    "mainBot": {
        "token": "YOUR_BOT_TOKEN",
        "clientId": "YOUR_CLIENT_ID",
        "guildId": "YOUR_GUILD_ID"
    },
    "adminBot": {
        "token": "YOUR_ADMIN_BOT_TOKEN",
        "clientId": "YOUR_ADMIN_CLIENT_ID",
        "guildId": "YOUR_ADMIN_GUILD_ID"
    },
    "links": {
        "invite": "YOUR_BOT_INVITE_LINK",
        "supportServer": "YOUR_SUPPORT_SERVER_LINK",
        "website": "YOUR_WEBSITE_LINK"
    }
}
```

<h2 align="center">🗃️ Database</h2>

- Uses [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- Database file: `src/data/miyuki.db`

<h2 align="center">🤝 Contributing</h2>

Pull requests and issues are welcome! Let your creativity run wild – foxes love clever ideas.

---

<div align="center">
    Made with ❤️ and fox magic by ShiroKitsune
</div>