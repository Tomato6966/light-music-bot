const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "volume",
    description: "Changes the Volume of the Music",
    options: [
        {
            name: "volume",
            description: "Then Volume you want to set",
            type: "INTEGER",
            required: true,
        },
    ],
    run: async (client, interaction, args, prefix) => {
        if(!interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"}).catch(() => null);
        // get an old connection
        const oldConnection = getVoiceConnection(interaction.guild.id);
        if(!oldConnection) return interaction.reply({ ephemeral: true, content: "👎 **I'm not connected somewhere!**"})
        if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **We are not in the same Voice-Channel**!"}).catch(() => null);
        
        const queue = client.queues.get(interaction.guild.id); // get the queue
        if(!queue) { 
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing playing right now**`});
        }
        if(!args[0] || isNaN(args[0]) || Number(args[0]) < 1 || Number(args[0]) > 150) return interaction.reply({ ephemeral: true, content: `👎 **No __valid__ Volume between 1 and 100 % provided!** Usage: \`${prefix}volume 25\``}).catch(() => null);
        const volume = Number(args[0]);
        queue.volume = volume;

        // change the volume
        oldConnection.state.subscription.player.state.resource.volume.setVolume(volume / 100);
        
        return interaction.reply({ ephemeral: false, content: `🔊 **Successfully changed the Volume to \`${volume}%\`**`}).catch(() => null);
    },
};