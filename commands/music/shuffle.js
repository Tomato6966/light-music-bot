const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "shuffle",
    description: "Shuffles (mixes) the Queue",
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
        queue.tracks = shuffleArray(queue.tracks);
        
        // shuffled the Queue
        return message.reply(`🔀 **Successfully shuffled the Queue.**`).catch(() => null);
    },
};

function shuffleArray(a) {
    let cI = a.length, rI;
    while(cI != 0) {
        rI = Math.floor(Math.random() * cI);
        cI --;
        [a[cI], a[rI]] = [a[rI], a[cI]];
    }
    return a;
}