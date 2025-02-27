import {CoreMenu} from '@core/types';
import {Role} from '../main/authentication/models/role';

// ? DOC: http://localhost:7777/demo/vuexy-angular-admin-dashboard-template/documentation/guide/development/navigation-menus.html#interface

// @ts-ignore
export const menu: CoreMenu[] = [


    /*
        {
            id: 'logistique',
            type: 'section',
            title: 'Logistique',
            translate: 'MENU.LOGISTIQUE.SECTION',
            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
            icon: 'package',
            children: [
                {
                    id: 'Recap Chantier',
                    type: 'collapsible',
                    title: 'Recap Chantier',
                    translate: 'MENU.LOGISTIQUE.RECAP',
                    roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                    icon: 'sliders',
                    children: [
                        {
                            id: 'recapChantier',
                            title: 'Recap Chantier',
                            translate: 'MENU.LOGISTIQUE.RECAP.GENERAL',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'trello',
                            url: 'projets/logistique/recapChantier/RecapGeneral',
                        },
                    ]
                },
                {
                    id: 'mouvementJournalier',
                    type: 'collapsible',
                    title: 'Mouvement Vehicule',
                    translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER',
                    roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                    icon: 'aperture',
                    children: [
                        {
                            id: 'dashboardM',
                            title: 'Dashboard-Mouvement',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.DASHBOARDMVT',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'trello',
                            url: 'projets/logistique/vehiculeChantier/dashboard',
                        },
                        {
                            id: 'mouvement',
                            title: 'Mouvement Véhicule',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.MOUVEMENT',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'slack',
                            url: 'projets/logistique/vehiculeChantier/mouvement',
                        },
                        {
                            id: 'recap',
                            title: 'Recap Imputation',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.RECAP',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'slack',
                            url: 'projets/logistique/vehiculeChantier/recap',
                        },
                        {
                            id: 'vehicule',
                            title: 'Vehicule',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.VEHICULE',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'truck',
                            url: 'projets/logistique/vehiculeChantier/vehicule',
                        },
                        {
                            id: 'affaire',
                            title: 'Affaire',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.AFFAIRE',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'file-text',
                            url: 'projets/logistique/affaire',
                        },
                        {
                            id: 'chauffeur',
                            title: 'Chauffeur',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.CHAUFFEUR',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'user',
                            url: 'projets/logistique/vehiculeChantier/chauffeur/chauffeur-list',
                        },
                        {
                            id: 'fournisseur',
                            title: 'Fournisseur',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.FOURNISSEUR',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'briefcase',
                            url: 'projets/logistique/fournisseur',
                        },
                    ],
                },
                {
                    id: 'RendementEngin',
                    type: 'collapsible',
                    title: 'Mouvement Engin',
                    translate: 'MENU.LOGISTIQUE.ENGIN',
                    roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                    icon: 'truck',
                    children: [
                        {
                            id: 'enginMouvement',
                            title: 'Mouvement Engin ',
                            translate: 'MENU.LOGISTIQUE.ENGIN.MOUVEMENT',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'slack',
                            url: 'projets/logistique/enginChantier/mouvement',
                        },
                        {
                            id: 'recap',
                            title: 'Recap Imputation',
                            translate: 'MENU.LOGISTIQUE.MOUVEMENT_JOURNALIER.RECAP',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'slack',
                            url: 'projets/logistique/enginChantier/recap',
                        },
                        {
                            id: 'engin',
                            title: 'Engin',
                            translate: 'MENU.LOGISTIQUE.ENGIN.MACHINE',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'truck',
                            url: 'projets/logistique/enginChantier/engin',
                        },
                        {
                            id: 'chauffeur',
                            title: 'Chauffeur',
                            translate: 'MENU.LOGISTIQUE.ENGIN.CHAUFFEUR',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'user',
                            url: 'projets/logistique/enginChantier/chauffeur/chauffeur-list',
                        },

                    ]
                },
                {
                    id: 'LocationVehiculeEngin',
                    type: 'collapsible',
                    title: 'Location Vehicule Engin',
                    translate: 'MENU.LOGISTIQUE.LOCATION',
                    roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                    icon: 'layers',
                    children: [
                        {
                            id: 'LocationVehiculeEngin',
                            title: 'Location Vehicule Engin ',
                            translate: 'MENU.LOGISTIQUE.ENGIN.CHAUFFEUR',
                            type: 'item',
                            roles: [Role.ADMIN, Role.PDG, Role.DGA, Role.RESP_LOG, Role.ASSIST_LOG],
                            icon: 'layers',
                            url: 'projets/logistique/locationChantier/Location',
                        }
                    ]
                }
            ],
        },
    */
    {
        id: 'srbo',
        type: 'section',
        title: 'Bureau D\'ordre',
        translate: 'MENU.BO.SECTION',
        roles: [Role.ADMIN],
        icon: 'package',
        children: [
            {
                id: 'Entree',
                title: 'Entree',
                translate: 'MENU.BO.ENTREE',
                type: 'item',
                icon: 'slack',
                roles: [Role.ADMIN],
                url: 'projets/srbo/entree-add',
            },
            {
                id: 'Sortie',
                title: 'Sortie',
                translate: 'MENU.BO.SORTIE',
                type: 'item',
                icon: 'slack',
                roles: [Role.ADMIN],
                url: 'projets/logistique/enginChantier/recap',
            }
        ]
    },
    {
        id: 'caution',
        type: 'section',
        title: 'Caution',
        translate: 'MENU.CAUTION.SECTION',
        roles: [Role.ADMIN],
        icon: 'package',
        children: [
            {
                id: 'lc',
                title: 'Ligne Caution',
                translate: 'MENU.CAUTION.LC',
                type: 'item',
                icon: 'slack',
                roles: [Role.ADMIN],
                url: 'projets/caution/caution-add',
            },
        ]
    },






    {
        id: 'rh',
        type: 'section',
        title: 'RH',
        translate: 'MENU.RH.SECTION',
        roles: [Role.ADMIN],
        icon: 'package',
        children: [
            {
                id: 'admin',
                title: 'Administration',
                translate: 'MENU.RH.ADMIN',
                type: 'collapsible',
                icon: 'slack',
                roles: [Role.ADMIN],
                children: [
                    {
                        id: 'EmplyeesId',
                        title: 'Eployees',
                        translate: 'MENU.RH.ADMIN.EMPLOYEES',
                        type: 'item',
                        icon: 'slack',
                        roles: [Role.ADMIN],
                        url: '/projets/rh/employees',
                    },
                    {
                        id: 'CongeId',
                        title: 'Conge',
                        translate: 'MENU.RH.ADMIN.CONGE',
                        type: 'item',
                        icon: 'slack',
                        roles: [Role.ADMIN],
                        url: '/projets/rh/addEmploye',
                    },
                    {
                        id: 'Absence',
                        title: 'Absence',
                        translate: 'MENU.RH.ADMIN.ABSENCE',
                        type: 'item',
                        icon: 'slack',
                        roles: [Role.ADMIN],
                        url: '/projets/rh/absence',
                    }
                ]
            },
            {
                id: 'formation',
                title: 'Formation & Certificats',
                translate: 'MENU.RH.FORMATION',
                type: 'item',
                icon: 'slack',
                roles: [Role.ADMIN],
                url: 'projets/rh/formation',
            },
            {
                id: 'pointage',
                title: 'Pointage',
                translate: 'MENU.RH.POINTAGE',
                type: 'item',
                icon: 'slack',
                roles: [Role.ADMIN],
                url: 'projets/rh/pointage',
            }
        ]
    },














//Projet Rapport Activity

    {
        id: 'RapportActivity',
        type: 'section',
        title: 'Rapport Activity',
        roles: [Role.ADMIN],
        icon: 'package',
        children: [

            {
                id: 'dashboard',
                title: 'Dashboard',
                type: 'item',
                icon: 'sliders',
                roles: [Role.ADMIN],
                url: 'projets/rapport-activity/dashboard',
            },

            {
                id: 'planning-taches',
                title: 'Planifier Les Taches',
                type: 'collapsible',
                icon: 'calendar',
                roles: [Role.ADMIN],
                children: [
                    {
                        id: 'tache-list',
                        title: 'Liste des Tâches',
                        type: 'item',
                        icon: 'list',
                        roles: [Role.ADMIN],
                        url: 'projets/rapport-activity/taches',
                    },




                ]
            },



        ]
    }


];
