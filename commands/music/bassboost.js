const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "bassboost",
    aliases: ["bass", "bb"],
    description: "Changes the Bassboost Level of the Music",
    run: async (client, message, args, prefix) => {
        if(!message.member.voice.channelId) return message.reply("👎 **Please join a Voice-Channel first!**").catch(() => null);
        // get an old connection
        const oldConnection = getVoiceConnection(message.guild.id);
        if(!oldConnection) return message.reply("👎 **I'm not connected somewhere!**")
        if(oldConnection && oldConnection.joinConfig.channelId != message.member.voice.channelId) return message.reply("👎 **We are not in the same Voice-Channel**!").catch(() => null);
        
        const queue = client.queues.get(message.guild.id); // get the queue
        if(!queue) { 
            return message.reply(`👎 **Nothing playing right now**`);
        }
        if(args[0] === undefined || isNaN(args[0]) || Number(args[0]) < 0 || Number(args[0]) > 20) return message.reply(`👎 **No __valid__ Bassboost-Level between 0 and 20 db provided!** Usage: \`${prefix}bassboost 6\``).catch(() => null);
        const bassboost = Number(args[0]);
        queue.effects.bassboost = bassboost;

        // change the Basslevel
        queue.filtersChanged = true;
        const curPos = oldConnection.state.subscription.player.state.resource.playbackDuration;
        oldConnection.state.subscription.player.stop();
        oldConnection.state.subscription.player.play(client.getResource(queue, queue.tracks[0].id, curPos));
    
        return message.reply(`🎚 **Successfully changed the Bassboost-Level to \`${bassboost}db\`**`).catch(() => null);
    },
};