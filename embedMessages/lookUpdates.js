module.exports = {
    //Create the embed object to send the message
    execute(match_id, chico_update, win, stats_player, heroe, mensaje_alentador = ""){
        try{
            return {
                color : 0x0099ff,
                title: `Match de ${chico_update.personaname} con ${heroe.localized_name}`,
                url : "https://es.dotabuff.com/matches/" + match_id,
                author : {
                    name : chico_update.personaname,
                    icon_url : chico_update.avatar, // url de icono del jugador
                    url: "https://es.dotabuff.com/players/" + chico_update.account_id,
                },
                description : `${chico_update.personaname}  ha ${ win ? "ganado" : "perdido"} la partida con ${heroe.localized_name}`,
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
                    },
                    {
                        name : "Exp per min",
                        value : stats_player.xp_per_min,
                        inline: true,
                    },
                    {
                        name : "Gold per min",
                        value : stats_player.gold_per_min,
                        inline: true,
                    }
                ],
                timestamp : new Date(),
                footer : {
                    text : mensaje_alentador,
                    icon_url : chico_update.avatar,
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

//Objecto para crear messageEmbed
    const exampleEmbed1 = {
	color: 0x0099ff,
	title: 'Some title',
	url: 'https://discord.js.org',
	author: {
		name: 'Some name',
		icon_url: 'https://i.imgur.com/wSTFkRM.png',
		url: 'https://discord.js.org',
	},
	description: 'Some description here',
	thumbnail: {
		url: 'https://i.imgur.com/wSTFkRM.png',
	},
	fields: [
		{
			name: 'Regular field title',
			value: 'Some value here',
		},
		{
			name: '\u200b',
			value: '\u200b',
			inline: false,
		},
		{
			name: 'Inline field title',
			value: 'Some value here',
			inline: true,
		},
		{
			name: 'Inline field title',
			value: 'Some value here',
			inline: true,
		},
		{
			name: 'Inline field title',
			value: 'Some value here',
			inline: true,
		},
	],
	image: {
		url: 'https://i.imgur.com/wSTFkRM.png',
	},
	timestamp: new Date(),
	footer: {
		text: 'Some footer text here',
		icon_url: 'https://i.imgur.com/wSTFkRM.png',
	},
};

*/