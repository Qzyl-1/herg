const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const axios = require('axios');

const TOKEN = 'MTMzNTQyMDM2Mjk4ODQ1Mzk0MA.GcYl_F.L1_CAdb-cEAUc7yr7LZEugzbz1hePiORn7N3Ko';
const CLIENT_ID = '1335420362988453940';

if (!TOKEN || !CLIENT_ID) {
  console.error('Token or Client ID missing!');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] });

const commands = [
  new SlashCommandBuilder().setName('help').setDescription('Displays a list of available commands.'),
  new SlashCommandBuilder().setName('meme').setDescription('Sends a random meme.'),
  new SlashCommandBuilder().setName('link').setDescription('Sends a useful link.'),
  new SlashCommandBuilder().setName('quote').setDescription('Sends a random quote.'),
  new SlashCommandBuilder().setName('fact').setDescription('Sends a random interesting fact.'),
  new SlashCommandBuilder().setName('joke').setDescription('Sends a random joke.'),
  new SlashCommandBuilder().setName('roblox-scripting').setDescription('Provides an advanced Roblox scripting tip.'),
  new SlashCommandBuilder().setName('ping').setDescription('Checks bot latency.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Displays user information.'),
  new SlashCommandBuilder().setName('vpn').setDescription('Suggests reliable free VPNs.'),
  new SlashCommandBuilder().setName('proxy').setDescription('Generates random proxy information.'),
  new SlashCommandBuilder().setName('ticket').setDescription('Create a support ticket panel.'),
  new SlashCommandBuilder().setName('play').setDescription('Plays a YouTube video in voice channel.').addStringOption(option => 
    option.setName('url').setDescription('YouTube video URL').setRequired(true)
  )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Starting global command registration...');

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log('Commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Bot is online!`);
});

const activeTickets = new Map();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Help: Available Commands')
      .addFields(
        { name: '/link', value: 'Sends a useful link.' },
        { name: '/meme', value: 'Sends a random meme gif.' },
        { name: '/quote', value: 'Sends a random quote.' },
        { name: '/fact', value: 'Sends a random interesting fact.' },
        { name: '/joke', value: 'Sends a random joke.' },
        { name: '/roblox-scripting', value: 'Gives an advanced Roblox scripting tip.' },
        { name: '/ping', value: 'Checks bot latency.' },
        { name: '/userinfo', value: 'Displays user information.' },
        { name: '/vpn', value: 'Suggests reliable free VPNs.' },
        { name: '/proxy', value: 'Generates random proxy information.' },
        { name: '/ticket create', value: 'Creates a ticket panel for support.' },
        { name: '/play', value: 'Plays a YouTube video in a voice channel.' }
      );
    await interaction.reply({ embeds: [helpEmbed] });
  }

  if (commandName === 'play') {
    const url = interaction.options.getString('url');
    
    if (!ytdl.validateURL(url)) {
      return interaction.reply('Please provide a valid YouTube URL.');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to use this command.');
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      const resource = createAudioResource(stream);
      const player = createAudioPlayer();

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Playing, async () => {
        await interaction.reply(`Now playing: ${url}`);
      });

      player.on('error', async error => {
        console.error('Error:', error);
        await interaction.followUp('There was an error playing the audio.');
      });

    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply('An error occurred while trying to play the audio.');
      }
    }
  }

  if (commandName === 'ticket') {
    if (activeTickets.has(interaction.user.id)) {
      return interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
    }

    const ticketEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Support Ticket Panel')
      .setDescription('Click the button below to create a support ticket.');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [ticketEmbed], components: [row] });
  }

  if (commandName === 'meme') {
    try {
      const response = await axios.get('https://api.reddit.com/r/meme/random');
      const meme = response.data[0].data.children[0].data;
      const memeEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(meme.title)
        .setImage(meme.url)
        .setFooter({ text: 'Enjoy the meme!' });
      await interaction.reply({ embeds: [memeEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('Sorry, I couldn\'t fetch a meme right now!');
    }
  }

  if (commandName === 'link') {
    await interaction.reply('Here is the link: https://rekonise.com/fat-team-require-yy7m6');
  }

  if (commandName === 'quote') {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      const quote = response.data;
      const quoteEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Random Quote')
        .setDescription(`"${quote.content}"`)
        .setFooter({ text: `- ${quote.author}` });
      await interaction.reply({ embeds: [quoteEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('Sorry, I couldn\'t fetch a quote right now!');
    }
  }

  if (commandName === 'fact') {
    try {
      const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = response.data.text;
      await interaction.reply(`Did you know? ${fact}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('Sorry, I couldn\'t fetch a fact right now!');
    }
  }

  if (commandName === 'joke') {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const joke = response.data;
      await interaction.reply(`${joke.setup}\n\n${joke.punchline}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('Sorry, I couldn\'t fetch a joke right now!');
    }
  }

  if (commandName === 'roblox-scripting') {
    await interaction.reply('Here\'s an advanced scripting tip for Roblox: \n- Use `UserInputService` for detecting player input more efficiently, instead of relying on `InputBegan` events in the `LocalScript`.');
  }

  if (commandName === 'ping') {
    await interaction.reply(`Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
  }

  if (commandName === 'userinfo') {
    const user = interaction.user;
    const userInfoEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${user.username}\'s Information`)
      .addFields(
        { name: 'Username', value: user.username },
        { name: 'Tag', value: `#${user.discriminator}` },
        { name: 'ID', value: user.id },
        { name: 'Account Created', value: user.createdAt.toDateString() }
      );
    await interaction.reply({ embeds: [userInfoEmbed] });
  }
});

client.login(TOKEN);
