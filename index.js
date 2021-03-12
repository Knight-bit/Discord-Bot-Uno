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

const express = require("express");
const bodyParser = require("body-parser");
const Dict = require("collections/dict");

const {conn, Chicos_Stats, Chicos_Update} = require('./mongodb/mongo_connect');
const app = express();
const axios = require("axios");
const {Client, Message, Collection, WebhookClient, MessageEmbed} = require("discord.js");
const client = new Client();
const hook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);
const fs = require('fs');


//url:https://discordjs.guide/command-handling/dynamic-commands.html#dynamically-executing-commands


const url_gela = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${GELA}`;
const url_knight = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${KNIGHT}`;
const url_migue = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${MIGUE}`;
const url_sparki = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${SPARKI}`;
const url_wolf = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${WOLF}`;
const url_mati = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${MATI}`;
const url_lucas = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${LUCAS}`;


const path_chicos = "./files/chicos_datas/";


client.commands = new Collection();
const cooldowns = new Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for(const file of command_files){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

app.use(express.static("build"))
app.use(bodyParser.urlencoded({extended:true}));

const chicos_id =new Dict({
    "128875872" : "gela",
    "123438968" : "knight",
    "160933871" : "migue",
    "138086794" : "mati",
    "122477757" : "sparki"
});

const manageNewMatches = (match, id, client) => {
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
                        const data = new Chicos_Update({"account_id" : x.account_id, "match_id" : match_id, "name" : chicos_id.get(account_id.toString())});
                        data.save();
                    }else{
                        if(result.match_id == match_id){
                            console.log("Las partidas son iguales")
                            console.log(result);
                        }else{
                        //hook.send();
                        //Aca deberiamos crear un mensaje con la partida nueva
                        //Chicos_Update.updateOne(result, )
                        
                        }
                    }
                }
            })
        }
    }
}

function main(client) {
    let counter = 0, datos;
    setInterval(async () => {
        if(counter == 0){
            datos = await axios.get(url_gela);
            console.log(`match:${datos.data.result.matches[0].match_id} of gela`);
            manageNewMatches(datos.data.result.matches[0], GELA);
            counter ++;
        }else if(counter == 1){
            datos = await axios.get(url_migue);
            console.log(`match:${datos.data.result.matches[0].match_id} of migue`);
            manageNewMatches(datos.data.result.matches[0], MIGUE);
            counter ++;
        }else if(counter == 2){
            datos = await axios.get(url_knight);
            console.log(`match:${datos.data.result.matches[0].match_id} of knight`);
            manageNewMatches(datos.data.result.matches[0], KNIGHT);
            counter ++;
        }else if(counter == 3){
            datos = await axios.get(url_sparki);
            console.log(`match:${datos.data.result.matches[0].match_id} of sparki`);
            manageNewMatches(datos.data.result.matches[0], SPARKI);
            counter ++;
        }else if(counter == 4){
            datos = await axios.get(url_mati);
            console.log(`match:${datos.data.result.matches[0].match_id} of mati`);
            manageNewMatches(datos.data.result.matches[0], MATI);
            counter = 0;
        }
    }, 5000)
}

//new Discord.Message(client data channe_l);
client.once("ready", () => {
    console.log(client.channels)
    /*
    hook.sendSlackMessage({
        embeds : [{
            files : [{
                attachment: "./images/goat1.jpg",
                name : "goat1.jpg",
            }]
        }],
      }).then(console.log).catch(console.error);
      */
    const salute = new MessageEmbed()
    .setTitle('A slick little embed')
    .setColor(0xff0000)
    .setDescription('Hello, this is a slick embed!');
    
    hook.send(salute);
    
}); 




client.on("message", message => {
    console.log(message.content);
    console.log(message.author.username)
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

/*
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.post("/", (req, res) => {
    const username = req.body.username;
    const mensaje = req.body.mensaje;
    axios.post(WEBHOOK, {content : mensaje, username: username}).then(() => {
        console.log("Mensaje enviado");
        return res.redirect("/");
    }).catch(err => {
        console.log(err);
        return res.redirect("/");
    })
})

app.listen(PORT, () => {
    console.log(WEBHOOK);
    console.log("Listening port:" + PORT);
    console.log(path.join(__dirname, ".env"));
})
*/

