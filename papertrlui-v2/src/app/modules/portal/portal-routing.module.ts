import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PortalDashboardComponent} from './portal-dashboard/portal-dashboard.component';
import {AdminHomeComponent} from '../admin/admin-home/admin-home.component';


const routes: Routes = [
  // {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {path: '', component: PortalDashboardComponent},
  {path: 'portal-dashboard', data: {breadcrumb: 'Dashboard'}, component: PortalDashboardComponent},
  {path: 'admin', data: {breadcrumb: 'Admin'},  component: AdminHomeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRoutingModule {
}
