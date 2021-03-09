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
/*fin de VARIABLES DE ENTERNO*/

const express = require("express");
const bodyParser = require("body-parser");

const {conn, Chicos_Stats, Chicos_Update} = require('./mongodb/mongo_connect');
const app = express();
const axios = require("axios");
const {Client, Message, Collection, WebhookClient} = require("discord.js");
const client = new Client();
const hook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);
const fs = require('fs');


//url:https://discordjs.guide/command-handling/dynamic-commands.html#dynamically-executing-commands


const url = `http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${STEAM_API}&account_id=${GELA}`;
const path_chicos = "C:\\Users\\WorldEditor\\Documents\\Python_Scripts\\Python_Dataanalysis\\datos\\chicos";


client.commands = new Collection();
const cooldowns = new Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for(const file of command_files){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

app.use(express.static("build"))
app.use(bodyParser.urlencoded({extended:true}));


//new Discord.Message(client data channe_l);
client.once("ready", () => {
    /*
        fs.readdirSync(path_chicos).map(_ =>{ 
            let file = path_chicos + "\\" + _;
            fs.readFile(file, (err, data) => {
                if(err) console.log(err);
                let datos = JSON.parse(data);
                let save_content = new Chicos_Update({"match_id" : 654, "user_id" : 123});
                save_content.save();
            });
        })
      
    */
    console.log("Ready!");
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
        cooldowns.set(command.name, new Discord.Collection());
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

