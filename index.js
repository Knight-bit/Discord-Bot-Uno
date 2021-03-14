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
    else if(player_slot > 100 && radiant_win == true){
        return false
    }
    else if(player_slot > 100 && radiant_win == false){
        return true;
    }
    else{
        return false;
    }
}

/*
const chicos_id =new Dict({
    GELA : "gela",
    KNIGHT : "knight",
    MIGUE : "migue",
    MATI : "mati",
    SPARKI : "sparki"
});
*/
const chicos_id = new Dict();
chicos_id.set(GELA, "gela");
chicos_id.set(KNIGHT, "knight");
chicos_id.set(MIGUE, "migue");
chicos_id.set(MATI, "mati");
chicos_id.set(SPARKI, "sparki");



client.commands = new Collection();
const cooldowns = new Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for(const file of command_files){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

//Updatea al jugador con su ultimo game, solamente ese jugador es updateado si hay mas veo que hago
const manageNewMatches = (match, id, channel) => {
    const match_id = match.match_id;
    Chicos_Update.findOne({"account_id" : id}, (err, data) => {
        if(err) throw Error(err); //Si tira error natural va directo al throw
        if(data == null){ //Si no devuelve datos, crea el objecto
        const get_specific = get_person_data(STEAM_API, id);
        axios.get(get_specific)
        .then((res) =>{
            const perfil = res.data.profile;
            Chicos_Update.create({"account_id" : id,
                                "match_id" : match_id, 
                                "name" : chicos_id.get(id),
                                "personaname" : perfil.personaname,
                                "avatar" : perfil.avatarfull});
            })
        }
        if(match_id == data.match_id) return console.log("El match es el mismo")  //Chequea si el match ya esta archivado
        axios.get(get_match(STEAM_API, match_id)) 
        .then(res => { //Pido el detalle del match para llevarme sus datos
            const player = res.data.result.players.filter(_ => _.account_id == id)[0];
            const win = get_victory(player.player_slot, res.data.result.radiant_win);
            axios.get(get_person_data(STEAM_API, id))
            .then((res_personal) => {
                const perfil = res_personal.data.profile;
                const update = {
                                "account_id" : id,
                                "match_id" : match_id,
                                "name" : chicos_id.get(id),
                                "personaname" : perfil.personaname,
                                "avatar" : perfil.avatarfull, 
                                }
                Chicos_Update.findOneAndUpdate({"account_id" : id}, update, (err, data) => { 
                    if(err) throw Error(err);
                    const mensaje = sendEmbed.execute(match_id, id, data.personaname, win, 
                                                    data.avatar , player, "Bien jugado");
                    channel.send({embed : mensaje});
                    //Todo resuelto con exito
                    console.log("Resuelto sin problemas");
                });
            })
        })
    })
    .catch(err => console.log(err));
}

//Funcion principal para recorrer a mis amigos con perfil publico
function main(channel) {
    let counter = 0, datos;
    setInterval(async () => {
        if(counter == 0){
            datos = await axios.get(url_gela);
            console.log(`match:${datos.data.result.matches[0].match_id} of gela`);
            manageNewMatches(datos.data.result.matches[0], GELA,channel);
            counter ++;
        }else if(counter == 1){
            datos = await axios.get(url_migue);
            console.log(`match:${datos.data.result.matches[0].match_id} of migue`);
            manageNewMatches(datos.data.result.matches[0], MIGUE,  channel);
            counter ++;
        }else if(counter == 2){
            datos = await axios.get(url_knight);
            console.log(`match:${datos.data.result.matches[0].match_id} of knight`);
            manageNewMatches(datos.data.result.matches[0], KNIGHT ,channel);
            counter ++;
        }else if(counter == 3){
            datos = await axios.get(url_sparki);
            console.log(`match:${datos.data.result.matches[0].match_id} of sparki`);
            manageNewMatches(datos.data.result.matches[0], SPARKI, channel);
            counter ++;
        }else if(counter == 4){
            datos = await axios.get(url_mati);
            console.log(`match:${datos.data.result.matches[0].match_id} of mati`);
            manageNewMatches(datos.data.result.matches[0], MATI, channel);
            counter = 0;
        }
    }, 5000)
}

client.once("ready", () => {
    //Canal donde se envia el mensaje
    const messageChannel = client.channels.cache.get("820306912280051804")
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

