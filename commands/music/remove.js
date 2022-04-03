const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "remove",
    aliases: ["delete"],
    description: "Removes a specific Track from the Queue",
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
        // no new songs (and no current)
        if(!queue.tracks || queue.tracks.length <= 1) { 
            return message.reply(`👎 **Nothing to skip**`).catch(() => null);
        }
        if(!args[0] || isNaN(args[0]) || Number(args[0]) > queue.tracks.length)
            return message.reply({ content: `👎 **There are just ${queue.tracks.length} Songs in the Queue, can't remove the ${!isNaN(args[0]) ? client.queuePos(Number(args[0])) : args[0]} Song.**`})
        
        queue.skipped = true;

        queue.tracks.splice(args[0], 1)
        
        return message.reply(`⏭️ **Successfully removed the ${client.queuePos(Number(args[0]))} Track!**`).catch(() => null);
    },
};