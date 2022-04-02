const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "move",
    description: "Moves a Song in the Queue",
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
        if(!args[0] || isNaN(args[0]) || Number(args[0]) < 1 || !args[1] || isNaN(args[1]) || Number(args[1]) < 1)
            return message.reply(`👎 **From where to where shall I move?** Usage: \`${prefix}move <fromPosNr.> <toPosNr.>\``).catch(() => null);
        
        queue.tracks = arrayMove(queue.tracks, args[0], args[1])
        
        return message.reply(`🪣 **Successfully moved the \`${client.queuePos(args[0])} Song\` to \`${client.queuePos(args[1])} Position\` in the Queue.**`).catch(() => null);
    },
};



function arrayMove(array, from, to) {
    try {
      array = [...array];
      const startIndex = from < 0 ? array.length + from : from;
      if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = to < 0 ? array.length + to : to;
        const [item] = array.splice(from, 1);
        array.splice(endIndex, 0, item);
      }
      return array;
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
    }
  }