require('dotenv').config();
const fs = require('fs');
const {chicosStats, chicosUpdate} = require('../mongodb/mongo_connect');
const Dict = require('collections/dict');
const lookPerfil = require('../embedMessages/lookPerfil');

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
    const stats_hero = await chicosStats.findOne({"name" : name}, {heroes : {$elemMatch : {name : hero}}});
    const stats_perfil = await chicosUpdate.findOne({"name" : name});
    if(stats_hero == null && stats_perfil == null) throw new Error("Error en la llamada al db") //si algun call del db tirar error stop
    const message_embed = {
        color : 0x112212,
        title : `${hero} stats de ${name}`,
        author : {
            name : hero,
            icon_url : stats_perfil.avatar,
        },
        description : `El mejor champ de ${name}`,
        fields :[
            {
                name : `Best kills of ${hero}`,
                value : Math.max(...stats_hero.heroes[0].kills),
                inline : true
            },
            {
                name : `Most deaths of ${hero}`,
                value : Math.max(...stats_hero.heroes[0].deaths),
                inline : true
            },
            {
                name : `Best assists of ${hero}`,
                value : Math.max(...stats_hero.heroes[0].assists),
                inline : true
            }
        ]
    }
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
