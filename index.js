/* VARIABLES DE ENTERNO*/
const path = require("path");
require('dotenv').config({path: path.join(__dirname, ".env")});
const WEBHOOK_ID = process.env.WEBHOOK_ID;
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN;
const BOT_TOKEN = process.env.BOT_TOKEN;
const prefix = process.env.PREFIX;
const STEAM_API = process.env.STEAM_API;
const GELA = process.env.GELA;
const MATI = process.env.MATI;
const KNIGHT = process.env.KNIGHT;
const MIGUE = process.env.MIGUE;
const SPARKI = process.env.SPARKI;
const WOLF = process.env.WOLF;
/*fin de VARIABLES DE ENTERNO*/

const Dict = require("collections/dict");


const lookUpdates = require('./embedMessages/lookUpdates');
const {chicosUpdate, chicosStats, dummyUpdate} = require('./mongodb/mongo_connect');
const axios = require("axios");
const {Client, Collection} = require("discord.js");
const client = new Client();
//const hook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);
const fs = require('fs');
const { dummy } = require("./mongodb/schemas/mongo_schemas");

//url:https://discordjs.guide/command-handling/dynamic-commands.html#dynamically-executing-commands

const url_chicos = (steam_api, id) =>`http://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v1?key=${steam_api}&account_id=${id}`;
const get_match = (steam_api, match_id) => `http://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1?key=${steam_api}&match_id=${match_id}`;
const get_person_data = (steam_api, player_id) => `https://api.opendota.com/api/players/${player_id}?key_api=${steam_api}`;
const get_victory = (player_slot, radiant_win) => {
    if(player_slot < 100 && radiant_win == true){
        return true;
    }
    else if(player_slot > 100 && radiant_win == true){
        return false
    }
    else if(player_slot > 100 && radiant_win == false){
        return true;
    }
    else{
        return false;
    }
}

const chicos_id = new Dict();
chicos_id.set(GELA, "gela");
chicos_id.set(KNIGHT, "knight");
chicos_id.set(MIGUE, "migue");
chicos_id.set(MATI, "mati");
chicos_id.set(SPARKI, "sparki");
chicos_id.set(WOLF, "wolf")
const heroes_id = new Dict(JSON.parse(fs.readFileSync('./files/heroes_id.json')));


