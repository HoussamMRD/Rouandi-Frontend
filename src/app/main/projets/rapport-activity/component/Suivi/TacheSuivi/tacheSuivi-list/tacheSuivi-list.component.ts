import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TacheSuivi } from 'app/main/projets/rapport-activity/models/Suivi/TacheSuivi';
import { TacheSuiviService } from '../../../../services/Suivi/TacheSuivi/tacheSuivi.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Statut } from '@core/enum/RA-Enums/Statut';
import { TacheService } from '../../../../services/Planning/Tache/tache.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TacheSuiviAddComponent } from '../tacheSuivi-create/tacheSuivi-create.component';

@Component({
    selector: 'app-tache-suivi-list',
    templateUrl: './tacheSuivi-list.component.html',
    styleUrls: ['./tacheSuivi-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TacheSuiviListComponent implements OnInit {
    @Input() tacheId: number;
    nomTache: string = '';
    tacheSuivis: TacheSuivi[] = [];
    filteredTacheSuivis: TacheSuivi[] = [];
    selected: TacheSuivi[] = [];
    pageSize = 6;
    pageOffset = 0;
    isLoading = false;
    selectedWeek: string = 'all';
    weeks: number[] = [];

    constructor(
        private tacheSuiviService: TacheSuiviService,
        private toastr: ToastrService,
        private route: ActivatedRoute,
        private tacheService: TacheService,
        private cdr: ChangeDetectorRef,
        private modalService: NgbModal
    ) {}

    ngOnInit(): void {
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.tacheId = id;
        this.loadTacheSuivis();
    }

    loadTacheSuivis(): void {
        this.isLoading = true;
        this.tacheSuiviService.getTacheSuivisByTacheId(this.tacheId).subscribe(
            (response: TacheSuivi[]) => {
                this.tacheSuivis = response
                    .filter(suivi => suivi.statut !== Statut.ANNULE)
                    .map(suivi => ({
                        ...suivi,
                        dureeTacheSuivi: suivi.dureeTacheSuivi ?? 0
                    }));
                this.filteredTacheSuivis = [...this.tacheSuivis];
                this.weeks = Array.from({ length: this.tacheSuivis.length }, (_, i) => i + 1);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            (error) => {
                console.error('Error loading tache suivis:', error);
                this.isLoading = false;
                this.toastr.error('Erreur lors du chargement des suivis de tâches');
            }
        );
    }

    filterByWeek(): void {
        if (this.selectedWeek === 'all') {
            this.filteredTacheSuivis = [...this.tacheSuivis];
        } else {
            const weekNumber = parseInt(this.selectedWeek, 10);
            if (!isNaN(weekNumber)) {
                const weekIndex = weekNumber - 1;
                this.filteredTacheSuivis = this.tacheSuivis.filter((_, index) => index === weekIndex);
            } else {
                this.filteredTacheSuivis = [...this.tacheSuivis];
            }
        }
        this.pageOffset = 0;
        this.cdr.detectChanges();
    }

    onSelect({ selected }): void {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        this.cdr.detectChanges();
    }

    isRowSelected(row: TacheSuivi): boolean {
        return this.selected.some(s => s.idTacheSuivi === row.idTacheSuivi);
    }

    openTacheSuiviAddModal(): void {
        const modalRef = this.modalService.open(TacheSuiviAddComponent, { size: 'xl', centered: true });
        modalRef.componentInstance.tacheId = this.tacheId;
        modalRef.componentInstance.tacheSuiviSaved.subscribe(() => {
            this.loadTacheSuivis();
        });
        modalRef.result.then(
            (result) => {
                if (result === 'success') {
                    this.loadTacheSuivis();
                }
            },
            () => {}
        );
    }

    openTacheSuiviEditModal(tacheSuivi: TacheSuivi): void {
        const modalRef = this.modalService.open(TacheSuiviAddComponent, { size: 'xl', centered: true });
        modalRef.componentInstance.tacheId = this.tacheId;
        modalRef.componentInstance.tacheSuivi = { ...tacheSuivi }; // Pass a copy to avoid direct mutation
        modalRef.componentInstance.tacheSuiviSaved.subscribe(() => {
            this.loadTacheSuivis();
        });
        modalRef.result.then(
            (result) => {
                if (result === 'success') {
                    this.loadTacheSuivis();
                }
            },
            () => {}
        );
    }


    deleteTacheSuivi(id: number): void {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: 'Ce suivi sera supprimé !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                this.tacheSuiviService.deleteTacheSuivi(id).subscribe(
                    () => {
                        this.tacheSuivis = this.tacheSuivis.filter(s => s.idTacheSuivi !== id);
                        this.filteredTacheSuivis = this.filteredTacheSuivis.filter(s => s.idTacheSuivi !== id);
                        this.weeks = Array.from({ length: this.tacheSuivis.length }, (_, i) => i + 1);
                        this.toastr.success('Suivi supprimé avec succès');
                        this.cdr.detectChanges();
                    },
                    (error) => {
                        console.error('Error deleting suivi:', error);
                        this.toastr.error('Erreur lors de la suppression du suivi');
                    }
                );
            }
        });
    }
}