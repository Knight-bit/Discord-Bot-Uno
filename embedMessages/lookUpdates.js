module.exports = {
    //Create the embed object to send the message
    execute(match_id, player_id,  name_jugador, win, url_jugador, stats_player, mensaje_alentador = ""){
        try{
            return {
                color : 0x0099ff,
                title: 'Match ' + match_id + " of " + name_jugador,
                url : "https://es.dotabuff.com/matches/" + match_id,
                author : {
                    name : name_jugador,
                    icon_url : url_jugador, // url de icono del jugador
                    url: "https://es.dotabuff.com/players/" + player_id,
                },
                description : `${name_jugador}  ha ${ win ? "ganado" : "perdido"} la partida `,
                fields : [
                    {
                        name : "Kills",
                        value : stats_player.kills,
                        inline: true,
                    },
                    {
                        name : "Assists",
                        value : stats_player.assists,
                        inline: true,
                    },
                    {
                        name : "Deaths",
                        value : stats_player.deaths,
                        inline: true,
                    },
                    {
                        name : "Last Hits",
                        value : stats_player.last_hits,
                        inline: true,
                    },
                    {
                        name : "Denies",
                        value : stats_player.denies,
                        inline: true,
                    }
                ],
                timestamp : new Date(),
                footer : {
                    text : mensaje_alentador,
                    icon_url : url_jugador,
                }

            }
        }
        catch{
            //If error en algun dato enviado
            return undefined;
        }
    }
}
//https://es.dotabuff.com/matches/5883868646 dotabufflinkmatch
//https://es.dotabuff.com/players/128875872 dotabuff playerlink
//channel.send({ embed: exampleEmbed }); how to send the embed message
/*
const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Some title')
    .setURL('https://discord.js.org/')
    .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addField('Inline field title', 'Some value here', true)
    .setImage('https://i.imgur.com/wSTFkRM.png')
    .setTimestamp()
    .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

*/