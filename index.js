const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const axios = require("axios");
const Discord = require("discord.js");
const Client = new Discord.Client();
const fs = require('fs');

//url:https://discordjs.guide/command-handling/dynamic-commands.html#dynamically-executing-commands
/* VARIABLES DE ENTERNO*/
require('dotenv').config({path: path.join(__dirname, ".env")});
const WEBHOOK = process.env.WEBHOOK_KNIGHT_ONE;
const PORT = process.env.PORT;
const BOT_TOKEN = process.env.BOT_TOKEN;
const prefix = process.env.PREFIX;
/*fin de VARIABLES DE ENTERNO*/

Client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of command_files){
    const command = require(`./commands/${file}`);
    Client.commands.set(command.name, command);
}

app.use(express.static("build"))
app.use(bodyParser.urlencoded({extended:true}));

Client.once("ready", () => {
    console.log("Ready!");
});

Client.on("message", message => {
    console.log(message.content);
    console.log(message.author.username)
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command_name = args.shift().toLowerCase();
    const command = Client.commands.get(command_name) || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
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

Client.login(BOT_TOKEN);

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