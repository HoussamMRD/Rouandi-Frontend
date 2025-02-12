import { CommonModule } from '@angular/common';
import { AuthGuard } from '../authentication/auth.guards';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CoreCommonModule } from '@core/common.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from './dashboard.service';




const routes = [
    {
        path: 'layout',
        component: DashboardLayoutComponent,
        canActivate: [AuthGuard],

    },





];

@NgModule({
    declarations: [DashboardLayoutComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        NgbModule,
        PerfectScrollbarModule,
        CoreCommonModule,
        NgApexchartsModule,

    ],
    providers: [DashboardService],
    exports: []
})
export class DashboardModule {
}
