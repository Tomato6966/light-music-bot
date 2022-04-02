const { getVoiceConnection } = require("@discordjs/voice");
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require("discord.js");
module.exports = {
    name: "filter",
    description: "Applys/Removes Filters of the Queue",
    run: async (client, interaction, args, prefix) => {
        try {
            if(!interaction.member.voice.channelId) return interaction.reply(({ ephemeral: true, content: "👎 **Please join a Voice-Channel first!**"})).catch(() => null);
            const oldConnection = getVoiceConnection(interaction.guild.id);
            if(!oldConnection) return interaction.reply({ ephemeral: true, content:`👎 **I'm not connected somewhere**!`}).catch(() => null);
            
            const queue = client.queues.get(interaction.guild.id);
            if(!queue) return interaction.reply({ ephemeral: true, content:`👎 **I'm nothing playing right now.**`}).catch(() => null);
            
            const options = Object.keys(queue.effects)
            
            const Menu = new MessageSelectMenu()
                .setCustomId("filter_changing")
                .setPlaceholder("Pic Filters to enable/disable")
                .setMaxValues(options.filter(o => o != "bassboost" && o != "speed").length)
                .addOptions(options.filter(o => o != "bassboost" && o != "speed").map(option => {
                    return {
                        label: `${option.charAt(0).toUpperCase()}${option.slice(1)}`,
                        value: option,
                        description: `${queue.effects[option] ? `Enabled: ` : `Disabled: `} A ${option}-ish Audio-Effect`,
                        emoji: queue.effects[option] ? `✅` : "❌" 
                    }
                }))
            await interaction.deferReply();
            let msg = await interaction.followUp({
                content: "🔗 Pick what filter(s) you want to change!", 
                components: [new MessageActionRow().addComponents(Menu)]
            }).catch(console.error)
            if(!msg) return;
            msg = await msg.fetch().catch(console.warn);
            const collector = msg.createMessageComponentCollector({
                filter: (i => i.isSelectMenu() && i.customId == "filter_changing" && i.user.id == interaction.user.id),
                time: 60_000,
                max: 1
            })
            collector.on("collect", i => {
                i.values.forEach(option => queue.effects[option] = !queue.effects[option])
                i.reply({
                    content: `Changed ${i.values.length} Filter(s) to:\n> *Will be applied with the next Skip*`,
                    embeds: [
                        new MessageEmbed()
                        .setColor("FUCHSIA")
                        .setTitle("Current Filters")
                        .setDescription(Object.keys(queue.effects).filter(o => o != "bassboost" && o != "speed").map(option => `> **\`${option.charAt(0).toUpperCase()}${option.slice(1)}\`** - ${queue.effects[option] ? `✅ Enabled` : `❌ Disabled:`}`).join("\n\n"))
                    ]
                })
                // will be removed on .stop();
                queue.tracks = [ queue.tracks[0], ...queue.tracks ];
                queue.filtersChanged = true;
                const curPos = oldConnection.state.subscription.player.state.resource.playbackDuration;
                oldConnection.state.subscription.player.stop();
                oldConnection.state.subscription.player.play(client.getResource(queue, queue.tracks[0].id, curPos));
            })
            collector.on("end", e => {
                msg.edit({
                    content: msg.content,
                    components: [new MessageActionRow().addComponents(Menu.setDisabled(true))]
                }).catch(() => null)
            })
        } catch(e) { 
            console.error(e);
            interaction.reply({ ephemeral: true, content:`❌ Something went wrong: \`\`\`${e.interaction || e}`.substring(0, 1950) + `\`\`\``}).catch(() => null);
        }
    },
};