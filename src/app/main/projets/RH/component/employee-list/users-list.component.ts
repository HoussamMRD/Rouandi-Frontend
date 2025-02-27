import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import {Employee} from '../../models/employe';
import {environment} from '../../../../../../environments/environment';
import {SrManagerService} from '../../../sr-manager.service';
import {EmployeFilter} from '../../../../../../@core/enum/EmployeFilter';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {EmployeesService} from '../../services/employees.service';


@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UsersListComponent implements OnInit {

    constructor(private srManagerService: SrManagerService,
                private modalService: NgbModal,
                private employeService: EmployeesService,
                ) {
    }

    employeList: Employee[];
    @ViewChild('tableRowDetails') tableRowDetails: any;
    filteredList: Employee[] = [];
    employeFilters = Object.values(EmployeFilter);
    departements: String[] = [];
    postes: String[] = [];
    soceites: String[] = [];
    employesByDept: Employee[];
    employesByPoste: Employee[];
    employesBySociete: Employee[];
    selectedFilter: String = '';
    updatedEmploye: Employee;

    filterCriteria = {
        matricule: '',
        nom: '',
        departement: '',
        poste: '',
        societe: ''
    };
    filterCriteriaEdit = {
        matricule: '',
        nom: '',
        departement: '',
        poste: '',
        societe: ''
    };
    selectedEmploye: Employee;

    pageSize = 10;  // Define the number of rows per page
    pageOffset = 0; // Define the starting offset



    getSelectedFilter() {
        console.log('Filtre sélectionné :', this.selectedFilter);
    }
    rowDetailsToggleExpand(row) {
        this.tableRowDetails.rowDetail.toggleExpandRow(row);
    }
    onPageChange(event: any): void {
        this.pageOffset = event.offset;
    }





    getEmployees() {
        // return new Promise((resolve, reject) => {
        //     this.srManagerService.getResources(environment.employees + '/getAllEmployees').subscribe(
        //         (response: any) => {
        //             this.employeList = response;
        //             this.filteredList = response;
        //
        //         }, reject);
        // });
        this.employeList = [];
    }
    getFilters() {
        this.filterCriteria.poste = '';
        this.filterCriteria.departement = '';
        this.filterCriteria.societe = '';
        if (this.selectedFilter === 'DEPARTEMENT' || this.selectedFilter === 'POSTE' || this.selectedFilter === 'SOCIETE') {
            setTimeout(() => this.getEmployesFiltrer(), 100);
        }

    }

    getDeptList(): Promise<any[]> {
        return new Promise((resolve, reject) => {
                this.srManagerService.getResources(environment.departements + '/getNames').subscribe(
                    (response: any) => {
                        this.departements = response;
                    }, reject);
            });
    }

    getPostList(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.srManagerService.getResources(environment.postes + '/getNames').subscribe(
                (response: any) => {
                    this.postes = response;
                }, reject);
        });
    }

    getSocieteList(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.srManagerService.getResources(environment.societe + '/getNames').subscribe(
                (response: any) => {
                    this.soceites = response;
                    console.log(this.soceites);
                }, reject);
        });
    }


    ngOnInit(): void {
        this.getEmployees();
        this.getPostList();
        this.getDeptList();
        this.getSocieteList();
    }

    refreshListEmploye(){
        return this.getEmployesFiltrer();
    }

    getEmployesFiltrer(): Promise<any[]> {
        console.log('getEmployeFillter');
        if (this.filterCriteria.departement !== '') {
            return new Promise((resolve, reject) => {
                this.srManagerService.getResources(environment.employees.query + '/getByDept/' + this.filterCriteria.departement).subscribe(
                    (response: any) => {
                        this.employesByDept = response;
                        this.employeList = this.employesByDept;

                    }, reject);
            });
        }
        if (this.filterCriteria.poste !== '') {
            return new Promise((resolve, reject) => {
                this.srManagerService.getResources(environment.employees.query + '/getByPoste/' + this.filterCriteria.poste).subscribe(
                    (response: any) => {
                        this.employesByPoste = response;
                        this.employeList = this.employesByPoste;

                    }, reject);
            });
        }
        if (this.filterCriteria.societe !== '') {
            return new Promise((resolve, reject) => {
                this.srManagerService.getResources(environment.employees.query + '/getBySociete/' + this.filterCriteria.societe).subscribe(
                    (response: any) => {
                        this.employesBySociete = response;
                        this.employeList = this.employesBySociete;
                        console.log(this.employeList);
                    }, reject);
            });
        }
        // if (this.filterCriteria.poste === '' && this.filterCriteria.departement === '') {
        //     this.getEmployees();
        // }




    }

    getByName() {
        if (this.filterCriteria.nom.trim() !== '') {
            if (this.selectedFilter === 'DEPARTEMENT') {
                this.employeList = this.employesByDept;
            }
            if (this.selectedFilter === 'POSTE') {
                this.employeList = this.employesByPoste;
            }
            if (this.selectedFilter === 'SOCIETE') {
                // this.employeList = this.employeBy
            }
            const searchName = this.filterCriteria.nom.toLowerCase().trim();
            this.employeList = this.employeList.filter(item =>
                item.nom.toLowerCase().includes(searchName)
            );
        } else {
            this.getEmployesFiltrer();
        }
    }
    getByMatricule() {
        if (this.filterCriteria.matricule.trim() !== '') {
            if (this.selectedFilter === 'DEPARTEMENT') {
                this.employeList = this.employesByDept;
            }
            if (this.selectedFilter === 'POSTE') {
                this.employeList = this.employesByPoste;
            }
            const searchMatricule = this.filterCriteria.matricule.toLowerCase().trim();

            this.employeList = this.employeList.filter(item =>
                item.matricule.toLowerCase().includes(searchMatricule)
            );
        } else {
            this.getEmployesFiltrer();
        }
    }

    openEditModal(row: any, content: any) {
        this.selectedEmploye = {...row};
        this.modalService.open(content, { size: 'xl', backdrop: 'static', centered: true  });

    }

    DeleteEmploye(id: number) {
        this.employeService.DeleteEmploye(id).subscribe(
            (response: any) => {
                this.getEmployesFiltrer();
            }
        )
    }
}
