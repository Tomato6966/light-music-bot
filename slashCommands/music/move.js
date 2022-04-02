const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    name: "move",
    description: "Moves a Song in the Queue",
    options: [
        {
            name: "from",
            description: "From Position to move",
            type: "INTEGER",
            required: true,
        },
        {
            name: "to",
            description: "New Position to move it to",
            type: "INTEGER",
            required: true,
        },
    ],
    run: async (client, interaction, args, prefix) => {
        if(!interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"}).catch(() => null);
        // get an old connection
        const oldConnection = getVoiceConnection(interaction.guild.id);
        if(!oldConnection) return interaction.reply({ ephemeral: true, content: "👎 **I'm not connected somewhere!**"}).catch(() => null);
        if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: "👎 **We are not in the same Voice-Channel**!"}).catch(() => null);
        
        const queue = client.queues.get(interaction.guild.id); // get the queue
        if(!queue) { 
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing playing right now**`}).catch(() => null);
        }
        if(!args[0] || isNaN(args[0]) || Number(args[0]) < 1 || !args[1] || isNaN(args[1]) || Number(args[1]) < 1)
            return interaction.reply({ ephemeral: true, content: `👎 **From where to where shall I move?** Usage: \`${prefix}move <fromPosNr.> <toPosNr.>\``}).catch(() => null);
        
        queue.tracks = arrayMove(queue.tracks, args[0], args[1])
        
        return interaction.reply({ ephemeral: false, content: `🪣 **Successfully moved the \`${client.queuePos(args[0])} Song\` to \`${client.queuePos(args[1])} Position\` in the Queue.**`}).catch(() => null);
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