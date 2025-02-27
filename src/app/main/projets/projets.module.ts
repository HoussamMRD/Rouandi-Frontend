import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FullCalendarModule} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlockUIModule} from 'ng-block-ui';
import {ContentHeaderModule} from '../../layout/components/content-header/content-header.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {DatePickerI18nModule} from '../forms/form-elements/date-time-picker/date-picker-i18n/date-picker-i18n.module';
import {AuthGuard} from '../authentication/auth.guards';
import {NgChartsModule} from 'ng2-charts';

// routing
const routes: Routes = [




    {
        path: 'srbo',
        loadChildren: () => import('./bo/sr-bo.module').then(m => m.SrBoModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'caution',
        loadChildren: () => import('./caution/caution.module').then(m => m.CautionModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'rh',
        loadChildren: () => import('./rh/rh.module').then(m => m.RhModule),
        canActivate: [AuthGuard]
    },

    {
        path: 'rapport-activity',
        loadChildren: () => import('./rapport-activity/rapport-activity.module').then(m => m.RapportActivityModule),
        canActivate: [AuthGuard]
    },



];

FullCalendarModule.registerPlugins([dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]);


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgSelectModule,
        ReactiveFormsModule,
        BlockUIModule,
        ContentHeaderModule,
        FormsModule,
        NgxDatatableModule,
        DatePickerI18nModule ,
        NgChartsModule ,
    ],
    providers: [],
    exports: []
})
export class ProjetsModule {
}
