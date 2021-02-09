module.exports = {
	description : 'Borra n cantidad de mensajes entre 1 y 99',
	name: 'prune',
	execute(message, args){
		const amount = parseInt(args[0]) + 1;
		if(isNaN(amount)) return message.reply("That doesn't seem to be a valid number");
		else if(amount <= 1 || amount > 100) return message.reply("You need to input  number between 2 and 100.");
		message.channel.bulkDelete(amount);
	}
}