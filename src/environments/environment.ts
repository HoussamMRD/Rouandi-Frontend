// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// @ts-ignore
// @ts-ignore
export const environment = {
    production: false,
    hmr: false,
    apiUrl: 'http://localhost:4000',

    authHost: 'http://localhost:6108',
    authCmdHost: 'http://localhost:6108/jwt/commands',
    authQueryHost: 'http://localhost:6108/jwt/queries',

    
    // partie Rapport d'activité
    // planning
    
    //Tache
    Tache: {
        command: {
          create: 'http://localhost:6110/api/command/taches/createTache',
          update: 'http://localhost:6110/api/command/taches/updateTache/',
          delete: 'http://localhost:6110/api/command/taches/deleteTache/'
        },
        query: {
          getById: 'http://localhost:6110/api/query/taches/getTacheById/',
          getAll: 'http://localhost:6110/api/query/taches/getAllTaches' ,
            getByAffaire: 'http://localhost:6110/api/query/taches/getAllTachesByNomAffaire/',
        }
    },


    //TacheSuivi
    TacheSuivi: {
        command: {
          create: 'http://localhost:6110/api/command/tachesuivis/createTacheSuivi',
          update: 'http://localhost:6110/api/command/tachesuivis/updateTacheSuivi/',
          delete: 'http://localhost:6110/api/command/tachesuivis/deleteTacheSuivi/'
        },
        query: {
          getById: 'http://localhost:6110/api/query/tachesuivis/getTacheSuiviById',
          getAll: 'http://localhost:6110/api/query/tachesuivis/getAllTacheSuivis',
            getByTacheId: 'http://localhost:6110/api/query/tachesuivis/getTacheSuivisByTacheId'


        }
    },




    //Affaire
    Affaire: {
        command : {
            create: 'http://localhost:6110/api/command/affaires/createAffaire',
            update: 'http://localhost:6110/api/command/affaires/updateAffaire',
            delete: 'http://localhost:6110/api/command/affaires/deleteAffaire/'
        },
        query: {
            getById: 'http://localhost:6110/api/query/affaires/getAffaireById',
            getAll: 'http://localhost:6110/api/query/affaires/getAllAffaires',
            getNomsAffaires : 'http://localhost:6110/api/query/affaires/getNomsAffaires'

        }
    },




    //MainOeuvre
    MainOeuvre: {
        command: {
          create: 'http://localhost:6110/api/command/mainOeuvres/createMainOeuvre',
          update: 'http://localhost:6110/api/command/mainOeuvres/updateMainOeuvre',
          delete: 'http://localhost:6110/api/command/mainOeuvres/deleteMainOeuvre/'
        },
        query: {
          getById: 'http://localhost:6110/api/query/mainOeuvres/getMainOeuvreById',
          getAll: 'http://localhost:6110/api/query/mainOeuvres/getAllMainOeuvres'
        }
    },



    //Article
    Article: {
        command: {
          create: 'http://localhost:6110/api/command/articles/createArticle',
          update: 'http://localhost:6110/api/command/articles/updateArticle',
          delete: 'http://localhost:6110/api/command/articles/deleteArticle/'
        },
        query: {
          getById: 'http://localhost:6110/api/query/articles/getArticleById',
          getAll: 'http://localhost:6110/api/query/articles/getAllArticles'
        }
    },




  //Engin
  Engin: {
    command: {
      create: 'http://localhost:6110/api/command/engins/createEngin',
      update: 'http://localhost:6110/api/command/engins/updateEngin',
      delete: 'http://localhost:6110/api/command/engins/deleteEngin/'
    },
    query: {
      getById: 'http://localhost:6110/api/query/engins/getEnginById',
      getAll: 'http://localhost:6110/api/query/engins/getAllEngins'
    }
  },


  //Lot
  Lot: {
    command: {
      create: 'http://localhost:6110/api/command/lots/createLot',
      update: 'http://localhost:6110/api/command/lots/updateLot',
      delete: 'http://localhost:6110/api/command/lots/deleteLot/'
    },
    query: {
      getById: 'http://localhost:6110/api/query/lots/getLotById',
      getAll: 'http://localhost:6110/api/query/lots/getAllLots'
    }
  },



























































    // Add missing properties
    employees: {
        query: '/employees',
        save: '/employees',
        update: '/employees',
        delete: '/employees'
    },
    competnece: {
        save: '/competences',
        delete: '/competences',
        update: '/competences'
    },
    coordonnees: {
        query: '/coordonnees',
        update: '/coordonnees'
    },
    diplome: {
        save: '/diplomes',
        delete: '/diplomes',
        update: '/diplomes'
    },
    experience: {
        save: '/experiences',
        delete: '/experiences',
        update: '/experiences'
    },
    formation: {
        save: '/formations',
        delete: '/formations',
        update: '/formations'
    },
    departements: '/departements',
    postes: '/postes',
    societe: '/societes',

















};




