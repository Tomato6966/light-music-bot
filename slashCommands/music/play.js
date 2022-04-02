const { getVoiceConnection } = require("@discordjs/voice");
const { default: YouTube } = require('youtube-sr');

module.exports = {
    name: "play",
    description: "Plays Music in your Voice Channel",
    options: [
        {
            name: "songtitle",
            description: "Title/Link of the Song/Playlist",
            type: "STRING",
            required: true,
        },
    ],
    run: async (client, interaction, args, prefix) => {
        if(!interaction.member.voice.channelId) return interaction.reply("👎 **Please join a Voice-Channel first!**").catch(() => null);
        const { channel } = interaction.member.voice; // get the voice channel
        // get an old connection
        const oldConnection = getVoiceConnection(interaction.guild.id);
        if(oldConnection && oldConnection.joinConfig.channelId != interaction.member.voice.channelId) return interaction.reply("👎 **We are not in the same Voice-Channel**!").catch(() => null);
        
        const track = args.join(" ");
        if(!args[0]) return interaction.reply(`👎 Please add the wished Music via: \`${prefix}play <Name/Link>\``).catch(() => null);
        // Regexpressions for testing the search string
        const youtubRegex = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistRegex = /^.*(list=)([^#\&\?]*).*/gi;
        const songRegex = /^.*(watch\?v=)([^#\&\?]*).*/gi;
        // variables for song, and playlist
        let song = null;
        let playlist = null;
        // Use the regex expressions
        const isYT = youtubRegex.exec(track);
        const isSong = songRegex.exec(track);
        const isList = playlistRegex.exec(track)
                
        if(!oldConnection) {
            // try to join the voice channel
            try {
                await client.joinVoiceChannel(channel)
            } catch (e){ console.error(e);
                return interaction.reply(`❌ Could not join the VC because: \`\`\`${e.interaction || e}`.substr(0, 1950) + `\`\`\``).catch(() => null);
            }
        }
        try {
            // try to play the requested song
            await interaction.reply(`🔍 *Searching **${track}** ...*`).catch(() => null);
            // get the queue
            let queue = client.queues.get(interaction.guild.id); 
            // If a fresh channel join is needed, and a old queue exists, delete it!
            if(!oldConnection && queue) {
                client.queues.delete(interaction.guild.id)
                queue = undefined;
            }
            // get song from the link
            if(isYT && isSong && !isList) {
                song = await YouTube.getVideo(track); 
            }
            // get playlist from the link
            else if(isYT && !isSong && isList) {
                playlist = await YouTube.getPlaylist(track).then(playlist => playlist.fetch());
            }
            // get playlist & song from the link
            else if(isYT && isSong && isList) {
                song = await YouTube.getVideo(`https://www.youtube.com/watch?v=${isSong[2]}`); 
                playlist = await YouTube.getPlaylist(`https://www.youtube.com/playlist?list=${isList[2]}`).then(playlist => playlist.fetch());
            }
            // otherwise search for it
            else {
                song = await YouTube.searchOne(track); 
            }
            if(!song && !playlist) return interaction.editReply(`❌ **Failed looking up for ${track}!**`);
            /* FOR NO PLAYLIST REQUESTS */
            if(!playlist) {
                // if there is no queue create one and start playing
                if(!queue || queue.tracks.length == 0) { 
                    // play the song in the voice channel
                    await client.playSong(channel, song);
                    // Add the song to the queue
                    const newQueue = client.createQueue(song, interaction.user, interaction.channelId)
                    client.queues.set(interaction.guild.id, newQueue)
                    // edit the loading interaction     
                    return interaction.editReply(`▶️ **Now Playing: __${song.title}__** - \`${song.durationFormatted}\``).catch(() => null);
                }
                // Add the song to the queue
                queue.tracks.push(client.createSong(song, interaction.user))
                // edit the loading interaction     
                return interaction.editReply(`👍 **Queued at \`${client.queuePos(queue.tracks.length - 1)}\`: __${song.title}__** - \`${song.durationFormatted}\``).catch(() => null);
            } 
            /* FOR PLAYLIST REQUEST */
            else {
                // get the song, or the first playlist song
                song = song ? song : playlist.videos[0];
                // if there is no queue create one and start playing
                if(!queue || queue.tracks.length == 0) { 
                    // play the song in the voice channel
                    await client.playSong(channel, song);
                    // Add the playlist songs to the queue
                    const newQueue = client.createQueue(song, interaction.user, interaction.channelId)
                    playlist.videos.slice(1).forEach(song => newQueue.tracks.push(client.createSong(song, interaction.user)))
                    client.queues.set(interaction.guild.id, newQueue)
                    // edit the loading interaction     
                    return interaction.editReply(`▶️ **Now Playing: __${song.title}__** - \`${song.durationFormatted}\``).catch(() => null);
                }
                // Add the playlist songs to the queue
                playlist.videos.slice(1).forEach(song => queue.tracks.push(client.createSong(song, interaction.user)))
                // edit the loading interaction                    
                return interaction.editReply(`👍 **Queued at \`${client.queuePos(queue.tracks.length - (playlist.videos.length - 1))}\`: __${song.title}__** - \`${song.durationFormatted}\`\n> **Added \`${playlist.videos.length - 1} Songs\` from the Playlist:**\n> __**${playlist.title}**__`).catch(() => null);
            }

        } catch (e){ console.error(e);
            return interaction.reply(`❌ Could not play the Song because: \`\`\`${e.interaction || e}`.substr(0, 1950) + `\`\`\``).catch(() => null);
        }
    },
};