const mongoose = require('mongoose');
const path = require('path');
/* VARIABLES DE ENTERNO*/
require('dotenv').config({path: path.join(__dirname, "../.env")});
const DB = process.env.MONGODB_DB;
const USER = process.env.MONGODB_USER;
const PASSWORD = process.env.MONGODB_PASSWORD;
/*fin de VARIABLES DE ENTERNO*/

const url_mongo = `mongodb+srv://${USER}:${PASSWORD}@knight-bot.gitzt.mongodb.net/${DB}?retryWrites=true&w=majority`;

const conn = mongoose.createConnection(url_mongo,{useNewUrlParser: true,useUnifiedTopology: true });
conn.on('connected', () => {
	console.log("DB CONNECTED");
})
conn.on('disconnected', () => {
	console.log("DB DISCONNECTED");
})

exports.default = {
	conn,
}