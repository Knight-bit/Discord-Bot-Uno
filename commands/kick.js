module.exports = {
    name: "kick",
    description : "intento de patear a un usuario",
    guild_only: true,
    execute(message, args){
        const taggedUser = message.mentions.users.first();
        message.channel.send(`You wanted to kick: ${taggedUser.username}`);
    }
}