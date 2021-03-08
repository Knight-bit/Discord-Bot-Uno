const {Schema}, mongoose = require("mongoose");


const chicos_stats = new Schema({
    name : String,

    total_matches : Number,
    wins : Number,
    loses : Number,
    leaves : Number,

    kills : Number,
    deaths : Number,
    assists : Number,

    friends: Map,
    heroes : Map,
})

