const { getVoiceConnection } = require("@discordjs/voice");
const { MessageEmbed } = require("discord.js");
module.exports = {
    name: "queue",
    description: "Show the current Queue-List",
    run: async (client, interaction, args, prefix) => {
        if(!interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"}).catch(() => null);
        // get an old connection
        const oldConnection = getVoiceConnection(interaction.guild.id);
        if(!oldConnection) return interaction.reply({ ephemeral: true, content: "👎 **I'm not connected somewhere!**"}).catch(() => null);
        if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **We are not in the same Voice-Channel**!"}).catch(() => null);
        
        const queue = client.queues.get(interaction.guild.id); // get the queue
        if(!queue || !queue.tracks || !queue.tracks[0]) { 
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing playing right now**`}).catch(() => null);
        }
        const e2n = s => s ? "✅ Enabled" : "❌ Disabled" 
        const song = queue.tracks[0];
        const queueEmbed = new MessageEmbed().setColor("FUCHSIA")
            .setTitle(`First 15 Songs in the Queue`)
            .setDescription(`**CURRENT:** \`0th)\` \`${song.durationFormatted}\` - [${song.title}](${client.getYTLink(song.id)}) - ${song.requester}`)
            .addField("**Track-loop:**", `> ${e2n(queue.trackloop)}`, true)
            .addField("**Queue-loop:**", `> ${e2n(queue.queueloop)}`, true)
            .addField("**Autoplay:**", `> ${e2n(queue.autoplay)}`, true)
            .addFields(
                queue.tracks.slice(1).slice(0, 15).map((track, index) => {
                    return {
                        name: `\`${client.queuePos(index + 1)})\` Track \`${track.durationFormatted}\``,
                        value: `> [${track.title}](${client.getYTLink(track.id)}) - ${track.requester}`,
                        inline: true
                    }
                })
            )
        return interaction.reply({ ephemeral: false, content:`ℹ️ **Currently there are ${queue.tracks.length - 1} Tracks in the Queue**`, embeds: [queueEmbed]}).catch(() => null);
    },
};