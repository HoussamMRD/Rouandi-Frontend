import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {JwtHelperService} from '@auth0/angular-jwt';
import {ToastrService} from 'ngx-toastr';
import {AppUser} from './models/app-user';
import {Role} from './models/role';
import {AppRole} from './models/app-role';

// import * as Stomp from '@stomp/stompjs';
import {SrNotification} from '../../layout/components/navbar/models/sr-notification';

@Injectable({
    providedIn: 'root'
})
export class AuthService {


    public onSrNotificationChanged: BehaviorSubject<SrNotification>;

    isAuth = false;
    // entreprise: Entreprise;

    currentUser: AppUser = new AppUser();
    currentUserSubject = new Subject<AppUser>();


    isErreur: boolean = undefined;
    erreurStatusSubject = new Subject<boolean>();

    private stompClient = null;


    constructor(private http: HttpClient,
                private router: Router,
                private _toastrService: ToastrService) {
        // @ts-ignore
        this.onIntituleCaisseChanged = new BehaviorSubject<IntituleCaisse>();

        // @ts-ignore
        this.onSrNotificationChanged = new BehaviorSubject<SrNotification>();
        // this.emitIntituleCaisse(IntituleCaisse.CAISSE_ADMINISTRATION);
    }


    signIn(username, password) {
        this.http.post(environment.authHost + '/login', {username, password}).subscribe(
            data => {
                if (!this.currentUser) {
                    this.currentUser = new AppUser();
                }
                console.log(this.currentUser);
                this.currentUser.accessToken = data['accessToken'];
                this.currentUser.refreshToken = data['refreshToken'];

                const jwtHelper = new JwtHelperService();
                const objJwt = jwtHelper.decodeToken(this.currentUser.accessToken);
                console.log(objJwt);
                this.currentUser.username = objJwt.sub;
                this.currentUser.roles = objJwt.roles;
                this.currentUser.roles.forEach(role => {
                    const appRole: AppRole = new AppRole(role, null);
                    this.currentUser.appRoles.push(appRole);
                });
                this.isAuth = true;
                this.getProfile();
                // this.getTokenPointage();


                // this.saveToken(this.currentUser.accessToken, this.currentUser.refreshToken);
                this.isErreur = false;
                this.emitErreurStatusSubject();
            }, error1 => {
                // console.log(error1);
                this.isErreur = true;
                this.emitErreurStatusSubject();
            }
        );
    }

    refreshToken() {
        const headers = new HttpHeaders({'Authorization': 'Bearer ' + this.currentUser.refreshToken});
        // console.log(this.currentUser.refreshToken);

        return this.http.get(environment.authCmdHost + '/refreshtoken', {headers: headers}).subscribe(
            data => {
                if (!this.currentUser) {
                    this.currentUser = new AppUser();
                }
                // console.log(this.currentUser);
                this.currentUser.accessToken = data['accessToken'];
                this.currentUser.refreshToken = data['refreshToken'];

                const jwtHelper = new JwtHelperService();
                const objJwt = jwtHelper.decodeToken(this.currentUser.accessToken);
                this.currentUser.username = objJwt.sub;
                this.currentUser.roles = objJwt.roles;
                this.currentUser.roles.forEach(role => {
                    const appRole: AppRole = new AppRole(role, null);
                    this.currentUser.appRoles.push(appRole);
                });
                this.isAuth = true;
                this.getProfile();
                // this.getTokenPointage();


                // this.saveToken(this.currentUser.accessToken, this.currentUser.refreshToken);
                this.isErreur = false;
                this.emitErreurStatusSubject();
            }, error1 => {
                // console.log(error1);
                this.isErreur = true;
                this.emitErreurStatusSubject();
            }
        );
    }



    public emitErreurStatusSubject() {
        this.erreurStatusSubject.next(this.isErreur);
    }



