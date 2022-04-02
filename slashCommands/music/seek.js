const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "seek",
    description: "Seeks to a specific Position (sec)",
    options: [
        {
            name: "position",
            description: "To what Time in Seconds you want to seek?",
            type: "INTEGER",
            required: true,
        },
    ],
    run: async (client, interaction, args, prefix) => {
        try {
            if(!interaction.member.voice.channelId) return interaction.reply(({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"})).catch(() => null);
            
            const oldConnection = getVoiceConnection(interaction.guild.id);
            if(!oldConnection) return interaction.reply({ ephemeral: true, content:"👎 **I'm not connected somewhere!**"}).catch(() => null);
            if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content:"👎 **We are not in the same Voice-Channel**!"}).catch(() => null);
            
            const queue = client.queues.get(interaction.guild.id); // get the queue
            if(!queue || !queue.tracks || !queue.tracks[0]) { 
                return interaction.reply({ ephemeral: true, content: `👎 **Nothing playing right now**`}).catch(() => null);
            }

            if(!args[0] || isNaN(args[0])) return interaction.reply({ ephemeral: true, content:`👎 **You forgot to add the seeking-time!** Usage: \`${prefix}seek <Time-In-S>\``}).catch(() => null);
            
            if(Number(args[0]) < 0 || Number(args[0]) > Math.floor(queue.tracks[0].duration / 1000 - 1))
            return interaction.reply({ ephemeral: true, content:`👎 **The Seek-Number-Pos must be between \`0\` and \`${Math.floor(queue.tracks[0].duration / 1000 - 1)}\`!**`}).catch(() => null);
            
            const newPos = Number(args[0]) * 1000;
            // set Filterschanged to true
            queue.filtersChanged = true;
            // seek
            oldConnection.state.subscription.player.stop();
            oldConnection.state.subscription.player.play(client.getResource(queue, queue.tracks[0].id, newPos));
            
            interaction.reply({ ephemeral: true, content:`⏩ **Seeked to \`${client.formatDuration(newPos)}\`**!`}).catch(() => null);
        } catch(e) { 
            console.error(e);
            interaction.reply({ ephemeral: false, content:`❌ Could not join your VC because: \`\`\`${e.interaction || e}`.substring(0, 1950) + `\`\`\``}).catch(() => null);
        }
    },
};