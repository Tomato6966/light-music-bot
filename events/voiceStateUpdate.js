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
    if (
        (!oldState.streaming === false && newState.streaming === true)   ||
        (oldState.streaming === true && !newState.streaming === false)   ||
        (!oldState.serverDeaf === false && newState.serverDeaf === true) ||
        (oldState.serverDeaf === true && !newState.serverDeaf === false) ||
        (!oldState.serverMute === false && newState.serverMute === true) ||
        (oldState.serverMute === true && !newState.serverMute === false) || 
        (!oldState.selfDeaf === false && newState.selfDeaf === true)     ||
        (oldState.selfDeaf === true && !newState.selfDeaf === false)     ||
        (!oldState.selfMute === false && newState.selfMute === true)     ||
        (oldState.selfMute === true && !newState.selfMute === false)     ||
        (!oldState.selfVideo === false && newState.selfVideo === true)   ||
        (oldState.selfVideo === true && !newState.selfVideo === false) 
     ) return;
    // Destroy connection if channel gets emtpy
    if (!oldState.channelId && newState.channelId) {
        return;
    }
    if (oldState.channelId && !newState.channelId) {
        const connection = getVoiceConnection(newState.guild.id);
        if(oldState.channel.members.filter(m => !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf).size > 1) return;
        if(connection && connection.joinConfig.channelId == oldState.channelId) connection.destroy();
        return;
    }
    if (oldState.channelId && newState.channelId) {
        const connection = getVoiceConnection(newState.guild.id);
        if(oldState.channel.members.filter(m => !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf).size > 1) return;
        if(connection && connection.joinConfig.channelId == oldState.channelId) connection.destroy();
        return;
    }
}