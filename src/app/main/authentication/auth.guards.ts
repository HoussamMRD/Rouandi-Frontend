import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {AuthService} from './auth.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    /**
     *
     * @param {Router} _router
     * @param {AuthService} authService
     */
    constructor(private _router: Router,
                private authService: AuthService) {
    }



    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // console.log("canActivate ===> 0")
        // console.log("route ===> "+route)



        this.authService.loadCurrentUser();

        const currentUser = this.authService.currentUser;

        if (currentUser) {
            // check if route is restricted by role
            if (currentUser.sessionExpired || (route.data.roles && route.data.roles.indexOf(currentUser.roles[0]) === -1)) {
                // role not authorised so redirect to not-authorized page
                window.localStorage.removeItem('currentUser');
                this._router.navigate(['/pages/miscellaneous/not-authorized']);
                return false;
            }

            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url

        this._router.navigate(['/authentication/login']);

        return false;

    }


}
