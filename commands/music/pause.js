const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "pause",
    aliases: ["break"],
    description: "Pauses the current Track",
    run: async (client, message, args, prefix) => {
        if(!message.member.voice.channelId) return message.reply("👎 **Please join a Voice-Channel first!**");
        // get an old connection
        const oldConnection = getVoiceConnection(message.guild.id);
        if(!oldConnection) return message.reply("👎 **I'm not connected somewhere!**").catch(() => null);
        if(oldConnection && oldConnection.joinConfig.channelId != message.member.voice.channelId) return message.reply("👎 **We are not in the same Voice-Channel**!").catch(() => null);
        
        const queue = client.queues.get(message.guild.id); // get the queue
        if(!queue) { 
            return message.reply(`👎 **Nothing playing right now**`).catch(() => null);
        }
        // if already paused
        if(queue.paused) return message.reply(`👎 **Track already paused**`).catch(() => null);
        
        queue.paused = true;
        
        // skip the track
        oldConnection.state.subscription.player.pause();
        
        return message.reply(`⏸️ **Successfully paused the Track**`).catch(() => null);
    },
};