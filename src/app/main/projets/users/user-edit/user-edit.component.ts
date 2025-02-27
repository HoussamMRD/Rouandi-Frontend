import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import {Subject, Subscription} from 'rxjs';
import {FlatpickrOptions} from 'ng2-flatpickr';

import {RoleListService} from 'app/main/projets/users/role-list.service';
import {AuthService} from '../../../authentication/auth.service';
import {takeUntil} from 'rxjs/operators';
import {AppRole} from '../../../authentication/models/app-role';
import {NgForm} from '@angular/forms';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {UpdateInfosUserDTO} from '../../../authentication/models/update-infos-userDTO';
import {UpdatePwdUserRequestDTO} from '../../../authentication/models/update-pwd-user-requestDTO';
import Swal from 'sweetalert2';
import {AppUser} from '../../../authentication/models/app-user';
import {TypeRole} from '../../../authentication/models/type-role';
import {AccountSettingsService} from '../account-settings/account-settings.service';
import {UserEditService} from './user-edit.service';
import {SrLog} from '../models/SrLog';
import {ColumnMode, DatatableComponent} from '@swimlane/ngx-datatable';
import {SrResponseMessage} from '../../models/SrResponseMessage';

const URL = 'Users/Mac/Downloads/';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserEditComponent implements OnInit, OnDestroy {
    // public rolesSelected: AppRole[] = [];

    /**
     * Constructor
     *
     * @param _accountSettingsService
     * @param _roleListService
     * @param userEditService
     * @param _router
     * @param modalService
     * @param authService
     */
    constructor(private _accountSettingsService: AccountSettingsService,
                private _roleListService: RoleListService,
                private userEditService: UserEditService,
                private modalService: NgbModal,
                public authService: AuthService) {
        this._unsubscribeAll = new Subject();

        this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
            (data: AppUser) => {
                this.accountUser = data;
                /* this.accountUser?.roles.forEach(role => {
                     let appRole: AppRole = new AppRole(role,null);
                     this.rolesSelected?.push(appRole)
                 })*/
            }
        );
        authService.loadCurrentUser();
    }

    // public
    public contentHeader: any;
    public uploader: FileUploader = new FileUploader({
        url: URL,
        isHTML5: true
    });

    public birthDateOptions: FlatpickrOptions = {
        altInput: true
    };
    public passwordTextTypeOld = false;
    public passwordTextTypeNew = false;
    public passwordTextTypeRetype = false;
    public avatarImage: string;

    // private
    private _unsubscribeAll: Subject<any>;
    public accountUser: AppUser;
    public userEditter: AppUser;
    public roles: AppRole[];
    public srLogs: SrLog[];
    public currentUserSubscription: Subscription;

    roleName: string;
    disableUploadImage = true;
    public selectedOption = 10;
    public searchValue = '';
    private tempData = [];
    public ColumnMode = ColumnMode;

    // Decorator
    @ViewChild(DatatableComponent) table: DatatableComponent;

    // Public Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle Password Text Type Old
     */
    togglePasswordTextTypeOld() {
        this.passwordTextTypeOld = !this.passwordTextTypeOld;
    }

    /**
     * Toggle Password Text Type New
     */
    togglePasswordTextTypeNew() {
        this.passwordTextTypeNew = !this.passwordTextTypeNew;
    }

    /**
     * Toggle Password Text Type Retype
     */
    togglePasswordTextTypeRetype() {
        this.passwordTextTypeRetype = !this.passwordTextTypeRetype;
    }

    /**
     * Upload Image
     *
     * @param event
     */
    uploadImage(event: any) {

        if (event.target.files && event.target.files[0]) {

            console.log(event.target.files[0]);

            const reader = new FileReader();


            reader.onload = (event: any) => {
                this.avatarImage = event.target.result;
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------


    /**
     * On init
     */
    ngOnInit() {

       /* this.logListService.onLogListChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            response => {
                this.srLogs = response;
                this.tempData = response;

            });
*/
        this._roleListService.onRolessChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            this.roles = response;
        });
        this.userEditService.onUserChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
            this.userEditter = response;
            this.avatarImage = 'assets/images/portrait/small/' + this.userEditter?.avatar;

        });

        // content header
        this.contentHeader = {
            headerTitle: 'Paramètres du compte utilisateur',
            actionButton: false,
            breadcrumb: {
                type: '',
                links: [
                    {
                        name: 'Home',
                        isLink: true,
                        link: '/'
                    },

                    {
                        name: 'Paramètres du compte',
                        isLink: false
                    }
                ]
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * filterUpdate
     *
     * @param event
     */
    filterUpdate(event) {

        const val = event.target.value.toLowerCase();

        // Filter Our Data
        const temp = this.tempData.filter(function (d) {
            return d.firstName?.toLowerCase().indexOf(val) !== -1
                || d.lastName?.toLowerCase().indexOf(val) !== -1 || !val
                || d.fullName?.toLowerCase().indexOf(val) !== -1 || !val;
        });

        // Update The Rows
        this.srLogs = temp;
        // Whenever The Filter Changes, Always Go Back To The First Page
        this.table.offset = 0;
    }

    onAddRole(modal: any) {
        this.roleName = '';
        this.modalService.open(modal, {
            centered: true,
            backdrop: false,
            size: 'sm'
        });
    }

    // onSaveNewRole(modal: any) {
    //     const appRole: AppRole = new AppRole(this.roleName, TypeRole.ADMINISTARTION);
    //
    //     this._roleListService.createRole(appRole).subscribe(
    //         (data: Param) => {
    //             this._roleListService.getAppRoles();
    //             modal.close('Accept click');
    //
    //         }
    //     );
    //
    // }

    updateInfosGenerales() {
        const roles: string[] = [];
        this.userEditter.appRoles.forEach(appRole => {
            roles.push(appRole.roleName);
        });
        const updateInfoUserDto: UpdateInfosUserDTO = new UpdateInfosUserDTO(
            this.userEditter.username,
            this.userEditter.avatar,
            this.userEditter.firstName,
            this.userEditter.lastName,
            this.userEditter.email,
            roles,
            this.userEditter.accountNonLocked,
            this.userEditter.accountNonExpired,
            this.userEditter.credentialsNonExpired
        );

        // this._accountSettingsService.updateInfoUser(updateInfoUserDto).subscribe(
        //     (data: Param) => {
        //         this.showSwal('basic', 'success', 'Good job!', 'Infos utilisateur modifiées avec succés', 'btn btn-primary');
        //     }
        // );
    }


    updatePwd(tDPassWordForm: NgForm) {
        console.log(tDPassWordForm.value);
        const updatePwdUserRequestDTO: UpdatePwdUserRequestDTO = new UpdatePwdUserRequestDTO(
            this.userEditter.username,
            tDPassWordForm.value.txtOldPwd,
            tDPassWordForm.value.txtNewPwd,
        );

        this._accountSettingsService.updatePwdUser(updatePwdUserRequestDTO).subscribe(
            data => {
                if (data['result']) {
                    this.showSwal('basic', 'success', 'Good job!', data['message'], 'btn btn-primary');
                    this.authService.logout();
                } else {
                    this.showSwal('basic', 'error', 'Erreur!', data['message'], 'btn btn-danger');
                }
                // this._router.navigate(['/pages/authentication/login-v2']);
            }
        );
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

    onInitPwd() {
        this.initPwd(this.userEditter.username, this.userEditService);
    }

    initPwd(username: string, userEditService: UserEditService) {
        Swal.fire({
            title: 'Etes-vous sûr?',
            text: 'Vous ne pourrez pas revenir en arrière!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7367F0',
            cancelButtonColor: '#E42728',
            confirmButtonText: 'Oui, Initialiser le PWD!',
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger ml-1'
            }
        }).then(function (result) {
            if (result.value) {

               let newPwd: string;
                userEditService.initPwd(username).subscribe(
                    (data: SrResponseMessage) => {
                        newPwd = data.message;
                        console.log('Nouveau Mot de passe est :' + newPwd);
                    }
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Mot de passe initialisé!',
                    text: 'Veuillez consulter votre email professionnel ...@rouandi.ma',
                    customClass: {
                        confirmButton: 'btn btn-success',
                    }
                });
            }
        });
    }

}
