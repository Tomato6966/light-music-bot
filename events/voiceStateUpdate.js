const { Permissions } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice")
module.exports = async (client, oldState, newState) => {
    // Stage Channel self suspress
    if(newState.id == client.user.id && newState.channelId && newState.channel.type == "GUILD_STAGE_VOICE" && newState.suppress) {
        if(newState.channel?.permissionsFor(newState.guild.me)?.has(Permissions.FLAGS.MUTE_MEMBERS)) {
            await newState.guild.me.voice.setSuppressed(false).catch(() => null);
        } 
    }
    
    if(newState.id == client.user.id) return;

    // Destroy connection if channel gets emtpy
    function stateChange(one, two) {
        if(one === false && two === true || one === true && two === false) return true;
        else return false;
    }
    const o = oldState, n = newState;
    if(stateChange(o.streaming, n.streaming) ||
      stateChange(o.serverDeaf, n.serverDeaf) ||
      stateChange(o.serverMute, n.serverMute) ||
      stateChange(o.selfDeaf, n.selfDeaf) ||
      stateChange(o.selfMute, n.selfMute) ||
      stateChange(o.selfVideo, n.selfVideo) ||
      stateChange(o.suppress, n.suppress)) return;
    // channel joins
    if(!o.channelId && n.channelId) {
        return;
    }
    // channel leaves
    if(!n.channelId && o.channelId || n.channelId && o.channelId) {
        const connection = getVoiceConnection(n.guild.id);
        if(o.channel.members.filter(m => !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf).size >= 1) return;
        if(connection && connection.joinConfig.channelId == o.channelId) connection.destroy();
        return;
    }
}
