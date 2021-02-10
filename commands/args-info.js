module.exports = {
    name: 'args-info',
    description: 'Devuelve un arreglo con los comandos que tiraste',
    args: true,
    execute(message, args){
        if(args[0] === 'foo'){
            return message.channel.send('bar');
        }
        message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
    }
}