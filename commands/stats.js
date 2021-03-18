require('dotenv').config();
const {Chicos_Stats, Chicos_Update} = require('../mongodb/mongo_connect');
const Dict = require('collections/dict');

const chicos_id = new Dict(
    {
        "gela" : process.env.GELA,
        "knight" : process.env.KNIGHT,
        "mati" : process.env.MATI,
        "migue" : process.env.MIGUE,
        "sparki" : process.env.SPARKI
    }
)

module.exports = {
    name : "stats",
    aliases : "estadisticas",
    description : "Te da las estadisticas de x jugador",
    execute(message, args){
        if(args.length == 0){
            message.channel.send("Necesitas agregar mas argumentos");
        }
        const name = args.shift();
        if(chicos_id.has(name)){
            Chicos_Stats.findOne({"name" : name}, (err, data_stats) => {
                if(err) return message.channel.send(err);
                if(data_stats == null) return message.channel.send("No hay datos cargados");
                if(args.length == 0){
                    Chicos_Update.findOne({"name" : name}, (err, data_update) => {
                        if(err) return message.channel.send(err);
                        return message.channel.send({embed : {
                            color : 0x232323,
                            title : `${name} stats`,
                            author : {
                                name : name,
                                icon_url : data_update.avatar,
                                url : `https://es.dotabuff.com/players/${data_update.account_id}`
                            },
                            description : "El mejor carry de Chaco",
                            fields : [
                                {
                                    name : `Total de kills que hizo ${name}`,
                                    value : data_stats.kills,
                                },
                                {
                                    name : `Total de muertes de ${name}`,
                                    value : data_stats.deaths,
                                },
                                {
                                    name : `Total de assistencias de ${name}`,
                                    value : data_stats.assists,
                                },
                                {
                                    name : `Total de games`,
                                    value : data_stats.total_matches,
                                },
                                {
                                    name : "Win rate",
                                    value : (100 * (data_stats.wins / data_stats.total_matches)).toFixed(2),
                                }

                            ]
                        }})
                    })
                }
            })
        }
        message.channel.send("Estos son los atributos " + name);
    }
}
//hackmd 