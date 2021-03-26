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

    last_hits : Number,
    denies : Number,
    friends: [
        {
            name : String,
            account_id: Number, 
            total_matches : Number,
            wins : Number,
            loses : Number,
        }
    ],
    heroes : [
        {
            name : String,
            name_localized : String,
            total_matches : Number,
            wins : Number,
            loses : Number,
            leaves : Number,

            match_id : [Number],
            kills : [Number],
            deaths: [Number],
            assists : [Number],

            last_hits : [Number],
            denies : [Number],

            gold_per_min : [Number],
            xp_per_min : [Number],
            level : [Number],

            item_neutral : [Number],
            backpack_0 : [Number],
            backpack_1 : [Number],
            backpack_2 : [Number],
            item_0 : [Number],
            item_1 : [Number],
            item_2 : [Number],
            item_3 : [Number],
            item_4 : [Number],
            item_5 : [Number],

            friends : [
                {
                    name : String,
                    account_id: Number, 
                    total_matches : Number,
                    wins : Number,
                    loses : Number,
                }
            ]
        }
    ],
})
const chicos_update = new Schema({
    account_id : Number,
    match_id : Number,
    name : String,
    avatar: String,
    personaname : String,
})
const dummy = new Schema({
    id : Number,
    dummy_number : Number,
    dummy_array : [Number],
    dummy_object : [
        {
            name : String,
            number : Number,
            arreglo : [Number],
            dummy_object : [ 
                {
                    number : Number,
                    name : String,
                }
            ]
        }
    ]
})
const apoyo_modelo = new Schema({
    message : {type : [String] }
})

module.exports = {
    chicos_stats,
    chicos_update,
    apoyo_modelo,
    dummy,
}

