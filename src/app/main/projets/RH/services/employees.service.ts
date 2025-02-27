import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Employee} from '../models/employe';
import {environment} from '../../../../../environments/environment';
import {SrManagerService} from '../../sr-manager.service';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor(private srManagerService:SrManagerService) {

  }
  getEmployeById(id: number): Observable<any>{
    const url = environment.employees.query + "/getById/" +id;
    try {
      return this.srManagerService.getResources(url);
    }catch (e){
      console.log(e);
    }
  }

  DeleteEmploye(id: number): Observable<any>{
    const url = environment.employees.delete + id;
    try {
      return this.srManagerService.deleteRessource(url);
    } catch (e) {
      console.log(e);
    }
  }

  modifierEmploye(selectedEmploye: Employee) {
    const path = environment.employees.update;
    try {
      this.srManagerService.putRessource(path, selectedEmploye).subscribe(
          () => {
            this.showSwal('basic', 'success', 'Good job!', 'Employe Civilite est Bien Modifier', 'btn btn-primary');
          }
      );
    } catch (e) {
      console.log(e);
    }
  }

  showSwal(type, icone, title: string, message: string, btn) {
    Swal.fire({
      icon: icone,
      title: title,
      titleText: message,
      customClass: {
        confirmButton: btn,
      }
    });
  }
}
