import { Client } from 'discord.js-selfbot-v13';
import express from 'express';

// ---------------------------------------------------------------------------
// Configuration (set in Render)
// ---------------------------------------------------------------------------
const TOKEN = process.env.TOKEN;               // your selfbot token
const CHANNEL_ID = '1258415041116508224';       // fixed channel
const INVITE = 'https://discord.gg/vzYvj5JsxJ'; // your invite
const COOLDOWN = 6 * 60 * 1000;                // 5 minutes

if (!TOKEN) {
  console.error('Missing TOKEN environment variable');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Express server for Render health checks
// ---------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('Advertiser running'));

app.listen(PORT, () => {
  console.log(`Health server listening on port ${PORT}`);
});

// ---------------------------------------------------------------------------
// Discord selfbot
// ---------------------------------------------------------------------------
const client = new Client();

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !channel.isText()) {
    console.error('Channel not found or not a text channel.');
    process.exit(1);
  }

  const sendInvite = async () => {
    try {
      await channel.send(INVITE);
      console.log(`[${new Date().toISOString()}] Invite sent.`);
    } catch (err) {
      console.error('Failed to send:', err.message);
    }
  };

  // Send first invite immediately, then every 5 minutes
  await sendInvite();
  setInterval(sendInvite, COOLDOWN);
});

client.login(TOKEN);
