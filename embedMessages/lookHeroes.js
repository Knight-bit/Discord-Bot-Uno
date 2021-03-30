module.exports = {
    reject : false,
    execute(stats, perfil){
        return {
            color : 0x112212,
            title : `${stats.hero_name} stats de ${perfil.personaname}`,
            author : {
                name : stats.hero_name,
                icon_url : perfil.avatar,
            },
            description : `El mejor champ de ${perfil.personaname}`,
            fields :[
                {
                    name : `Average kills`,
                    value : stats.avg_kills,
                    
                },
                {
                    name : `Average deaths`,
                    value : stats.avg_deaths,
                    
                },
                {
                    name : `Average assists`,
                    value : stats.avg_assists,
                    
                },
                stats.amigo_name.length > 0 ? getFriends(stats.amigo_name, stats.amigo_winrate) : getRejected(stats, perfil),
            ],
        }
    }
}

const getRejected = (stats, perfil) => {
    return {
        name : `Nadie del grupo jugo con ${perfil.personaname} de ${stats.hero_name}`,
        value : 0,
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