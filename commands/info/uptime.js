
module.exports = {
    name: "uptime",
    description: "Show the Bot's uptime",
    run: async (client, message, args, prefix) => {
        let date = new Date()
        let timestamp = date.getTime() - Math.floor(client.uptime);
        message.reply({
            content: `⬆️⏳ **I'm running since <t:${Math.floor(timestamp / 1000)}:F> and was started <t:${Math.floor(timestamp / 1000)}:R>!**`
        }).catch(() => null);
    },
};