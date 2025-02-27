import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {SrManagerService} from '../../../sr-manager.service';
import {environment} from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersListService implements Resolve<any> {

  public rows: any;
  public onAllUserListChanged: BehaviorSubject<any>;
  public onAllActivatedUsersChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param srManagerService
   */
  constructor(private srManagerService: SrManagerService) {
    // Set the defaults
    this.onAllUserListChanged = new BehaviorSubject({});
    this.onAllActivatedUsersChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getUsers()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get rows
   */
  getUsers(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.srManagerService.getResources(environment.authQueryHost + '/users').subscribe(
          (response: any) => {
            this.rows = response;
            this.onAllUserListChanged.next(this.rows);
            resolve(this.rows);
          }, reject);
    });
  }

  allActivatedUsers(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.srManagerService.getResources(environment.authQueryHost + '/allActivatedUsers').subscribe(
          (response: any) => {
            this.rows = response;
            this.onAllActivatedUsersChanged.next(this.rows);
            resolve(this.rows);
          }, reject);
    });

  }
}
