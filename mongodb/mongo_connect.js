const mongoose = require('mongoose');
const {chicos_stats, chicos_update, dummy} = require('./schemas/mongo_schemas');
const path = require('path');
/* VARIABLES DE ENTERNO*/
require('dotenv').config({path: path.join(__dirname, "../.env")});
const DB = process.env.MONGODB_DB;
const USER = process.env.MONGODB_USER;
const PASSWORD = process.env.MONGODB_PASSWORD;
/*fin de VARIABLES DE ENTERNO*/

const url_mongo = `mongodb+srv://${USER}:${PASSWORD}@knight-bot.gitzt.mongodb.net/${DB}?retryWrites=true&w=majority`;

const conn = mongoose.createConnection(url_mongo,{useNewUrlParser: true,useUnifiedTopology: true });
const Chicos_Stats = conn.model("chicos_stats", chicos_stats);
const Chicos_Update = conn.model("chicos_update", chicos_update);
conn.set('useFindAndModify', false);

conn.on('connected', () => {
	console.log("DB CONNECTED");
})
conn.on('disconnected', () => {
	console.log("DB DISCONNECTED");
})

module.exports = {
	conn,
	Chicos_Stats,
	Chicos_Update,
}