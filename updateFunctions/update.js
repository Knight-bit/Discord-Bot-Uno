const chicosStats = require('../mongodb/mongo_connect');

module.exports = {
    execute(name, hero, match, player, mati, gela, migue, wolf, knight, sparki){

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
                //mati
                $inc : mati? win? {"friends.$[mati].wins" : 1}:{"friends.$[mati].loses" : 1}: {}
                ,
                $inc : mati? {"friends.$[mati].total_matches" : 1}:{}
                ,
                //gela
                $inc : gela? win? {"friends.$[gela].wins" : 1}:{"friends.$[gela].loses" : 1}: {}
                ,
                $inc : gela? {"friends.$[gela].total_matches" : 1}:{}
                ,
                //migue
                $inc : migue? win? {"friends.$[migue].wins" : 1}:{"friends.$[migue].loses" : 1}: {}
                ,
                $inc : migue? {"friends.$[migue].total_matches" : 1}:{}
                ,
                //wolf
                $inc : wolf? win? {"friends.$[wolf].wins" : 1}:{"friends.$[wolf].loses" : 1}: {}
                ,
                $inc : wolf? {"friends.$[wolf].total_matches" : 1}:{}
                ,
                //knight
                $inc : knight? win? {"friends.$[knight].wins" : 1}:{"friends.$[knight].loses" : 1}: {}
                ,
                $inc : knight? {"friends.$[knight].total_matches" : 1}:{}
                ,
                //sparki
                $inc : sparki? win? {"friends.$[sparki].wins" : 1}:{"friends.$[sparki].loses" : 1}: {}
                ,
                $inc : sparki? {"friends.$[sparki].total_matches" : 1}:{}
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
                //gela
                $inc : gela? {"heroes.$[elem].friends.$[gela].total_matches" : 1} : {}
                ,
                $inc : win? gela? {"heroes.$[elem].friends.$[gela].wins": 1}:{"heroes.$[elem].friends.$[gela].loses": 1}: {}
                ,
                //migue
                $inc : migue? {"heroes.$[elem].friends.$[migue].total_matches" : 1} : {}
                ,
                $inc : win? migue? {"heroes.$[elem].friends.$[migue].wins": 1}:{"heroes.$[elem].friends.$[migue].loses": 1}: {}
                ,
                //knight
                $inc : knight? {"heroes.$[elem].friends.$[knight].total_matches" : 1} : {}
                ,
                $inc : win? knight? {"heroes.$[elem].friends.$[knight].wins": 1}:{"heroes.$[elem].friends.$[knight].loses": 1}: {}
                ,
                //mati
                $inc : mati? {"heroes.$[elem].friends.$[mati].total_matches" : 1} : {}
                ,
                $inc : win? mati? {"heroes.$[elem].friends.$[mati].wins": 1}:{"heroes.$[elem].friends.$[mati].loses": 1}: {}
                ,
                //sparki
                $inc : sparki? {"heroes.$[elem].friends.$[sparki].total_matches" : 1} : {}
                ,
                $inc : win? sparki? {"heroes.$[elem].friends.$[sparki].wins": 1}:{"heroes.$[elem].friends.$[sparki].loses": 1}: {}
                ,
                //wolf
                $inc : wolf? {"heroes.$[elem].friends.$[wolf].total_matches" : 1} : {}
                ,
                $inc : win? wolf? {"heroes.$[elem].friends.$[wolf].wins": 1}:{"heroes.$[elem].friends.$[wolf].loses": 1}: {}
                ,
            },
            {
                multi:true, //elem.name == heroe.name
                arrayFilters : [
                {'elem.name' : {$eq : hero}},
                {'mati.name' : {$eq : 'mati'}},
                {'wolf.name' : {$eq : 'wolf'}},
                {'knight.name' : {$eq : 'knight'}},
                {'migue.name' : {$eq : 'migue'}},
                {'gela.name' : {$eq : 'gela'}},
                {'lucas.name' : {$eq : 'lucas'}},
                ],
            },
            (err, res) => {
                if(res !== undefined) console.log("Update".toUpperCase()) 
                else console.log(err)
            }
        )
    }
}


/*
        $inc : { kills      : player['kills']},
        $inc : { denies     : player['denies']},
        $inc : { last_hits  : player['last_hits']},
        $inc : { assists    : player['assists']},
        $inc : { deaths     : player['deaths']},

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
*/