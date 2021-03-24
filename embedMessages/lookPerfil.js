module.exports = {
    execute(name, stats_perfil, stats){
        return {
            color : 0x232323,
            title : `${name} stats`,
            author : {
                name : name,
                icon_url : stats_perfil.avatar,
                url : `https://es.dotabuff.com/players/${stats_perfil.account_id}`
            },
            description : "El mejor carry de Chaco",
            fields : [
                {
                    name : `Total de kills que hizo ${name}`,
                    value : stats.kills,
                },
                {
                    name : `Total de muertes de ${name}`,
                    value : stats.deaths,
                },
                {
                    name : `Total de assistencias de ${name}`,
                    value : stats.assists,
                },
                {       
                    name : `Total de games`,
                    value : stats.total_matches,
                },
                {
                    name : "Win rate",
                    value : stats.avgWins,
                },
                
            ]
        }
    }
}