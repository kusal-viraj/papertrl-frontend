import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DashboardModule} from './modules/dashboard/dashboard.module';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {InputSwitchModule} from 'primeng/inputswitch';
import {FormsModule} from '@angular/forms';
import {RadioButtonModule} from 'primeng/radiobutton';
import {AuthModule} from './modules/auth/auth.module';
import {HttpClientModule} from '@angular/common/http';
import {InputsModule} from '@progress/kendo-angular-inputs';
import {LabelModule} from '@progress/kendo-angular-label';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {IconsModule} from '@progress/kendo-angular-icons';
import {FormGuardService} from './shared/guards/form-guard.service';
import {FilterPipe} from './shared/pipe/filter.pipe';
import {NodeService} from './shared/services/demo/nodeservice';
import {VendorService} from './shared/services/vendors/vendor.service';
import {TrailService} from './shared/services/auth/trail.service';
import {GrnService} from './shared/services/grn/grn.service';
import {PoService} from './shared/services/po/po.service';
import {InvitationService} from './shared/services/vendors/invitation.service';
import {VendorRequestService} from './shared/services/vendors/vendor-request.service';
import {ItemService} from './shared/services/items/item.service';
import {RoleService} from './shared/services/roles/role.service';
import {AccountService} from './shared/services/accounts/account.service';
import {RegisterService} from './shared/services/auth/register.service';
import {CategoryService} from './shared/services/items/category.service';
import {UomService} from './shared/services/items/uom.service';
import {ProjectCodeService} from './shared/services/project-code/project-code.service';
import {LayoutModule} from '@progress/kendo-angular-layout';
import {BillsService} from './shared/services/bills/bills.service';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {CompanyProfileService} from './shared/services/company-profile/company-profile.service';
import {SubAccountService} from './shared/services/sub-account/sub-account.service';
import {GridService} from './shared/services/common/table/grid.service';
import {ToastModule} from 'primeng/toast';
import {NotificationService} from './shared/services/notification/notification.service';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TenantService} from './shared/services/support/tenant.service';
import {TaskSettingsService} from './shared/services/support/task-settings-service';
import {CommonUploadIssueService} from './shared/services/common/upload-issues/common-upload-issue.service';
import {CommonSystemTaskRoutingService} from './shared/services/common/common-system-task-routing/common-system-task-routing.service';
import {ReportMasterService} from './shared/services/reports/report-master.service';
import {PaymentService} from './shared/services/payments/payment.service';
import {CountdownModule} from 'ngx-countdown';
import {BreadcrumbService} from 'angular-crumbs';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ConfirmationService} from 'primeng/api';
import {GtagModule} from "angular-gtag";
import {ApiEndPoint} from "./shared/utility/api-end-point";


const circleProgressConfig = {
  radius: 100,
  outerStrokeWidth: 16,
  innerStrokeWidth: 8,
  outerStrokeColor: '#78C000',
  innerStrokeColor: '#C7E596',
  animationDuration: 300,
};

@NgModule({
  declarations: [
    AppComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    InputTextModule,
    ButtonModule,
    RadioButtonModule,
    FormsModule,
    InputSwitchModule,
    BrowserAnimationsModule,
    AuthModule,
    HttpClientModule,
    InputsModule,
    LabelModule,
    NgCircleProgressModule.forRoot(circleProgressConfig),
    IconsModule,
    LayoutModule,
    AppRoutingModule,
    ToastModule,
    ConfirmDialogModule,
    CountdownModule,
    GtagModule.forRoot({ trackingId:  ApiEndPoint.GOOGLE_ANALYTICS_TRACK_ID, trackPageviews: true})
  ],

  bootstrap: [AppComponent],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }, FormGuardService, NodeService, NotificationService, CommonUploadIssueService,
    VendorService, TrailService, GrnService, AccountService, CategoryService, GridService, TaskSettingsService,
    UomService, CompanyProfileService, TenantService, CommonSystemTaskRoutingService, ReportMasterService,
    PoService, InvitationService, VendorRequestService, ItemService, BreadcrumbService, DialogService,
    RoleService, RegisterService, ProjectCodeService, BillsService, SubAccountService, PaymentService,
    ConfirmationService, DynamicDialogConfig, DynamicDialogRef
  ],
  exports: [
    FilterPipe,
  ]
})
export class AppModule {
}

