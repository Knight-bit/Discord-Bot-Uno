/* VARIABLES DE ENTERNO*/
const path = require("path");
require('dotenv').config({path: path.join(__dirname, ".env")});
const WEBHOOK_ID = process.env.WEBHOOK_ID;
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN;
const PORT = process.env.PORT;
const BOT_TOKEN = process.env.BOT_TOKEN;
const prefix = process.env.PREFIX;
const STEAM_API = process.env.STEAM_API;
const GELA = process.env.GELA;
const LUCAS = process.env.LUCAS;
const MATI = process.env.MATI;
const KNIGHT = process.env.KNIGHT;
const MIGUE = process.env.MIGUE;
const SPARKI = process.env.SPARKI;
const WOLF = process.env.WOLF;
/*fin de VARIABLES DE ENTERNO*/

const Dict = require("collections/dict");


const sendEmbed = require('./embedMessages/lookUpdates');
const {Chicos_Stats, Chicos_Update} = require('./mongodb/mongo_connect');
const axios = require("axios");
const {Client, Message, Collection, WebhookClient, MessageEmbed, ClientUser} = require("discord.js");
const client = new Client();
const hook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);
const fs = require('fs');


//url:https://discordjs.guide/command-handling/dynamic-commands.html#dynamically-executing-commands


const url_gela = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${GELA}`;
const url_knight = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${KNIGHT}`;
const url_migue = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${MIGUE}`;
const url_sparki = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${SPARKI}`;
const url_mati = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${MATI}`;
const get_match = (steam_api, match_id) => `http://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1?key=${steam_api}&match_id=${match_id}`;
const get_person_data = (steam_api, player_id) => `https://api.opendota.com/api/players/${player_id}?key_api=${steam_api}`;
const get_victory = (player_slot, radiant_win) => {
    if(player_slot < 100 && radiant_win == true){
        return true;
    }
    else if(player > 100 && radiant_win == true){
        return false
    }
    else if(player > 100 && radiant_win == false){
        return true;
    }
    else{
        return false;
    }
}

client.commands = new Collection();
const cooldowns = new Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for(const file of command_files){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const chicos_id =new Dict({
    "128875872" : "gela",
    "123438968" : "knight",
    "160933871" : "migue",
    "138086794" : "mati",
    "122477757" : "sparki"
});

const manageNewMatches = (match, channel) => {
    let match_id = match.match_id;
    for(let x of match.players){
        let account_id = x.account_id
        if(chicos_id.has(account_id.toString())){
            Chicos_Update.findOne({'account_id' : account_id}, (err, result) => {
                if(err){
                    console.log("error en chicos_update");
                }
                else{
                    if(result == null){
                        const get_specific = get_person_data(STEAM_API, account_id);
                        axios.get(get_specific)
                        .then((res) =>{
                            const perfil = res.data.profile;
                            Chicos_Update.create({"account_id" : x.account_id,
                                                "match_id" : match_id, 
                                                "name" : chicos_id.get(account_id.toString()),
                                                "personaname" : perfil.personaname,
                                                "avatar" : perfil.avatarfull,
                                            });
                        })
                        .catch(err => {
                            console.log("Error haciendo la llamada al DOTA2API");
                            console.log(err);
                        })
                    }else{
                        if(result.match_id == match_id){
                            console.log("Las partidas son iguales")
                            console.log(result);
                        }else{
                            axios.get(get_match(STEAM_API, match_id))
                            .then((res) => {
                                const joven = res.data.result.players.filter(person => person.account_id == account_id);
                                const stats_jugador = joven[0];
                                const win = get_victory(stats_jugador.player_slot, res.data.result.radiant_win);
                                Chicos_Update.find({"account_id" : account_id}, (err, data) =>{ 
                                    if(err) throw Error(err);
                                    const mensaje = sendEmbed.execute(result.match_id,
                                                account_id, data[0].personaname, win, 
                                                data[0].avatar , stats_jugador, "Bien jugado");
                                    channel.send({embed : mensaje});
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                           
                        }
                    }
                }
            })
        }
    }//termina el for
}

function main(channel) {
    let counter = 0, datos;
    setInterval(async () => {
        if(counter == 0){
            datos = await axios.get(url_gela);
            console.log(`match:${datos.data.result.matches[0].match_id} of gela`);
            manageNewMatches(datos.data.result.matches[0], channel);
            counter ++;
        }else if(counter == 1){
            datos = await axios.get(url_migue);
            console.log(`match:${datos.data.result.matches[0].match_id} of migue`);
            manageNewMatches(datos.data.result.matches[0], channel);
            counter ++;
        }else if(counter == 2){
            datos = await axios.get(url_knight);
            console.log(`match:${datos.data.result.matches[0].match_id} of knight`);
            manageNewMatches(datos.data.result.matches[0], channel);
            counter ++;
        }else if(counter == 3){
            datos = await axios.get(url_sparki);
            console.log(`match:${datos.data.result.matches[0].match_id} of sparki`);
            manageNewMatches(datos.data.result.matches[0], channel);
            counter ++;
        }else if(counter == 4){
            datos = await axios.get(url_mati);
            console.log(`match:${datos.data.result.matches[0].match_id} of mati`);
            manageNewMatches(datos.data.result.matches[0], channel);
            counter = 0;
        }
    }, 5000)
}

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

client.once("ready", () => {
    const messageChannel = client.channels.cache.get("820306912280051804")
    //messageChannel.send({embed : exampleEmbed1});
    main(messageChannel);
    
}); 

client.on("message", message => {
    console.log(message.content);
    if(message.content == "ohaiho"){
        //message.channel.send(exampleEmbed);
    }
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command_name = args.shift().toLowerCase();
    const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
    if(!command) return ;
    if(command.guild_only && message.channel.type === 'dm'){
        return message.reply('I can\'t execute that command inside DMs!');
    }
    if(command.args && !args.length){
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if(command.usage){
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }
    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldown_amount = (command.cooldown || 3) * 1000;
    /*
    if(timestamps.has(message.author.id)){
        const expiration_time = timestamps.get(message.author.id) + cooldown_amount;
        if(now < expiration_time){
            const time_left = (expiration_time - now) / 1000;
            return message.reply(`please wait ${time_left.toFixed(1)} more seconds(s) before reusing the\`${command.name}\` command.`);
        }
    }
    */
   
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldown_amount);
    try{
        command.execute(message, args);
    }catch(err){
        message.channel.send(`Hubo un error: ${err}`);
    }

});

client.login(BOT_TOKEN);

