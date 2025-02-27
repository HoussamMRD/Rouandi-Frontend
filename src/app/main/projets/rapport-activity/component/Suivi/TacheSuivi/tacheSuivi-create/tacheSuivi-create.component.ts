import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TacheSuiviService } from '../../../../services/Suivi/TacheSuivi/tacheSuivi.service';
import Swal from 'sweetalert2';
import { environment } from '../../../../../../../../environments/environment';
import { TacheSuivi, LotSuivi, ArticleSuivi, MainOeuvreSuivi, EnginSuivi } from '../../../../models/Suivi/TacheSuivi';
import { Statut } from '../../../../../../../../@core/enum/RA-Enums/Statut';
import { SrManagerService } from '../../../../../sr-manager.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-tacheSuivi-create',
    templateUrl: './tacheSuivi-create.component.html',
    styleUrls: ['./tacheSuivi-create.component.scss']
})
export class TacheSuiviAddComponent implements OnInit {
    @Input() tacheId: number;
    @Input() tacheSuivi: TacheSuivi = {
        idTacheSuivi: 0,
        dureeTacheSuivi: 0,
        statut: Statut.EN_COURS,
        idTache: 0,
        lotsSuivi: [],
        mainOeuvresSuivi: [],
        enginsSuivi: []
    };
    @Output() tacheSuiviSaved = new EventEmitter<void>();
    currentSection: number = 1;
    steps = [
        { description: 'Lots & Articles', icon: 'bi-boxes' },
        { description: 'Main d\'Œuvre', icon: 'bi-person-gear' },
        { description: 'Engins', icon: 'bi-truck' }
    ];
    tacheDetails: any = {};
    lotOptions: string[] = [];
    fonctionMOOptions: string[] = [];
    typeEnginOptions: string[] = [];
    todayDate: string = new Date().toISOString().split('T')[0];
    debugMode: boolean = true;
    isTacheTermine: boolean = false;
    isLoading: boolean = false;
    articleOptions: { [key: string]: { name: string, unit: string, quantiteArticle: number, quantiteArticleconsomme: number, quantiteArticleRestant: number }[] } = {};
    selectedLots: string[] = [];
    selectedArticles: { [lot: string]: string[] } = {};
    selectedMainOeuvres: string[] = [];
    selectedEngins: string[] = [];

    constructor(
        private tacheSuiviService: TacheSuiviService,
        private srManagerService: SrManagerService,
        private toastr: ToastrService,
        public activeModal: NgbActiveModal
    ) {}

    ngOnInit(): void {
        if (this.tacheId) {
            this.tacheSuivi.idTache = this.tacheId;
            this.fetchTacheDetails();
            this.checkTacheStatut();
        }
        if (!this.tacheSuivi.lotsSuivi.length) {
            this.addLot();
        }
    }

