import {NgModule} from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {AppMainComponent} from './modules/dashboard/app.main.component';
import {LoginComponent} from './modules/auth/login/login.component';
import {ForgotPasswordResetComponent} from './modules/auth/forgot-password-reset/forgot-password-reset.component';
import {
  TemporaryPasswordResetComponent
} from './modules/auth/temporary-password-reset/temporary-password-reset.component';
import {TrialRequestComponent} from './modules/auth/trial-request/trial-request.component';
import {EmailVerificationComponent} from './modules/auth/email-verification/email-verification.component';
import {RegisterComponent} from './modules/auth/register/register.component';
import {AuthGuardService} from './shared/guards/auth-guard.service';
import {
  VendorEmailVerificationComponent
} from './modules/auth/vendor-email-verification/vendor-email-verification.component';
import {NetworkGuard} from './shared/guards/network.guard';
import {RegisterSuccessComponent} from './modules/auth/register-success/register-success.component';
import {AppDownloadComponent} from './modules/auth/app-download/app-download.component';
import {AccessDeniedContainer} from './modules/common/access-denied/access-denied-container';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login'},
  {path: 'login', component: LoginComponent},
  {path: 'forgot-password', component: ForgotPasswordResetComponent},
  {path: 'temporary-password-reset', component: TemporaryPasswordResetComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'app-download', component: AppDownloadComponent},
  {path: 'success', component: RegisterSuccessComponent},
  {path: 'email-verification', component: EmailVerificationComponent},
  {path: 'vendor-email-verification', component: VendorEmailVerificationComponent},
  {path: 'trial-request', component: TrialRequestComponent},
  {
    path: 'home', component: AppMainComponent, canActivate: [AuthGuardService],
    children: [
      {
        path: '', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
        data: {breadcrumb: 'Dashboard'}
      },
      {
        path: 'vendor', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/vendor/vendor.module').then(m => m.VendorModule),
        data: {breadcrumb: 'Vendors'}
      },
      {
        path: 'admin', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        data: {breadcrumb: 'Admin'}
      },
      {
        path: 'account', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule),
        data: {breadcrumb: 'Accounts'}
      },
      {
        path: 'item', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/item/item.module').then(m => m.ItemModule),
        data: {breadcrumb: 'Items'}
      },
      {
        path: 'automation', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/automation/automation.module').then(m => m.AutomationModule),
        data: {breadcrumb: 'Automations'}
      },
      {
        path: 'project-code', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/project-code/project-code.module').then(m => m.ProjectCodeModule),
        data: {breadcrumb: 'Project Codes'}
      },
      {
        path: 'purchase-order', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/purchase-order/purchase-order.module').then(m => m.PurchaseOrderModule),
        data: {breadcrumb: 'Purchase Orders'}
      },
      {
        path: 'expense', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/expense/expense.module').then(m => m.ExpenseModule),
        data: {breadcrumb: 'Expenses'}
      },

      {
        path: 'bills', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/bills/bills.module').then(m => m.BillsModule),
        data: {breadcrumb: 'Bills'}
      },
      {
        path: 'settings', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/setting/setting.module').then(m => m.SettingModule),
        data: {breadcrumb: 'Settings'}
      },
      {
        path: 'sub-accounts', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/sub-account/sub-account.module').then(m => m.SubAccountModule),
        data: {breadcrumb: 'Sub Accounts'}
      },
      {
        path: 'sync-dashboard', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/sync-dashboard/sync-dashboard.module').then(m => m.SyncDashboardModule),
        data: {breadcrumb: 'Sync Dashboard'}
      },
      {
        path: 'report', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule),
        data: {breadcrumb: 'Reports'}
      },
      {
        path: 'payments', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/payment/payment.module').then(m => m.PaymentModule),
        data: {breadcrumb: 'Payments'}
      },
      {
        path: 'inbox', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/inbox/inbox.module').then(m => m.InboxModule),
        data: {breadcrumb: 'Inbox'}
      },
      {
        path: 'support-ticket', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/support-ticket/support-ticket.module').then(m => m.SupportTicketModule),
        data: {breadcrumb: 'Support Ticket'}
      },
      {
        path: 'portal-dashboard', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/portal/portal.module').then(m => m.PortalModule),
        data: {breadcrumb: 'Portal'}
      },
      {
        path: 'invoices',
        loadChildren: () => import('./modules/customer-invoice/customer-invoice.module').then(m => m.CustomerInvoiceModule)
      },
    ]
  },
  {
    path: 'support', component: AppMainComponent, canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/support/support.module').then(m => m.SupportModule),
        data: {breadcrumb: 'Support'}
      },
    ]
  },
  // {
  //   path: 'portal', component: AppMainComponent, canActivate: [AuthGuardService],
  //   children: [
  //     {
  //       path: '', canActivate: [NetworkGuard],
  //       loadChildren: () => import('./modules/portal/portal.module').then(m => m.PortalModule),
  //       data: {breadcrumb: 'Portal'}
  //     }
  //   ]
  // },
  {
    path: 'vendor', component: AppMainComponent, canActivate: [AuthGuardService],
    children: [
      {
        path: '', canActivate: [NetworkGuard],
        loadChildren: () => import('./modules/vendor-community/vendor-community.module').then(m => m.VendorCommunityModule),
        data: {breadcrumb: 'Vendor'}
      }
    ]
  },
  {
    path: 'access-denied',
    component: AccessDeniedContainer,
    canActivate: [NetworkGuard],
    data: { breadcrumb: 'Access Denied' }
  },
  { path: '**',  component: AccessDeniedContainer }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    enableTracing: false
  })],

  exports: [RouterModule]
})
export class AppRoutingModule {
}


