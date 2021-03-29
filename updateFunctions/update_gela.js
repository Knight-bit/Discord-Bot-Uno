const chicosStats = require('../mongodb/mongo_connect');

module.exports = {
    execute(name, hero, match, player, win){

        chicosStats.updateOne(
            {name : name},
            {
                $inc : { kills          : player['kills']},
                $inc : { denies         : player['denies']},
                $inc : { last_hits      : player['last_hits']},
                $inc : { assists        : player['assists']},
                $inc : { deaths         : player['deaths']},
                $inc : { total_matches  : 1},
                $inc : win? {wins : 1}  : {loses : 1}
                ,
                $inc : {"friends.$[gela].total_matches": 1},
                $inc : win? {"friends.$[gela].wins": 1} : {"friends.$[gela].wins": 1}
                ,
                //Ahora el heroe
                $push : {"heroes.$[elem].match_id"      : match['match_id']},
                $push : {"heroes.$[elem].kills"         : player['kills']},
                $push : {"heroes.$[elem].deaths"        : player['deaths']},
                $push : {"heroes.$[elem].assists"       : player['assists']},
                $push : {"heroes.$[elem].last_hits"     : player['last_hits']},
                $push : {"heroes.$[elem].denies"        : player['denies']},
                $push : {"heroes.$[elem].xp_per_min"    : player['xp_per_min']},
                $push : {"heroes.$[elem].gold_per_min"  : player['gold_per_min']},
                $push : {"heroes.$[elem].item_0"        : player['item_0']},
                $push : {"heroes.$[elem].item_1"        : player['item_1']},
                $push : {"heroes.$[elem].item_2"        : player['item_2']},
                $push : {"heroes.$[elem].item_3"        : player['item_3']},
                $push : {"heroes.$[elem].item_4"        : player['item_4']},
                $push : {"heroes.$[elem].item_5"        : player['item_5']},
                $push : {"heroes.$[elem].backpack_0"    : player['backpack_0']},
                $push : {"heroes.$[elem].backpack_1"    : player['backpack_1']},
                $push : {"heroes.$[elem].backpack_2"    : player['backpack_2']},
                $push : {"heroes.$[elem].item_neutral"  : player['item_neutral']},
                $inc  : {"heroes.$[elem].total_matches" : 1},
                $inc : win? {"heroes.$[elem].wins" : 1} : {"heroes.$[elem].loses" : 1}
                ,
                $inc : {"heroes.$[elem].friends.$[gela].total_matches" : 1},
                $inc : win? {"heroes.$[elem].friends.$[gela].wins": 1} : {"heroes.$[elem].friends.$[gela].wins": 1}
                ,
            },
            {
                multi:true,
                arrayFilters : [
                {
                    'elem.name' : {$eq : hero}
                }, 
                {
                    'gela.name' : {$eq : 'gela'}
                }
                ],
            },
            (err, res) => {
                if(res !== undefined) console.log("Update".toUpperCase()) 
                else console.log(err)
            }
        )
    }
}