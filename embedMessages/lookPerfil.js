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
                stats.amigo_name.length > 0 ? getFriends(stats.amigo_name, stats.amigo_winrate) : getRejected(stats),
            ]
        }
    }
}
const getFriends = (name, winrate) =>{ 
    const length = name.length;
    let chico_array = [];
    for(let x = 0; x < length ; x ++){
        chico_array.push([name[x], winrate[x]])
    }
    if(length == 0) return {}
    else return (
        chico_array.map(_ => (
            {
                name  : `Winrate con ${_[0]}`,
                value : _[1],
            }
        ))
    )
    
}
const getRejected = (stats) => {
    return {
        name : `Nadie del grupo jugo con ${stats.name} de ${stats.hero_name}`,
        value : 0,
    }
}