    fetchTacheDetails(): void {
        this.srManagerService.getResources<any>(`${environment.Tache.query.getById}${this.tacheId}`).subscribe(
            (tache) => {
                this.tacheDetails = tache;
                console.log('Tache Details:', JSON.stringify(tache, null, 2));
                tache.lots.forEach(lot => {
                    lot.articles.forEach(article => {
                        console.log(`Article ${article.nomArticle}: quantiteArticle=${article.quantiteArticle}, quantiteConsomme=${article.quantiteArticleconsomme}, quantiteRestant=${article.quantiteArticleRestant}`);
                    });
                });
                this.lotOptions = tache.lots.map(lot => lot.nomLot);
                this.articleOptions = {};
                tache.lots.forEach(lot => {
                    this.articleOptions[lot.nomLot] = lot.articles.map(article => ({
                        name: article.nomArticle,
                        unit: article.uniteArticle,
                        quantiteArticle: article.quantiteArticle,
                        quantiteArticleconsomme: article.quantiteArticleconsomme,
                        quantiteArticleRestant: article.quantiteArticleRestant
                    }));
                });
                this.fonctionMOOptions = tache.mainOeuvres.map(mo => mo.fonctionMO);
                this.typeEnginOptions = tache.engins.map(engin => engin.typeEngin);
                // Initialize selected items
                this.tacheSuivi.lotsSuivi.forEach(lot => {
                    if (lot.nomLotSuivi) {
                        this.selectedLots.push(lot.nomLotSuivi);
                        this.selectedArticles[lot.nomLotSuivi] = lot.articlesSuivi.map(a => a.nomArticleSuivi).filter(a => a);
                    }
                });
                this.tacheSuivi.mainOeuvresSuivi.forEach(mo => {
                    if (mo.fonctionMOSuivi) {
                        this.selectedMainOeuvres.push(mo.fonctionMOSuivi);
                    }
                });
                this.tacheSuivi.enginsSuivi.forEach(engin => {
                    if (engin.typeEnginSuivi) {
                        this.selectedEngins.push(engin.typeEnginSuivi);
                    }
                });
            },
            (error: HttpErrorResponse) => {
                console.error('Error fetching Tache details:', error);
                this.toastr.error(`Erreur lors de la récupération des détails de la Tâche ${this.tacheId}`);
            }
        );
    }

    // Helper methods to get field values
    getArticleField(nomLot: string, nomArticle: string, field: string): number {
        const article = this.articleOptions[nomLot]?.find(a => a.name === nomArticle);
        return article ? article[field] || 0 : 0;
    }

    getMainOeuvreField(fonctionMO: string, field: string): number {
        const mainOeuvre = this.tacheDetails.mainOeuvres?.find(mo => mo.fonctionMO === fonctionMO);
        return mainOeuvre ? mainOeuvre[field] || 0 : 0;
    }

    getEnginField(typeEngin: string, field: string): number {
        const engin = this.tacheDetails.engins?.find(e => e.typeEngin === typeEngin);
        return engin ? engin[field] || 0 : 0;
    }

    // Lot Methods
    selectLot(lotIndex: number, lotName: string): void {
        if (this.isTacheTermine) return;
        const lot = this.tacheSuivi.lotsSuivi[lotIndex];
        lot.nomLotSuivi = lotName;
        this.selectedLots.push(lotName);
        this.onLotChange(lotIndex);
    }

    clearLot(lotIndex: number): void {
        const lot = this.tacheSuivi.lotsSuivi[lotIndex];
        this.selectedLots = this.selectedLots.filter(l => l !== lot.nomLotSuivi);
        this.selectedArticles[lot.nomLotSuivi] = [];
        lot.nomLotSuivi = '';
        lot.articlesSuivi = [];
    }

    getAvailableLots(): string[] {
        return this.lotOptions.filter(lot => !this.selectedLots.includes(lot));
    }

    // Article Methods
    selectArticle(lotIndex: number, articleIndex: number, articleOption: { name: string, unit: string }): void {
        if (this.isTacheTermine) return;
        const article = this.tacheSuivi.lotsSuivi[lotIndex].articlesSuivi[articleIndex];
        article.nomArticleSuivi = articleOption.name;
        article.uniteArticleSuivi = articleOption.unit;
        if (!this.selectedArticles[this.tacheSuivi.lotsSuivi[lotIndex].nomLotSuivi]) {
            this.selectedArticles[this.tacheSuivi.lotsSuivi[lotIndex].nomLotSuivi] = [];
        }
        this.selectedArticles[this.tacheSuivi.lotsSuivi[lotIndex].nomLotSuivi].push(articleOption.name);
    }

    clearArticle(lotIndex: number, articleIndex: number): void {
        const lot = this.tacheSuivi.lotsSuivi[lotIndex];
        const article = lot.articlesSuivi[articleIndex];
        this.selectedArticles[lot.nomLotSuivi] = this.selectedArticles[lot.nomLotSuivi].filter(a => a !== article.nomArticleSuivi);
        article.nomArticleSuivi = '';
        article.uniteArticleSuivi = '';
        article.quantiteConsommeArticleSuivi = 0;
        article.dureeArticleSuivi = 0;
    }

