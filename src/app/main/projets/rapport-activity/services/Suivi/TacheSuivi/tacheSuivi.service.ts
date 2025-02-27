import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TacheSuivi} from '../../../models/Suivi/TacheSuivi';
import { environment } from 'environments/environment';



@Injectable({
    providedIn: 'root'
})
export class TacheSuiviService {


    private apiUrl = `${environment.apiUrl}/tachesuivis`;

    constructor(private http: HttpClient) {}

    getAllTacheSuivis(): Observable<TacheSuivi[]> {
        return this.http.get<TacheSuivi[]>(this.apiUrl);
    }



    getTacheSuiviById(id: number): Observable<TacheSuivi> {
        return this.http.get<TacheSuivi>(`${environment.TacheSuivi.query.getById}/${id}`);
    }

    getTacheSuivisByTacheId(tacheId: number): Observable<TacheSuivi[]> {
        return this.http.get<TacheSuivi[]>(`${environment.TacheSuivi.query.getByTacheId}/${tacheId}`);
    }




    createTacheSuivi(tacheSuivi: TacheSuivi): Observable<TacheSuivi> {
        return this.http.post<TacheSuivi>(`${environment.TacheSuivi.command.create}`, tacheSuivi);
    }

    updateTacheSuivi(tacheSuivi: TacheSuivi): Observable<TacheSuivi> {
        return this.http.put<TacheSuivi>(`${environment.TacheSuivi.command.update}${tacheSuivi.idTacheSuivi}`, tacheSuivi);
    }




    deleteTacheSuivi(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.TacheSuivi.command.delete}${id}`);
    }



}