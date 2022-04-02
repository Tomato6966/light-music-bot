const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "leave",
    description: "Leaves a Voice Channel and stops playing",
    run: async (client, interaction, args, prefix) => {
        try {
            if(!interaction.member.voice.channelId) return interaction.reply(({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"})).catch(() => null);
            
            const oldConnection = getVoiceConnection(interaction.guild.id);
            if(!oldConnection) return interaction.reply({ ephemeral: true, content:"👎 **I'm not connected somewhere!**"}).catch(() => null);
            if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content:"👎 **We are not in the same Voice-Channel**!"}).catch(() => null);
        
            await client.leaveVoiceChannel(interaction.member.voice.channel);
            
            interaction.reply({ ephemeral: false, content:"👍 Left your VC!"}).catch(() => null);
        } catch(e) { 
            console.error(e);
            interaction.reply({ ephemeral: true, content:`❌ Could not join your VC because: \`\`\`${e.interaction || e}`.substring(0, 1950) + `\`\`\``}).catch(() => null);
        }
    },
};