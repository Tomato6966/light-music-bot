const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "pause",
    description: "Pauses the current Track",
    run: async (client, interaction, args, prefix) => {
        if(!interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"});
        // get an old connection
        const oldConnection = getVoiceConnection(interaction.guild.id);
        if(!oldConnection) return interaction.reply({ ephemeral: true, content: "👎 **I'm not connected somewhere!**"}).catch(() => null);
        if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **We are not in the same Voice-Channel**!"}).catch(() => null);
        
        const queue = client.queues.get(interaction.guild.id); // get the queue
        if(!queue) { 
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing playing right now**`}).catch(() => null);
        }
        // if already paused
        if(queue.paused) return interaction.reply({ ephemeral: true, content: `👎 **Track already paused**`}).catch(() => null);
        
        queue.paused = true;
        
        // skip the track
        oldConnection.state.subscription.player.pause();
        
        return interaction.reply({ ephemeral: false, content: `⏸️ **Successfully paused the Track**`}).catch(() => null);
    },
};