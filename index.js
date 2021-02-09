const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const axios = require("axios");
require('dotenv').config({path: path.join(__dirname, ".env")});
const WEBHOOK = process.env.WEBHOOK_KNIGHT_ONE;
const PORT = process.env.PORT;
const BOT_TOKEN = process.env.BOT_TOKEN;
const Discord = require("discord.js");
const Client = new Discord.Client();

app.use(express.static("build"))
app.use(bodyParser.urlencoded({extended:true}));

Client.once("ready", () => {
    console.log("Ready!");
});

Client.on("message", message => {
    console.log(message.content);
    console.log(message.author.username)
    if(message.content === "!ping") return message.channel.send("Pong");
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