import { Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../authentication/auth.service';
import {Observable, Subscription} from 'rxjs';
import {AppUser} from '../authentication/models/app-user';


@Injectable({
    providedIn: 'root'
})
export class SrManagerService {

    public headers: HttpHeaders;
    private currentUser: AppUser = new AppUser();
    private currentUserSubscription: Subscription;

    constructor(private http: HttpClient,
                private authService: AuthService) {

        this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
            (data: AppUser) => {
                this.currentUser = data;
                if (this.currentUser) {
                    this.headers = new HttpHeaders({'authorization': 'Bearer ' + this.currentUser.accessToken});
                }
            }
        );
        authService.loadCurrentUser();

    }

    public getResource(url) {
        return this.http.get(url, {headers: this.headers});
    }

    public getResources<T>(url: string): Observable<T> {
        return this.http.get<T>(url, { headers: this.headers });
    }


    public postRessource(urlRessource: string, data) {

        return this.http.post(urlRessource, data , {headers: this.headers});
}

    public deleteRessource(url: string) {
        return this.http.delete(url, {headers: this.headers});
    }

    public putRessource(urlRessource: string, data) {
        console.log(data , urlRessource);
        return this.http.put(urlRessource, data, {headers: this.headers});
    }


}