client.commands = new Collection();
const cooldowns = new Collection();
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for(const file of command_files){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

//Updatea al jugador con su ultimo game, solamente ese jugador es updateado si hay mas veo que hago
const manageNewMatches = async (match, id, channel) => {
    try{
        //db y api pedidas
        const chicos_update = await chicosUpdate.findOne({"account_id" : id});
        const match_jugado = await axios.get(get_match(STEAM_API, match.match_id))
        //Error checkers
        if(chicos_update == undefined) throw new Error("Error en chicos_update")
        if(match_jugado.status >= 400) throw new Error("Error +400 en el get_match() function")
        if(match_jugado.data.result.error) throw new Error("Error consiguiendo el match");

        //Set variables
        const match_id_update = chicos_update.match_id;
        const win = get_victory(match.player_slot, match_jugado.data.result.radiant_win);
        const player = match_jugado.data.result.players.filter(_ => _.account_id == id)[0]; //filtra usuarios y agarra al del id

        if(player === undefined) throw new Error(`El usuario ${chicos_id.get(id)} tiene perfil privado`);
        if(match_jugado.data.result.match_id == match_id_update){ console.log("Partidas son iguales"); return }

        //updatearUsuario.execute(match_jugado.data.result, player, id, win);
        const mensaje = lookUpdates.execute(match.match_id, chicos_update, win,
                        player, heroes_id.get(player.hero_id.toString()), "Ohaiho gosaimasu")

        channel.send({embed: mensaje});
        
    }catch(err){
        console.log(err)
    }
}

const updatearUsuario = (match, player, id, win, amigos) => {
    
    chicosStats.updateOne({"name" : chicos_id.get(String(id))['name']},
    {
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
    },
    {arrayFilters : [{"elem.name" : heroes_id.get(String(player['hero_id']))['name']}]}
    )

} 


//Funcion principal para recorrer a mis amigos con perfil publico
function main(channel) {
    let counter = 0, datos;
    setInterval(async () => {
        if(counter == 0){
            datos = await axios.get(url_chicos(STEAM_API, GELA));
            console.log(`match:${datos.data.result.matches[0].match_id} of gela`);
            manageNewMatches(datos.data.result.matches[0], GELA, channel);
            counter ++;
        }else if(counter == 1){
            datos = await axios.get(url_chicos(STEAM_API, MIGUE));
            console.log(`match:${datos.data.result.matches[0].match_id} of migue`);
            manageNewMatches(datos.data.result.matches[0], MIGUE,  channel);
            counter ++;
        }else if(counter == 2){
            datos = await axios.get(url_chicos(STEAM_API, KNIGHT));
            console.log(`match:${datos.data.result.matches[0].match_id} of knight`);
            manageNewMatches(datos.data.result.matches[0], KNIGHT ,channel);
            counter ++;
        }else if(counter == 3){
            datos = await axios.get(url_chicos(STEAM_API, SPARKI));
            console.log(`match:${datos.data.result.matches[0].match_id} of sparki`);
            manageNewMatches(datos.data.result.matches[0], SPARKI, channel);
            counter ++;
        }else if(counter == 4){
            datos = await axios.get(url_chicos(STEAM_API, MATI));
            console.log(`match:${datos.data.result.matches[0].match_id} of mati`);
            manageNewMatches(datos.data.result.matches[0], MATI, channel);
            counter ++;
        }else if(counter == 5){
            datos = await axios.get(url_chicos(STEAM_API, WOLF));
            console.log(`match:${datos.data.result.matches[0].match_id} of wolf`);
            manageNewMatches(datos.data.result.matches[0], WOLF, channel);
            counter = 0;
        }
    }, 5000)
}

client.once("ready", () => {
    const messageChannel = client.channels.cache.get("820306912280051804");
    /* Eliminar mensajes
    messageChannel.messages.fetch({around: "50" }, limit = 100).then(messages => {
        messageChannel.bulkDelete(messages);
    });
    */
  /*
   fs.readdirSync("./files/chicos_datas/").map(_ =>{ 
       const file = fs.readFileSync(`./files/chicos_datas/${_}`);
       const data = JSON.parse(file);
       chicosStats.create(data,(err) => {
           if(err) console.log(err);
           console.log("Created");
       })
   })

   
   //main(messageChannel)
   /*
   dummyUpdate.updateOne({id : 3}, {
            $inc : {"dummy_object.$[elem].number" : 2},
            $push : {"dummy_object.$[elem].arreglo" : [2]},
        
    },
    {
        arrayFilters : [{"elem.name" : "Denis"}],
    }, () =>{ 
            console.log("updated")
   })
   */
   /*
   dummyUpdate.findOne({id : 3}, (err, res) => {
       if(err) throw new Error(err);
       console.log(res)
   })
   $inc : {$cond :{
                    
                }},
   */

   /*
   dummyUpdate.updateOne(
        {
            id: 5, 
            dummy_object: {
                $elemMatch : {
                    name : "denis",
                    dummy_object : {
                        $all : [
                           {$elemMatch : {name : "mati"}}
                        ]
                    }   
                }
            },

        }, 
        {
        $inc : {"number" : 1},
        $inc : {"dummy_object.0.dummy_object.$[].number" : 1} 
        //Quiero recorrer el arreglo y updatear a x amigos
        },
        {arrayFilters : [{"elem.name" : 'mati'}], multi: true},
        (err, res) => {
            console.log("updated")
        }
    )
    */
    /*
    dummyUpdate.updateOne({id : 5}, )
    dummyUpdate.findOne({id : 5} , (err, res) => {
        console.log("Primer objecto", res.dummy_object[0])
        console.log("Segundo objecto", res.dummy_object[0].dummy_object[0])
    })
    */
   /*
    dummyUpdate.findOne(
        {
            id : 5,
            dummy_object : {$elemMatch : {name : 'denis'}}
        },
        (err, res) => console.log(res)
    )
    */
   //const project1 = {"name" : 1 , "heroes" : { $filter : {input :"$heroes", as :"hero", cond : {$eq : ["$$hero.name" , hero]}}}}
   //REGLAS
   //Solamente se puede pedir un documento, pero no modificar el documento pedido
   //Existen limitadas opciones de update que se pueden emplear y attributos que no podes usar
   /*
   [
    {"mati.name" : {$eq : 'mati'}},

   ]
   */
   const getAmigo = (amigos) => {
        diccionario = new Dict();
        amigos.forEach(_ => {
            diccionario[_ + '.name'] = {"$eq" : _} 
        })
        diccionario['heroe.name'] = {"$eq" : 'denis'}
        return diccionario
   }
   
   hola = getAmigo(['mati', 'gela'])
   console.log(hola)
   hola.map( _ => {
    console.log(_.toObject())
   })
   dummyUpdate.updateOne(
       {
           id : 5,
          
       },
       {
         
        $inc : {"dummy_object.$[heroe].dummy_object.$[mati].number" : 2}    
       },
       {
        multi:true,
        arrayFilters : [] ,
       },
       (err, res) => {
        if(res !== undefined) console.log("Update".toUpperCase()) 
        else console.log(err)
    })
       //Si no pones callback no se updatea
   
   
   dummyUpdate.findOne(
       {
           id: 5,
       },
       (err, res) => console.log(res.dummy_object[0])
   )
   
   //chicosStats.findOne({name : 'knight'}, {heroes : {$elemMatch : {name : "antimage"}}}, (err, res) => console.log(res));
/*
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
})*/

//main(messageChannel)
}); 

client.on("message", message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command_name = args.shift().toLowerCase();
    const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
    if(!command) return ;
    if(command.guild_only && message.channel.type === 'dm'){
        return message.reply('I can\'t execute that command inside Ds!');
    }
    if(command.args && !args.length){
        let reply = `Faltaron argumentos viejita, ${message.author}!`;
        if(command.usage){
            reply += `\nTendrias que usarlo de esta manera: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }
    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldown_amount = (command.cooldown || 3) * 1000;
    
    if(timestamps.has(message.author.id)){
        const expiration_time = timestamps.get(message.author.id) + cooldown_amount;
        if(now < expiration_time){
            const time_left = (expiration_time - now) / 1000;
            return message.reply(`Espera ${time_left.toFixed(1)}s viejita`);
        }
    }
    
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldown_amount);
    try{
        command.execute(message, args);
    }catch(err){
        
    }

});

client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});

client.login(BOT_TOKEN);


/*
  const cond_winrate = {
        $cond : {
            if : {$isArray :'$friends'},
            then: {
                $map :{
                    input : "$friends",
                    as : "amigos",
                    in : {$round : [{$multiply : [{$divide : ["$$amigos.wins", "$$amigos.total_matches"]}, 100]}, 2]}
                }
            },
            else: []
        }
  }
  const cond_amigo = {
        $cond : {
            if : {$isArray :'$friends'},
            then: {
                $map :{
                    input : "$friends",
                    as : "amigos",
                    in : "$$amigos.name"
                }
            },
            else: []
        }
  }
  const match = {name : "gela"};
  const project = {"name" : 1 , "heroes" : { $filter : {input :"$heroes", as :"hero", cond : {$eq : ["$$hero.name" , "oracle"]}}}}
  const project2 = {_id : null, 
                name      : 1,
                hero_name : "$heroes.name",
                avgKills  : {$avg : "$heroes.kills"}, 
                avgDeaths : {$avg : "$heroes.deaths"},
                avgAssists: {$avg : "$heroes.assists"},
                //amigos : {$isArray :'$heroes.friends'},
                avgWins   : {$round : [{$multiply : [{$divide : ["$heroes.wins", "$heroes.total_matches"]}, 100]}, 2]},
                amigo_winrate : cond_winrate,
                amigo_name : cond_amigo
                }
const project3 = {
        amigo_name      : cond_amigo,
        amigo_winrate   : cond_winrate,
        name            : 1,
        kills           : 1,
        deaths          : 1,
        assits          : 1,
        total_matches   : 1,
        avgWins         : {$round : [{$multiply : [{$divide : ["$wins", "$total_matches"]}, 100]}, 2]},
    }
    
chicosStats.aggregate([{$match : match},
                {$project : project3}
                ], 
                (err, res) => {
                if(err) return undefined
                console.log(res[0])});

            */
