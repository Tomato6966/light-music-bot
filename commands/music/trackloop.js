const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "trackloop",
    aliases: ["looptrack", "songloop", "loopsong"],
    description: "Toggles the Track-Loop",
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
        if(queue.queueloop) queue.queueloop = false

        // no new songs (and no current)
        queue.trackloop = !queue.trackloop
        // skip the track
        
        return message.reply(`🔁 **Track-Loop is now \`${queue.trackloop ? "Enabled" : "Disabled"}\`**`).catch(() => null);
    },
};