    getProfile() {
        const headers = new HttpHeaders({'authorization': 'Bearer ' + this.currentUser.accessToken});
        return this.http.get(environment.authQueryHost + '/profile', {headers: headers}).subscribe(
            (data: AppUser) => {
                console.log('getProfile');
                console.log(data);

                this.currentUser.id = data.id;
                this.currentUser.firstName = data.firstName;
                this.currentUser.lastName = data.lastName;
                this.currentUser.email = data.email;
                this.currentUser.avatar = data.avatar;
                this.currentUser.date = data.date;
                this.currentUser.workingDays = data.workingDays;
                this.currentUser.sessionExpired = data.sessionExpired;
                this.currentUserSubject.next(this.currentUser);
                window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                if (!this.currentUser.sessionExpired) {
                    // Display welcome toast!
                    setTimeout(() => {
                        this._toastrService.success(
                            'Vous vous êtes connecté avec succès en tant que ' + this.currentUser.roles[0] +
                            ' à SrManager. Vous pouvez maintenant commencer à explorer.',
                            '👋 Bienvenue, ' + this.currentUser.firstName + ' ' + this.currentUser.lastName + '!',
                            {toastClass: 'toast ngx-toastr', closeButton: true}
                        );
                    }, 1500);

                }
                this.router.navigate(['/']);

            }, error => {
                console.log(error);
            });
    }

    loadCurrentUser() {
        // let myProfile = localStorage.getItem('currentUser');
        this.currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
        this.currentUser?.roles.forEach(role => {
            const appRole: AppRole = new AppRole(role, null);
            this.currentUser?.appRoles.push(appRole);
        });
        this.currentUserSubject.next(this.currentUser);
        /*if (this.isComptableChantier(this.currentUser)) {
            this.emitIntituleCaisse(IntituleCaisse.CAISSE_CHANTIER);
        } else {
            this.emitIntituleCaisse(IntituleCaisse.CAISSE_ADMINISTRATION);
        }*/
        //// console.log(this.currentUser);
    }

    /* loadToken() {
         this.accessToken = localStorage.getItem('accessToken');
         this.refreshToken = localStorage.getItem('refreshToken');
         if (this.accessToken) {
             this.parseJwt(this.accessToken);
         } else {
             this.isAuth = false;
         }
     }*/

    logout() {
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        window.localStorage.removeItem('currentUser');
        this.intParams();
        this.router.navigate(['/authentication/login']);

    }

    private intParams() {
        // this.accessToken = undefined;
        // this.refreshToken = undefined;
        // this.username = undefined;
        // this.currentUser.roles = undefined;
        // this.currentUser = undefined;
        this.currentUserSubject.next(null);
        this.isAuth = false;
    }


    /*isAuth() {
        return  this.currentUser.roles != undefined && (this.isAdmin() || this.isUser() || this.isVnManager()
            || this.isSavManager() || this.isScManager() || this.isPaidManager());
    }*/

    /*loadToken() {
        this.jwt = localStorage.getItem('token');
        this.parseJwt();
    }*/


    saveUser(currentUser: AppUser) {
        const headers = new HttpHeaders({'authorization': 'Bearer ' + this.currentUser.accessToken});
        currentUser.username = this.currentUser.username;
        this.http.post(environment.authCmdHost + '/saveUser', currentUser, {headers: headers}).subscribe(
            (data: AppUser) => {
                this.currentUser = data;
                this.logout();
            });

    }

    initPwd(username: string) {
        const headers = new HttpHeaders({'authorization': 'Bearer ' + this.currentUser.accessToken});
        return this.http.get(environment.authCmdHost + '/initPwd/' + username, {headers: headers});
    }



    public isAdmin(appUser: AppUser): boolean {
        return appUser && appUser.roles && appUser.roles.indexOf(Role.ADMIN) >= 0;
    }



    canViewItem(item: any) {

        let canView = false;
        // (item.roles ? item.roles.includes(currentUser.roles) : false || item.roles == undefined)

        item.roles.forEach((role: Role) => {
            if (this.currentUser.roles && this.currentUser.roles.indexOf(role) >= 0) {
                canView = true;
                return;
            }
        });

        return canView;


    }


    isComptableChantier(currentUser: AppUser) {
        
    }



}
