import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AutomationHomeComponent} from './automation-home/automation-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";

const routes: Routes = [
  {path: '', component: AutomationHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Automation'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutomationRoutingModule {
}
