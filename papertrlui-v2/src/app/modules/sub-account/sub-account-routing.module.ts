import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SubAccountHomeComponent} from './sub-account-home/sub-account-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";

const routes: Routes = [
  {path: '', component: SubAccountHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Sub Accounts'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubAccountRoutingModule {
}
