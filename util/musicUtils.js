const Discord = require('discord.js'); 
const dcYtdl = require("discord-ytdl-core"); 
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, createAudioResource, createAudioPlayer, NoSubscriberBehavior } = require("@discordjs/voice");
const { default: YouTube } = require('youtube-sr');
module.exports = client => {
    const m2 = (t) => {
        return parseInt(t) < 10 ? `0${t}` : `${t}`
    }
    const m3 = (t) => {
        return parseInt(t) < 100 ? `0${m2(t)}` : `${t}`
    }
    client.formatDuration = (ms) => {
        const sec = parseInt(ms / 1000 % 60);
        const min = parseInt(ms / (1000*60) % 60);
        const hrs = parseInt(ms / (1000*60*60) % 24);
        if(sec >= 60) sec = 0;
        if(min >= 60) min = 0;
        if(hrs > 1) return `${m2(hrs)}:${m2(min)}:${m2(sec)}`
        return `${m2(min)}:${m2(sec)}`
    }
    client.createBar = (duration, position) => {
        try {
          const full = "▰";
          const empty = "▱"
          const size = "▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱".length;
          const percent = duration == 0 ? null : Math.floor(position / duration * 100)
          const fullBars = Math.round(size * (percent / 100));
          const emptyBars = size - fullBars;
          return `**${full.repeat(fullBars)}${empty.repeat(emptyBars)}**`
        } catch (e) {
          console.error(e)
        }
      }
    client.getTime = () => {
        const d = new Date;
        return `${m2(d.getHours())}:${m2(d.getMinutes())}:${m2(d.getSeconds())}.${m3(d.getMilliseconds())}`
    }

    client.getYTLink = (ID) => {
        return `https://www.youtube.com/watch?v=${ID}`;
    }

    client.joinVoiceChannel = async (channel) => {
        return new Promise(async (res, rej) => {
            const oldConnection = getVoiceConnection(channel.guild.id);
            if (oldConnection) return rej("I'm already connected in: <#" + oldConnection.joinConfig.channelId + ">");
            const newConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            await delay(250);
            newConnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(newConnection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(newConnection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    newConnection.destroy();
                }
            });
            newConnection.on(VoiceConnectionStatus.Destroyed, () => {
                // try to delete the queue
                client.queues.delete(channel.guild.id)
            })
            return res("Connected to the Voice Channel");
        })
    };

    client.leaveVoiceChannel = async (channel) => {
        return new Promise(async (res, rej) => {
            const oldConnection = getVoiceConnection(channel.guild.id);
            if (oldConnection) {
                if (oldConnection.joinConfig.channelId != channel.id) return rej("We aren't in the same channel!")
                try {
                    oldConnection.destroy();
                    await delay(250);
                    return res(true)
                } catch (e) {
                    return rej(e)
                }
            } else {
                return rej("I'm not connected somwhere.")
            }
        })

    }

    client.getResource = (queue, songInfoId, seekTime = 0) => {
        let Qargs = "";
        let effects = queue?.effects || { 
            bassboost: 4,
            speed: 1,
        }
        if(effects.normalizer) Qargs += `,dynaudnorm=f=200`;
        if(effects.bassboost) Qargs += `,bass=g=${effects.bassboost}`
        if(effects.speed) Qargs += `,atempo=${effects.speed}`
        if(effects["3d"]) Qargs += `,apulsator=hz=0.03`
        if(effects.subboost) Qargs += `,asubboost`
        if(effects.mcompand) Qargs += `,mcompand`
        if(effects.haas) Qargs += `,haas`
        if(effects.gate) Qargs += `,agate`
        if(effects.karaoke) Qargs += `,stereotools=mlev=0.03`
        if(effects.flanger) Qargs += `,flanger`
        if(effects.pulsator) Qargs += `,apulsator=hz=1`
        if(effects.surrounding) Qargs += `,surround`
        if(effects.vaporwave) Qargs += `,aresample=48000,asetrate=48000*0.8`
        if(effects.nightcore) Qargs += `,aresample=48000,asetrate=48000*1.5`
        if(effects.phaser) Qargs += `,aphaser=in_gain=0.4`
        if(effects.tremolo) Qargs += `,tremolo`
        if(effects.vibrato) Qargs += `,vibrato=f=6.5`
        if(effects.reverse) Qargs += `,areverse`
        if(effects.treble) Qargs += `,treble=g=5`
        if(Qargs.startsWith(",")) Qargs = Qargs.substring(1)
        const requestOpts = {
            filter: "audioonly",
            fmt: "mp3",
            highWaterMark: 1 << 62, 
            liveBuffer: 1 << 62,
            dlChunkSize: 0,
            seek: Math.floor(seekTime / 1000),
            bitrate: queue?.bitrate || 128,
            quality: "lowestaudio",
            encoderArgs: Qargs ? ["-af", Qargs ] : ['-af', 'bass=g=6,dynaudnorm=f=200'] // queue.filters
        };
        if(client.config.YOUTUBE_LOGIN_COOKIE && client.config.YOUTUBE_LOGIN_COOKIE.length > 10) {
            requestOpts.requestOptions = {
                headers: {
                  cookie: client.config.YOUTUBE_LOGIN_COOKIE,
                }
            }
        }
        const resource = createAudioResource(dcYtdl(client.getYTLink(songInfoId), requestOpts), {
            inlineVolume: true
        });
        const volume = queue && queue.volume && queue.volume <= 150 && queue.volume >= 1 ? (queue.volume / 100) : 0.15;  // queue.volume / 100;
        resource.volume.setVolume(volume);
        resource.playbackDuration = seekTime;
        return resource;
    }

    client.playSong = async (channel, songInfo) => {
        return new Promise(async (res, rej) => {
            const oldConnection = getVoiceConnection(channel.guild.id);
            if (oldConnection) {
                if (oldConnection.joinConfig.channelId != channel.id) return rej("We aren't in the same channel!")
                try {
                    const curQueue = client.queues.get(channel.guild.id);
                    
                    const player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Stop,
                        },
                    });
                    oldConnection.subscribe(player);
                    
                    const resource = client.getResource(curQueue, songInfo.id);
                    // play the resource
                    player.play(resource);
                    
                    // When the player plays a new song
                    player.on("playing", (player) => {
                        const queue = client.queues.get(channel.guild.id);
                        // if filters changed, don't send something
                        if(queue && queue.filtersChanged) {
                            queue.filtersChanged = false;
                        } else {
                            client.sendQueueUpdate(channel.guild.id);
                        }
                        
                    });
                    // When the player goes on idle
                    player.on("idle", () => {
                        const queue = client.queues.get(channel.guild.id);
                        console.log(`${client.getTime()} :: QueueShift - Idle/Skip`)
                        handleQueue(queue)
                    })
                    // when an error happens
                    player.on('error', error => {
                        console.error(error);
                        const queue = client.queues.get(channel.guild.id);
                        console.log(`${client.getTime()} :: QueueShift - Error`)
                        handleQueue(queue)
                    });
                    
                    async function handleQueue(queue) {
                        if(queue && !queue.filtersChanged) {
                            try {
                                player.stop()
                                if(queue && queue.tracks && queue.tracks.length > 1) {
                                    queue.previous = queue.tracks[0];
                                    if(queue.trackloop && !queue.skipped) {
                                        if(queue.paused) queue.paused = false;
                                        player.play(client.getResource(queue, queue.tracks[0].id))
                                    } else if(queue.queueloop && !queue.skipped) {
                                        const skipped = queue.tracks.shift();
                                        queue.tracks.push(skipped);
                                        if(queue.paused) queue.paused = false;
                                        player.play(client.getResource(queue, queue.tracks[0].id));
                                    } else {
                                        if(queue.skipped) queue.skipped = false;
                                        if(queue.paused) queue.paused = false;
                                        queue.tracks.shift();
                                        player.play(client.getResource(queue, queue.tracks[0].id));
                                    }
                                } else if(queue && queue.tracks && queue.tracks.length <= 1) { // removes the nowplaying, if no upcoming and ends it
                                    queue.previous = queue.tracks[0];
                                    if(queue.trackloop || queue.queueloop && !queue.skipped) {
                                        player.play(client.getResource(queue, queue.tracks[0].id));
                                    } else {
                                        if(queue.skipped) queue.skipped = false;
                                        queue.tracks = [];
                                    }
                                }
                            } catch (e) { console.error(e) }
                        }
                    } 
                    return res(songInfo);
                } catch (e) {
                    return rej(e)
                }
            } else {
                return rej("I'm not connected somwhere.")
            }
        })

    }

    client.sendQueueUpdate = async (guildId) => {
        const queue = client.queues.get(guildId);
        if(!queue || !queue.tracks || queue.tracks.length == 0 || !queue.textChannel) return 
        const textChannel = client.channels.cache.get(queue.textChannel) || await client.channels.fetch(queue.textChannel).catch(() => null);
        if(!textChannel) return
        const song = queue.tracks[0];
        
        const songEmbed = new Discord.MessageEmbed().setColor("FUCHSIA")
            .setTitle(`${song.title}`)
            .setURL(client.getYTLink(song.id))
            .addField(`**Duration:**`, `> \`${song.durationFormatted}\``, true)
            .addField(`**Requester:**`, `> ${song.requester} \`${song.requester.tag}\``, true)
        if(song?.thumbnail?.url) songEmbed.setImage(`${song?.thumbnail?.url}`);

        textChannel.send({
            embeds: [
                songEmbed
            ]
        }).catch(console.warn)
    }

    client.createSong = (song, requester) => {
        return { ...song, requester }
    }

    client.queuePos = (length) => {
        const str = {
            1: "st",
            2: "nd",
            3: "rd",
        }
        return `${length}${str[length % 10] ? str[length % 10] : "th"}`
    }

    client.createQueue = (song, user, channelId, bitrate = 128) => {
        return {
            textChannel: channelId,
            paused: false,
            skipped: false,
            effects: {
                bassboost: 6,
                subboost: false,
                mcompand: false,
                haas: false,
                gate: false,
                karaoke: false,
                flanger: false,
                pulsator: false,
                surrounding: false,
                "3d": false,
                vaporwave: false,
                nightcore: false,
                phaser: false,
                normalizer: false,
                speed: 1,
                tremolo: false,
                vibrato: false,
                reverse: false,
                treble: false,
            },
            trackloop: false,
            queueloop: false,
            filtersChanged: false,
            volume: 15, // queue volume, between 1 and 100
            tracks: [ client.createSong(song, user) ],
            previous: undefined,
            creator: user,
            bitrate: bitrate
        }
    }
}

function delay(ms) {
    return new Promise(r => setTimeout(() => r(2), ms));
}
