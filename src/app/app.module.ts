import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';


import 'hammerjs';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ToastrModule} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {ContextMenuModule} from '@ctrl/ngx-rightclick';

import {CoreModule} from '@core/core.module';
import {CoreCommonModule} from '@core/common.module';
import {CoreSidebarModule, CoreThemeCustomizerModule} from '@core/components';
import {CardSnippetModule} from '@core/components/card-snippet/card-snippet.module';

import {coreConfig} from 'app/app-config';
import {AuthGuard} from 'app/main/authentication/auth.guards';
import {AppComponent} from 'app/app.component';
import {LayoutModule} from 'app/layout/layout.module';
import {ContentHeaderModule} from 'app/layout/components/content-header/content-header.module';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {FakeDbService} from '../@fake-db/fake-db.service';
import {ErrorInterceptor} from './main/authentication/error.interceptor';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { TimeFormatPipe } from '@core/pipes/time-format.pipe';




registerLocaleData(localeFr, 'fr');

const appRoutes: Routes = [
    {
        path: 'authentication',
        loadChildren: () => import('./main/authentication/authentication.module').then(m => m.AuthenticationModule)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./main/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'projets',
        loadChildren: () => import('./main/projets/projets.module').then(m => m.ProjetsModule),
        canActivate: [AuthGuard]
    },

    {
        path: 'pages',
        loadChildren: () => import('./main/pages/pages.module').then(m => m.PagesModule)
    },
    {
        path: '',
        redirectTo: '/dashboard/layout',
        pathMatch: 'full'
    },

    {
        path: '**',
        redirectTo: '/pages/miscellaneous/error' // Error 404 - Page not found
    }
];

@NgModule({
    declarations: [
        AppComponent,

    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientInMemoryWebApiModule.forRoot(FakeDbService, {
            delay: 0,
            passThruUnknownUrl: true
        }),
        RouterModule.forRoot(appRoutes, {
            useHash: true,
            scrollPositionRestoration: 'enabled',
            relativeLinkResolution: 'legacy'
        }),
        NgbModule,
        ToastrModule.forRoot({
            positionClass: 'toast-top-right',
            preventDuplicates: true,
          }),
        TranslateModule.forRoot(),
        ContextMenuModule,
        CoreModule.forRoot(coreConfig),
        CoreCommonModule,
        CoreSidebarModule,
        CoreThemeCustomizerModule,
        CardSnippetModule,
        LayoutModule,
        ContentHeaderModule,
        CorePipesModule
    ],

    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
         {provide: LOCALE_ID, useValue: 'fr-FR'},
    ],
    entryComponents: [],
    bootstrap: [AppComponent],
})
export class AppModule {
}

