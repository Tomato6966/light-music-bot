const { Permissions } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice")
module.exports = async (client, oldState, newState) => {
    if (newState.channelId && newState.channel.type == "GUILD_STAGE_VOICE" && newState.guild.me.voice.suppress) {
        try {
            if(newState.channel?.permissionsFor(newState.guild?.me)?.has(Permissions.FLAGS.SPEAK))
                await newState.guild.me.voice.setSuppressed(false).catch(console.warn);
            else console.log("SHHHH")
        } catch (e) {
            console.log(e)
        }
    }
    function stateChange(one, two) {
        if(one === false && two === true || one === true && two === false) return true;
        else return false;
    }
    const o = oldState;
    const n = newState; 
    if (stateChange(o.streaming, n.streaming) || 
      stateChange(o.serverDeaf, n.serverDeaf) || 
      stateChange(o.serverMute, n.serverMute) || 
      stateChange(o.selfDeaf, n.selfDeaf) || 
      stateChange(o.selfMute, n.selfMute) || 
      stateChange(o.selfVideo, n.selfVideo)) return;
    // Destroy connection if channel gets emtpy
    // new Channel joined
    if (!o.channelId && n.channelId) {
        return;
    }
    // channel left
    if (o.channelId && !n.channelId) {
        const connection = getVoiceConnection(n.guild.id);
        if(o.channel.members.filter(m => !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf).size > 1) return;
        if(connection && connection.joinConfig.channelId == o.channelId) connection.destroy();
        return;
    }
    // channel swapped - register a LEAVE
    if (o.channelId && n.channelId) {
        const connection = getVoiceConnection(n.guild.id);
        if(o.channel.members.filter(m => !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf).size > 1) return;
        if(connection && connection.joinConfig.channelId == o.channelId) connection.destroy();
        return;
    }
}
