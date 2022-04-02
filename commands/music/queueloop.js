const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "queueloop",
    aliases: ["loopqueue", "qloop", "queuloop"],
    description: "Toggles the Queue-Loop",
    run: async (client, message, args, prefix) => {
        if(!message.member.voice.channelId) return message.reply("👎 **Please join a Voice-Channel first!**").catch(() => null);
        // get an old connection
        const oldConnection = getVoiceConnection(message.guild.id);
        if(!oldConnection) return message.reply("👎 **I'm not connected somewhere!**").catch(() => null);
        if(oldConnection && oldConnection.joinConfig.channelId != message.member.voice.channelId) return message.reply("👎 **We are not in the same Voice-Channel**!").catch(() => null);
        
        const queue = client.queues.get(message.guild.id); // get the queue
        if(!queue) { 
            return message.reply(`👎 **Nothing playing right now**`).catch(() => null);
        }
        if(queue.trackloop) queue.trackloop = false

        // no new songs (and no current)
        queue.queueloop = !queue.queueloop
        // skip the track
        
        return message.reply(`🔂 **Queue-Loop is now \`${queue.queueloop ? "Enabled" : "Disabled"}\`**`).catch(() => null);
    },
};