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
    const command = args.shift().toLowerCase();
    if(command === "args-info"){
        if(!args.length){
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        }else if(args[0] === 'foo') return message.channel.send('bar');
        message.channel.send(`First arguments: ${args[0]}`);
        message.channel.send(`Command name: ${command}\nArguments: ${args}`);
    }else if(command === 'kick'){
        const taggedUser = message.mentions.users.first();
        message.channel.send(`You wanted to kick: ${taggedUser.username}`);
    }else if(command === 'avatar'){
        if(!message.mentions.users.size){
            return message.channel.send(`You avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`)
        }
        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
            });
        message.channel.send(avatarList);
    }else if(command === 'prune'){
        Client.commands.get('prune').execute(message, args);
    }else if(command === 'ping'){
        Client.commands.get('ping').execute(message, args);
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