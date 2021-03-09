const {Schema} = require("mongoose");


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
const chicos_update = new Schema({
    user_id : Number,
    match_id : Number,
    dummy : {
        type: Map,
        of: Map
    }
})

module.exports = {
    chicos_stats,
    chicos_update,
}
