
module.exports = {
    name: "ping",
    aliases: ["latency"],
    description: "Show the Bot's ping",
    run: async (client, interaction, args) => {
        interaction.reply({
            content: `:ping_pong: **PONG! Api Ping is: \`${client.ws.ping}ms\`**`,
            ephemeral: true
        }).catch(() => null);
    },
};