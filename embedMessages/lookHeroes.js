module.exports = {
    execute(name, heroe_array, url_jugador, player_id){
        return {
            color : 0x121212,
            title : `Stats de ${name} con ${heroe_array.localized_name}`,
            author : {
                name : name,
                icon_url : url_jugador, 
                url: "https://es.dotabuff.com/players/" + player_id,
            },
            fields: [
                {
                    name: "Kills",
                    value : heroe_array.kills,
                    inline: true,
                },
                {
                    name: "Deaths",
                    value : heroe_array.deaths,
                    inline: true,
                },
                {
                    name: "Assists",
                    value : heroe_array.kills,
                    inline: true,
                },
            ]
        }
    }
}