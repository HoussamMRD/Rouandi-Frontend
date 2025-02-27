export interface Competence {
    id: number;
    name: string;
}



export interface Poste {
    id: number;
    intitule: string;
    minSalaire?: number | null;
    maxSalaire?: number | null;
    description: string;
    niveau: string;
    experience: number;
    competences: Competence[];

}

export interface Department {
    id: number;
    deptCode: string;
    deptName: string;
    firstTransactionTime: string;
    lastTransactionTime: string;
    lunchBreakTime: string;
    morningDuration: number;
    pmDuration: number;
    durationDay: number;
    exposureTime: number;
    actif: boolean;
    responsable?: any;
}

export interface Coordonnees {
    id: number;
    adresse: string;
    telephone: string;
    portable: string;
    email: string;
    codePostal: number;
    nomBanque: string;
    rib: number;
    iban: string;
    paiementMode: string;
}

export interface Diplome {
    specialite: String;
    etablissement: String;
    niveauDiplome: String;
    anneeObtention: String;
    employeId: number;
}

export interface Formation {
    formation: string;
    niveau: string;
    organisme: string;
    duree: string;
}

export interface Experience {
    poste: string;
    entreprise: string;
    duration: number;
}

export interface Employee {
    id: number;
    matricule: String;
    nom: String;
    prenom: String;
    civilite: String;
    dateNaissance: Date;
    nationalite: String;
    SocieteName: String;
    SocieteCode: String;
    department: Department;
    poste: Poste;
    nombreEnfants: number;
    coordonnees: Coordonnees;
    competences: Competence[];
    formations: Formation[];
    diplomes: Diplome[];
    experiences: Experience[];
}
