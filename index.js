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
const {Chicos_Update, Chicos_Stats} = require('./mongodb/mongo_connect');
const axios = require("axios");
const {Client, Collection, WebhookClient} = require("discord.js");
const client = new Client();
//const hook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);
const fs = require('fs');


//url:https://discordjs.guide/command-handling/dynamic-commands.html#dynamically-executing-commands

const url_chicos = (steam_api, id) =>`http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${steam_api}&account_id=${id}`;
const get_match = (steam_api, match_id) => `http://api.steampowered.com/IDOTA2Match_570/GetMathDetails/v1?key=${steam_api}&match_id=${match_id}`;
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

const chicos_id = new Dict();
chicos_id.set(GELA, "gela");
chicos_id.set(KNIGHT, "knight");
chicos_id.set(MIGUE, "migue");
chicos_id.set(MATI, "mati");
chicos_id.set(SPARKI, "sparki");
chicos_id.set(WOLF, "wolf")
const heroes_id = new Dict(JSON.parse(fs.readFileSync('./files/heroes_id.json')));


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
    let is_new = false;
    Chicos_Update.findOne({"account_id" : id}, (err, data) => {
        if(err) throw Error(err); //Si tira error natural va directo al throw
        console.log(data)
        if(data == null){ //Si no devuelve datos, crea el objecto
        const get_specific = get_person_data(STEAM_API, id);
        axios.get(get_specific)
        .then((res) =>{
            const perfil = res.data.profile;
            is_new = true;
            Chicos_Update.create({"account_id" : id,
                                "match_id" : match_id, 
                                "name" : chicos_id.get(id),
                                "personaname" : perfil.personaname,
                                "avatar" : perfil.avatarfull});
            })
            .catch(err => {
                console.log(err);
            })
        }
        if(data != undefined){
            if(match_id == data.match_id) return console.log("El match es el mismo")  //Chequea si el match ya esta archivado
        }
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
                                                    data.avatar , player, heroes_id.get(player.hero_id.toString())
                                                    , "Bien jugado");
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
            datos = await axios.get(url_chicos(STEAM_API, GELA));
            console.log(`match:${datos.data.result.matches[0].match_id} of gela`);
            manageNewMatches(datos.data.result.matches[0], GELA,channel);
            counter ++;
        }else if(counter == 1){
            datos = await axios.get(url_chicos(STEAM_API, MIGUE));
            console.log(`match:${datos.data.result.matches[0].match_id} of migue`);
            manageNewMatches(datos.data.result.matches[0], MIGUE,  channel);
            counter ++;
        }else if(counter == 2){
            datos = await axios.get(url_chicos(STEAM_API, KNIGHT));
            console.log(`match:${datos.data.result.matches[0].match_id} of knight`);
            manageNewMatches(datos.data.result.matches[0], KNIGHT ,channel);
            counter ++;
        }else if(counter == 3){
            datos = await axios.get(url_chicos(STEAM_API, SPARKI));
            console.log(`match:${datos.data.result.matches[0].match_id} of sparki`);
            manageNewMatches(datos.data.result.matches[0], SPARKI, channel);
            counter ++;
        }else if(counter == 4){
            datos = await axios.get(url_chicos(STEAM_API, MATI));
            console.log(`match:${datos.data.result.matches[0].match_id} of mati`);
            manageNewMatches(datos.data.result.matches[0], MATI, channel);
            counter ++;
        }else if(counter == 5){
            datos = await axios.get(url_chicos(STEAM_API, WOLF));
            console.log(`match:${datos.data.result.matches[0].match_id} of mati`);
            manageNewMatches(datos.data.result.matches[0], WOLF, channel);
            counter = 0;
        }
    }, 5000)
}

client.once("ready", () => {
    //Canal donde se envia el mensaje
    //console.log(heroes_id.get("1"));
    const messageChannel = client.channels.cache.get("820306912280051804");
    /* Eliminar mensajes
    messageChannel.messages.fetch({around: "50" }, limit = 100).then(messages => {
        messageChannel.bulkDelete(messages);
    });
    */
  /*
   fs.readdirSync("./files/chicos_datas/").map(_ =>{ 
       const file = fs.readFileSync(`./files/chicos_datas/${_}`);
       const data = JSON.parse(file);
       Chicos_Stats.create(data,(err) => {
           if(err) console.log(err);
           console.log("Created");
       })
   })
   */
   /*
   Chicos_Stats.findOne({"name" : "gela"}, {name : 1, heroes: {$elemMatch : {name : "antimage"}}}, (err, data) => {
       if(err){
           console.log(err);
           return
       }
       console.log(data);
   })
   */
  main()
}); 

client.on("message", message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command_name = args.shift().toLowerCase();
    const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
    if(!command) return ;
    if(command.guild_only && message.channel.type === 'dm'){
        return message.reply('I can\'t execute that command inside DMs!');
    }
    if(command.args && !args.length){
        let reply = `Faltaron argumentos viejita, ${message.author}!`;
        if(command.usage){
            reply += `\nTendrias que usarlo de esta manera: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }
    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldown_amount = (command.cooldown || 3) * 1000;
    
    if(timestamps.has(message.author.id)){
        const expiration_time = timestamps.get(message.author.id) + cooldown_amount;
        if(now < expiration_time){
            const time_left = (expiration_time - now) / 1000;
            return message.reply(`Espera ${time_left.toFixed(1)}s viejita`);
        }
    }
    
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldown_amount);
    try{
        command.execute(message, args);
    }catch(err){
        
    }

});

client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});

client.login(BOT_TOKEN);

