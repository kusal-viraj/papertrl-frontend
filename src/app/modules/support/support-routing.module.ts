import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SupportDashboardComponent} from './support-dashboard/support-dashboard.component';
import {TrialConfigComponent} from './trial-config/trial-config.component';
import {ActiveLoginListComponent} from './active-logins/active-login-list/active-login-list.component';
import {ApprovePackageListComponent} from './approve-package/approve-package-list/approve-package-list.component';
import {ApproveTrialListComponent} from './approve-trial/approve-trial-list/approve-trial-list.component';
import {EmailListComponent} from './email/email-list/email-list.component';
import {PackageHomeComponent} from './package/package-home/package-home.component';
import {TaskHomeComponent} from './task/task-home/task-home.component';
import {TenantHomeComponent} from './tenant/tenant-home/tenant-home.component';
import {AdminHomeComponent} from '../admin/admin-home/admin-home.component';
import {IntegrationHomeComponent} from './integration/integration-home/integration-home.component';
import {PayemntTypeHomeComponent} from './payment-types/payemnt-type-home/payemnt-type-home.component';
import {PaymentProviderHomeComponent} from './payment-providers/payment-provider-home/payment-provider-home.component';
import {SupportTicketHomeComponent} from '../support-ticket/support-ticket-home/support-ticket-home.component';


const routes: Routes = [
  // {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {path: 'dashboard', data: {breadcrumb: 'Dashboard'}, component: SupportDashboardComponent},
  {path: 'admin', data: {breadcrumb: 'Admin'},  component: AdminHomeComponent},
  {path: 'trial-config', data: {breadcrumb: 'Trial Configuration'}, component: TrialConfigComponent},
  {path: 'active-current-logins', data: {breadcrumb: 'Active Current Logins'}, component: ActiveLoginListComponent},
  {path: 'approve-package-changes', data: {breadcrumb: 'Approve Package Changes'}, component: ApprovePackageListComponent},
  {path: 'trial-request', data: {breadcrumb: 'Approve Trial Request'}, component: ApproveTrialListComponent},
  {path: 'email', data: {breadcrumb: 'Email'}, component: EmailListComponent},
  {path: 'package', data: {breadcrumb: 'Package'}, component: PackageHomeComponent},
  {path: 'task-settings', data: {breadcrumb: 'Task'}, component: TaskHomeComponent},
  {path: 'tenant', data: {breadcrumb: 'Tenant'}, component: TenantHomeComponent},
  {path: 'integration', data: {breadcrumb: 'Integration'}, component: IntegrationHomeComponent},
  {path: 'payment-types', data: {breadcrumb: 'Payment Types'}, component: PayemntTypeHomeComponent},
  {path: 'payment-providers', data: {breadcrumb: 'Payment Providers'}, component: PaymentProviderHomeComponent},
  {path: 'support-ticket', data: {breadcrumb: 'Support Ticket'}, component: SupportTicketHomeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportRoutingModule {
}
