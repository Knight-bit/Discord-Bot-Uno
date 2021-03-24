module.exports = {
    execute(stats, perfil){
        return {
            color : 0x112212,
            title : `${stats.hero_name} stats de ${stats.name}`,
            author : {
                name : stats.hero_name,
                icon_url : perfil.avatar,
            },
            description : `El mejor champ de ${stats.name}`,
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

            ]
    }
    }
}
    