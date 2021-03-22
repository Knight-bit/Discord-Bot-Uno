const {apoyodb} = require("../mongodb/mongo_connect");
const APOYODB = process.env.APOYODB;

module.exports = {
    name : "apoyo",
    aliases : ['mensajedeodio', 'amor', 'apoyonomoral', 'puteada', 'cariño'],
    descripcion : 'Todos necesitamos el cariño de ella',
    execute(message, args){
        if(args == 0) {message.channel.send("Falta el mensaje de amor y cariño"); return}
        const apoyo_moral = args.join(" ").replace(/[<,>,$]*/gi, "");
        console.log(apoyo_moral);
        sendToDb(message, apoyo_moral);
    }
}

const sendToDb = async (bot, message ) => {
    const enviado = await apoyodb.findOneAndUpdate({_id : APOYODB}, {$push : {message : message}})
    if(enviado !== null){ bot.channel.send("Mensaje \"" + message + "\" enviado con exito papu")}
    else{ bot.channel.send("El mensaje tuvo complicaciones")}
}