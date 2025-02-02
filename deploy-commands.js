const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = 'MTMzNTQyMDM2Mjk4ODQ1Mzk0MA.GwHvxo.02iHzg0yPDfI1ebmsQyGEdGTcRgJZROFv9ps6E';
const CLIENT_ID = '1335420362988453940'; // ID del tuo bot

const commands = [
  {
    name: 'help',
    description: 'Displays a list of available commands.',
  },
  {
    name: 'meme',
    description: 'Sends a random meme from Reddit.',
  },
  {
    name: 'quote',
    description: 'Sends a random quote.',
  },
  {
    name: 'fact',
    description: 'Sends a random fact.',
  },
  {
    name: 'joke',
    description: 'Sends a random joke.',
  },
  {
    name: 'roblox-scripting',
    description: 'Provides an advanced scripting tip for Roblox.',
  },
  {
    name: 'ping',
    description: 'Checks the bot latency.',
  },
  {
    name: 'userinfo',
    description: 'Displays user information.',
  }
];

// Registra i comandi globalmente
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Comandi registrati globalmente
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Restante codice per il bot
client.once('ready', () => {
  console.log('Bot is online!');
});

client.login(TOKEN);
