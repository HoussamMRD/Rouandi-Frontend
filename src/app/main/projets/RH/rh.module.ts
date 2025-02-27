import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule, Routes} from '@angular/router';
import {DatePickerI18nModule} from '../../forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.module';
import {UsersListComponent} from './component/employee-list/users-list.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {CorePipesModule} from '../../../../@core/pipes/pipes.module';
import {CoreCommonModule} from '../../../../@core/common.module';
import {ContentHeaderModule} from '../../../layout/components/content-header/content-header.module';
import {NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

import { UpdateEmployeComponent } from './component/update-employe/update-employe.component';
import {FormWizardModule} from '../../forms/form-wizard/form-wizard.module';


const routes: Routes = [
    {
        path: 'employees',
        component: UsersListComponent,
    },
    {
        path: 'employees/update',
        component: UpdateEmployeComponent,
    }

];

@NgModule({
    declarations: [
        UsersListComponent,
        UpdateEmployeComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        DatePickerI18nModule,
        NgSelectModule,
        FormsModule,
        NgxDatatableModule,
        CorePipesModule,
        CoreCommonModule,
        ContentHeaderModule,
        NgbNavModule,
        NgbDropdownModule,
        FormWizardModule,
    ]
})
export class RhModule {
}