    getAvailableArticles(nomLot: string): { name: string, unit: string, quantiteArticle: number, quantiteArticleconsomme: number, quantiteArticleRestant: number }[] {
        return this.articleOptions[nomLot]?.filter(a => !this.selectedArticles[nomLot]?.includes(a.name)) || [];
    }

    // Main d'Œuvre Methods
    selectMainOeuvre(moIndex: number, fonction: string): void {
        if (this.isTacheTermine) return;
        const mo = this.tacheSuivi.mainOeuvresSuivi[moIndex];
        mo.fonctionMOSuivi = fonction;
        this.selectedMainOeuvres.push(fonction);
    }

    clearMainOeuvre(moIndex: number): void {
        const mo = this.tacheSuivi.mainOeuvresSuivi[moIndex];
        this.selectedMainOeuvres = this.selectedMainOeuvres.filter(m => m !== mo.fonctionMOSuivi);
        mo.fonctionMOSuivi = '';
        mo.nbrMOSuivi = 0;
    }

    getAvailableMainOeuvres(): string[] {
        return this.fonctionMOOptions.filter(mo => !this.selectedMainOeuvres.includes(mo));
    }

    // Engin Methods
    selectEngin(enginIndex: number, typeEngin: string): void {
        if (this.isTacheTermine) return;
        const engin = this.tacheSuivi.enginsSuivi[enginIndex];
        engin.typeEnginSuivi = typeEngin;
        this.selectedEngins.push(typeEngin);
    }

    clearEngin(enginIndex: number): void {
        const engin = this.tacheSuivi.enginsSuivi[enginIndex];
        this.selectedEngins = this.selectedEngins.filter(e => e !== engin.typeEnginSuivi);
        engin.typeEnginSuivi = '';
        engin.nbrEnginSuivi = 0;
    }

    getAvailableEngins(): string[] {
        return this.typeEnginOptions.filter(engin => !this.selectedEngins.includes(engin));
    }

    async validateSection(section: number): Promise<void> {
        if (this.isTacheTermine) {
            this.toastr.error('Action bloquée : la tâche est terminée.');
            return;
        }

        if (section === 1) {
            if (!this.tacheSuivi.lotsSuivi.length) {
                this.toastr.error('Ajoutez au moins un lot');
                return;
            }
            for (let lot of this.tacheSuivi.lotsSuivi) {
                if (!lot.nomLotSuivi ||
                    lot.articlesSuivi.some(a => !a.nomArticleSuivi || !a.uniteArticleSuivi ||
                        a.dureeArticleSuivi < 0 || a.quantiteConsommeArticleSuivi < 0)) {
                    this.toastr.error('Complétez tous les champs des lots et articles');
                    return;
                }
                for (

                    let article of lot.articlesSuivi) {
                    const articleOption = this.articleOptions[lot.nomLotSuivi]?.find(a => a.name === article.nomArticleSuivi);
                    if (articleOption && article.quantiteConsommeArticleSuivi > articleOption.quantiteArticleRestant) {
                        const result = await Swal.fire({
                            title: 'Quantité Excessive',
                            text: `La quantité consommée (${article.quantiteConsommeArticleSuivi}) dépasse la quantité restante (${articleOption.quantiteArticleRestant}) pour l'article: ${article.nomArticleSuivi}. Voulez-vous continuer ?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Oui, continuer',
                            cancelButtonText: 'Non, corriger',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33'
                        });
                        if (!result.isConfirmed) {
                            return;
                        }
                    }
                }
            }
            this.currentSection = 2;
        } else if (section === 2) {
            if (this.tacheSuivi.mainOeuvresSuivi.some(mo => !mo.fonctionMOSuivi || mo.nbrMOSuivi <= 0)) {
                this.toastr.error('Complétez tous les champs de la main d\'œuvre');
                return;
            }
            for (let mo of this.tacheSuivi.mainOeuvresSuivi) {
                const moOption = this.tacheDetails.mainOeuvres?.find(m => m.fonctionMO === mo.fonctionMOSuivi);
                if (moOption && mo.nbrMOSuivi > moOption.nbrMORestant) {
                    const result = await Swal.fire({
                        title: 'Nombre Excessif',
                        text: `Le nombre consommé (${mo.nbrMOSuivi}) dépasse le nombre restant (${moOption.nbrMORestant}) pour la fonction: ${mo.fonctionMOSuivi}. Voulez-vous continuer ?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Oui, continuer',
                        cancelButtonText: 'Non, corriger',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33'
                    });
                    if (!result.isConfirmed) {
                        return;
                    }
                }
            }
            this.currentSection = 3;
        }
    }
    checkTacheStatut(): void {
        this.srManagerService.getResources<any>(`${environment.Tache.query.getById}${this.tacheId}`).subscribe(
            (tache) => {
                if (tache.statut === Statut.TERMINE) {
                    this.isTacheTermine = true;
                    this.toastr.warning('Cette tâche est déjà terminée. Vous ne pouvez pas ajouter de nouveaux suivis.');
                }
            },
            (error: HttpErrorResponse) => {
                console.error('Error checking Tache statut:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    error: error.error
                });
                const errorMessage = error.status === 404 ? `Tâche avec ID ${this.tacheId} non trouvée` : 'Erreur lors de la vérification du statut de la tâche';
                this.toastr.error(errorMessage);
            }
        );
    }

