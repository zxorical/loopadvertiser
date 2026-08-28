import { Client } from 'discord.js-selfbot-v13';
import express from 'express';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TOKENS = process.env.TOKENS
  ? process.env.TOKENS.split(',').map(t => t.trim())
  : [];

const CHANNEL_ID = '1258415041116508224';

const INVITE = [
  '# AUTOMATICALLY JOIN EVERY GIVEAWAY AND WIN OVER 10 CSTOMS DAILY!!',
  '',
  'discord.gg/untitledtracker'
];

const COOLDOWN = 5.1 * 60 * 1000;

if (TOKENS.length === 0) {
  console.error('Missing TOKENS environment variable or no tokens provided');
  process.exit(1);
}

console.log(`Found ${TOKENS.length} token(s) to use`);

// ---------------------------------------------------------------------------
// Express server for Render health checks
// ---------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('Advertiser running');
});

app.listen(PORT, () => {
  console.log(`Health server listening on port ${PORT}`);
});

// ---------------------------------------------------------------------------
// Discord selfbot
// ---------------------------------------------------------------------------

const createClient = (token, index) => {
  const client = new Client();

  client.once('ready', async () => {
    console.log(
      `[Bot ${index + 1}] Logged in as ${client.user.tag}`
    );

    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel || !channel.isText()) {
        console.error(
          `[Bot ${index + 1}] Channel not found or not a text channel.`
        );
        return;
      }

      const sendInvite = async () => {
        try {
          const message = INVITE.join('\n');

          await channel.send(message);

          console.log(
            `[Bot ${index + 1}] [${new Date().toISOString()}] Invite sent.`
          );
        } catch (err) {
          console.error(
            `[Bot ${index + 1}] Failed to send:`,
            err.message
          );
        }
      };

      // Send immediately
      await sendInvite();

      // Then every 6 minutes
      setInterval(sendInvite, COOLDOWN);

    } catch (err) {
      console.error(
        `[Bot ${index + 1}] Error setting up:`,
        err.message
      );
    }
  });

  client.on('error', (error) => {
    console.error(
      `[Bot ${index + 1}] Client error:`,
      error.message
    );
  });

  client.login(token).catch(err => {
    console.error(
      `[Bot ${index + 1}] Failed to login:`,
      err.message
    );
  });

  return client;
};

// ---------------------------------------------------------------------------
// Create a client for each token
// ---------------------------------------------------------------------------

TOKENS.forEach((token, index) => {
  if (token) {
    createClient(token, index);
  }
});
