require('dotenv').config();
const fs = require('fs');
const {chicosStats, chicosUpdate} = require('../mongodb/mongo_connect');
const Dict = require('collections/dict');
const lookPerfil = require('../embedMessages/lookPerfil');
const lookHeroes = require('../embedMessages/lookHeroes');
const chicos_id = new Dict(
    {
        "gela" : process.env.GELA,
        "knight" : process.env.KNIGHT,
        "mati" : process.env.MATI,
        "migue" : process.env.MIGUE,
        "sparki" : process.env.SPARKI,
        "wolf" : process.env.WOLF,
    }
)
const heroes_id = new Dict(JSON.parse(fs.readFileSync('./files/heroes_id.json')));

module.exports = {
    name : "stats",
    aliases : "estadisticas",
    description : "Te da las estadisticas de x jugador",
    execute (message,  args){
        if(args.length == 0){
            message.channel.send("Necesitas agregar mas argumentos");
        }
        const name = args.shift().toLowerCase(); //sacamos el heroe
        if(chicos_id.has(name)){
            try{
                if(!args.length == 0){//Aca pedimos el heroe especifico de la persona
                    //Declaramos el heroe aca abajo
                    let hero = args.shift().toLowerCase();
                    if(args.length > 0){
                        hero += "_" + args.shift().toLowerCase();
                    }
                    messageHero(name , hero , message)
                    
                }else{ //Aca damos datos generales de la persona
                    message.channel.send("Estos son los stats de " + name);
                    messagePerfil(name, message);
                    return //termina la funcion
                }
            }catch(err){
                message.channel.send("Error haciendo la llamada viejita");
            }
        }
    }
}
 
const messageHero = async (name, hero, message) => {
    //Estas dos variables filtran los datos que seran entregados del db
    const match = {name : name}
    const project1 = {"name" : 1 , "heroes" : { $filter : {input :"$heroes", as :"hero", cond : {$eq : ["$$hero.name" , hero]}}}}
    const cond_amigo = {
        $cond : {
            if : {$isArray :'$heroes.friends'},
            then: {
                $map :{
                    input : "$heroes.friends",
                    as : "friends",
                    in : "$$friends.name"
                }
            },
            else: []
        }
    }
    const cond_winrate = {
        $cond : {
            if : {$isArray :'$heroes.friends'},
            then: {
                $map :{
                    input : "$heroes.friends",
                    as : "friends",
                    in : {$round : [{$multiply : [{$divide : ["$$friends.wins", "$$friends.total_matches"]}, 100]}, 2]}
                }
            },
            else: []
        }
    }
    //Aca designamos las variables que se veran adentro del objecto
    const project2 = {
        name : 1,
        hero_name : "$heroes.name",
        avg_kills  : {$round : [{$avg : "$heroes.kills"},2 ]}, 
        avg_deaths : {$round : [{$avg : "$heroes.deaths"},2]},
        avg_assists: {$round : [{$avg : "$heroes.assists"}, 2]},
        avgWins   : {$round : [{$multiply : [{$divide : ["$heroes.wins", "$heroes.total_matches"]}, 100]}, 2]},
        amigo_winrate : cond_winrate,
        amigo_name : cond_amigo
        }
    const stats = await chicosStats.aggregate([{$match : match}, {$project: project1}, {$unwind : "$heroes"}, {$project: project2}]);
    const stats_perfil = await chicosUpdate.findOne({"name" : name});
    if(stats == null && stats_perfil == null) throw new Error("Error en la llamada al db") //si algun call del db tirar error stop
    const message_embed = lookHeroes.execute(stats[0], stats_perfil);
    message.channel.send({embed: message_embed});
}

const messagePerfil = async (name, message) => {
    const match = {name : name}
    const project = {
        name            : 1,
        kills           : 1,
        deaths          : 1,
        assits          : 1,
        total_matches   : 1,
        avgWins         : {$round : [{$multiply : [{$divide : ["$wins", "$total_matches"]}, 100]}, 2]},
    }
    const stats = await chicosStats.aggregate([{$match : match}, {$project : project}])
    //const stats = await chicosStats.findOne({"name" : name});
    const stats_perfil = await chicosUpdate.findOne({"name" : name});
    if(stats === null && stats_perfil === null) throw new Error("Error en la llamada al db") //si algun call del db tirar error stop
    const message_embed = lookPerfil.execute(name, stats_perfil, stats[0]);
    message.channel.send({embed: message_embed})
};
