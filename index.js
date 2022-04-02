const { Client, Intents, Collection, MessageEmbed } = require('discord.js'); //v13
const { getVoiceConnection } = require("@discordjs/voice");
/**
 * TODO:
 * speed Command
 * bassboost Command
 */
const client = new Client({
    shards: "auto",
    allowedMentions: {
      parse: ["roles", "users", /* "everyone" */],
      repliedUser: false, //set true if you want to ping the bot on reply messages
    },
    failIfNotExists: false,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [ 
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});
// Global config file
client.config = require("./config/config.json");

// Create global collection
client.commands = new Collection();
client.slashCommands = new Collection();
client.queues = new Collection();

// load music-util-function
require("./util/musicUtils.js")(client);

// load handler
require("./util/handler.js")(client);

client.login(client.config.token);