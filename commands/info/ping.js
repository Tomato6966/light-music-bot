
module.exports = {
    name: "ping",
    description: "Show the Bot's ping",
    run: async (client, message, args, prefix) => {
        message.reply({
            content: `:ping_pong: **PONG! Api Ping is: \`${client.ws.ping}ms\`**`
        }).catch(() => null);
    },
};