    goToSection(section: number): void {
        if (section >= 1 && section <= this.steps.length && !this.isTacheTermine) {
            this.currentSection = section;
        }
    }

    async submitForm(): Promise<void> {
        if (this.isTacheTermine) {
            this.toastr.error('Impossible d\'enregistrer : la tâche est terminée.');
            return;
        }
        if (this.isLoading) return;
        this.isLoading = true;

        for (let engin of this.tacheSuivi.enginsSuivi) {
            if (!engin.typeEnginSuivi || engin.nbrEnginSuivi <= 0) {
                this.toastr.error('Complétez tous les champs des engins');
                this.isLoading = false;
                return;
            }
            const enginOption = this.tacheDetails.engins?.find(e => e.typeEngin === engin.typeEnginSuivi);
            if (enginOption && engin.nbrEnginSuivi > enginOption.nbrEnginRestant) {
                const result = await Swal.fire({
                    title: 'Nombre Excessif',
                    text: `Le nombre consommé (${engin.nbrEnginSuivi}) dépasse le nombre restant (${enginOption.nbrEnginRestant}) pour l'engin: ${engin.typeEnginSuivi}. Voulez-vous continuer ?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Oui, continuer',
                    cancelButtonText: 'Non, corriger',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33'
                });
                if (!result.isConfirmed) {
                    this.isLoading = false;
                    return;
                }
            }
        }

        this.tacheSuivi.dureeTacheSuivi = this.tacheSuivi.lotsSuivi.reduce((sum, lot) => {
            lot.dureeLotSuivi = lot.articlesSuivi.reduce((acc, article) => acc + (article.dureeArticleSuivi ?? 0), 0);
            return sum + (lot.dureeLotSuivi ?? 0);
        }, 0);

        try {
            const result = await Swal.fire({
                title: 'Dernier Suivi ?',
                text: 'Est-ce le dernier suivi pour cette tâche ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Oui, dernier suivi',
                cancelButtonText: 'Non, continuer',
                confirmButtonColor: '#96142d',
                cancelButtonColor: '#4b5563'
            });
            this.tacheSuivi.statut = result.isConfirmed ? Statut.TERMINE : Statut.EN_COURS;
            await this.verifyTacheExists();
            const serviceMethod = this.tacheSuivi.idTacheSuivi ?
                this.tacheSuiviService.updateTacheSuivi(this.tacheSuivi) :
                this.tacheSuiviService.createTacheSuivi(this.tacheSuivi);
            serviceMethod.subscribe(
                (response) => {
                    if (this.tacheSuivi.statut === Statut.TERMINE) {
                        this.updateTacheStatut(this.tacheSuivi.idTache, Statut.TERMINE);
                    }
                    this.toastr.success(this.tacheSuivi.idTacheSuivi ? 'Suivi mis à jour avec succès' : 'Suivi créé avec succès');
                    this.tacheSuiviSaved.emit();
                    this.activeModal.close('success');
                    this.fetchTacheDetails();
                },
                (error: HttpErrorResponse) => {
                    console.error('Error saving TacheSuivi:', {
                        status: error.status,
                        statusText: error.statusText,
                        message: error.message,
                        error: error.error
                    });
                    const errorMessage = error.error?.message || error.message || 'Erreur lors de la sauvegarde du suivi';
                    this.toastr.error(errorMessage);
                }
            );
        } catch (error) {
            console.error('Error in submitForm:', error);
            this.toastr.error('Erreur lors de l\'exécution du formulaire');
        } finally {
            this.isLoading = false;
        }
    }

    private async verifyTacheExists(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.srManagerService.getResources<any>(`${environment.Tache.query.getById}${this.tacheSuivi.idTache}`).subscribe(
                () => resolve(),
                (error: HttpErrorResponse) => {
                    console.error('Error verifying Tache existence:', {
                        status: error.status,
                        statusText: error.statusText,
                        message: error.message,
                        error: error.error
                    });
                    const errorMessage = error.status === 404 ? `Tâche avec ID ${this.tacheSuivi.idTache} non trouvée` : 'Erreur lors de la vérification de l\'existence de la tâche';
                    this.toastr.error(errorMessage);
                    reject(error);
                }
            );
        });
    }

    private updateTacheStatut(tacheId: number, statut: string): void {
        this.srManagerService.getResources<any>(`${environment.Tache.query.getById}${tacheId}`).subscribe(
            (tache) => {
                const updatedTache = { ...tache, statut };
                this.srManagerService.putRessource(
                    `${environment.Tache.command.update}${tacheId}`,
                    updatedTache
                ).subscribe(
                    () => {
                        if (this.debugMode) {
                            console.log(`Tache ${tacheId} updated to statut: ${statut}`);
                        }
                    },
                    (error) => {
                        console.error('Error updating Tache statut:', error);
                        this.toastr.error('Erreur lors de la mise à jour du statut de la tâche');
                    }
                );
            },
            (error) => {
                console.error('Error fetching Tache for update:', error);
                this.toastr.error('Erreur lors de la récupération de la tâche');
            }
        );
    }

    addLot(): void {
        this.tacheSuivi.lotsSuivi.push({
            idLotSuivi: 0,
            nomLotSuivi: '',
            articlesSuivi: [],
            dureeLotSuivi: 0
        });
    }

    addArticle(lotIndex: number): void {
        this.tacheSuivi.lotsSuivi[lotIndex].articlesSuivi.push({
            idArticleSuivi: 0,
            nomArticleSuivi: '',
            quantiteConsommeArticleSuivi: 0,
            quantiteRealiseeCetteSemaine: 0,
            dureeArticleSuivi: 0,
            uniteArticleSuivi: ''
        });
    }

    removeLot(lotIndex: number): void {
        if (this.tacheSuivi.lotsSuivi.length > 1) {
            const lot = this.tacheSuivi.lotsSuivi[lotIndex];
            this.selectedLots = this.selectedLots.filter(l => l !== lot.nomLotSuivi);
            this.selectedArticles[lot.nomLotSuivi] = [];
            this.tacheSuivi.lotsSuivi.splice(lotIndex, 1);
        }
    }

    removeArticle(lotIndex: number, articleIndex: number): void {
        if (this.tacheSuivi.lotsSuivi[lotIndex].articlesSuivi.length > 0) {
            const article = this.tacheSuivi.lotsSuivi[lotIndex].articlesSuivi[articleIndex];
            this.selectedArticles[this.tacheSuivi.lotsSuivi[lotIndex].nomLotSuivi] =
                this.selectedArticles[this.tacheSuivi.lotsSuivi[lotIndex].nomLotSuivi].filter(a => a !== article.nomArticleSuivi);
            this.tacheSuivi.lotsSuivi[lotIndex].articlesSuivi.splice(articleIndex, 1);
        }
    }

    addMainOeuvre(): void {
        this.tacheSuivi.mainOeuvresSuivi.push({
            idMOSuivi: 0,
            fonctionMOSuivi: '',
            nbrMOSuivi: 0
        });
    }

    removeMainOeuvre(moIndex: number): void {
        const mo = this.tacheSuivi.mainOeuvresSuivi[moIndex];
        this.selectedMainOeuvres = this.selectedMainOeuvres.filter(m => m !== mo.fonctionMOSuivi);
        this.tacheSuivi.mainOeuvresSuivi.splice(moIndex, 1);
    }

    addEngin(): void {
        this.tacheSuivi.enginsSuivi.push({
            idEnginSuivi: 0,
            typeEnginSuivi: '',
            nbrEnginSuivi: 0
        });
    }

    removeEngin(enginIndex: number): void {
        const engin = this.tacheSuivi.enginsSuivi[enginIndex];
        this.selectedEngins = this.selectedEngins.filter(e => e !== engin.typeEnginSuivi);
        this.tacheSuivi.enginsSuivi.splice(enginIndex, 1);
    }

    onLotChange(lotIndex: number): void {
        const lot = this.tacheSuivi.lotsSuivi[lotIndex];
        lot.articlesSuivi = [];
        if (this.articleOptions[lot.nomLotSuivi]?.length > 0) {
            this.addArticle(lotIndex);
        }
    }

    isFormValid(): boolean {
        if (this.isTacheTermine) return false;
        if (this.currentSection === 1) {
            return this.tacheSuivi.lotsSuivi.every(lot =>
                lot.nomLotSuivi &&
                lot.articlesSuivi.every(article =>
                    article.nomArticleSuivi &&
                    article.uniteArticleSuivi &&
                    article.dureeArticleSuivi >= 0 &&
                    article.quantiteConsommeArticleSuivi >= 0
                )
            );
        } else if (this.currentSection === 2) {
            return this.tacheSuivi.mainOeuvresSuivi.every(mo =>
                mo.fonctionMOSuivi && mo.nbrMOSuivi > 0
            );
        } else if (this.currentSection === 3) {
            return this.tacheSuivi.enginsSuivi.every(engin =>
                engin.typeEnginSuivi && engin.nbrEnginSuivi > 0
            );
        }
        return false;
    }


    updateQuantiteRealisee(lotIndex: number, articleIndex: number): void {
        const lot = this.tacheSuivi.lotsSuivi[lotIndex];
        const article = lot.articlesSuivi[articleIndex];
        const articleOption = this.articleOptions[lot.nomLotSuivi]?.find(a => a.name === article.nomArticleSuivi);
        if (articleOption) {
            const quantiteConsommeTotale = articleOption.quantiteArticleconsomme || 0;
            const quantiteConsommeSuivi = article.quantiteConsommeArticleSuivi || 0;
            let quantiteRealisee = quantiteConsommeSuivi - quantiteConsommeTotale;

            // Ensure non-negative quantiteRealiseeCetteSemaine (optional)
            article.quantiteRealiseeCetteSemaine = quantiteRealisee >= 0 ? quantiteRealisee : 0;
        }
    }

    onQuantiteConsommeChange(lotIndex: number, articleIndex: number): void {
        this.updateQuantiteRealisee(lotIndex, articleIndex);
    }



}