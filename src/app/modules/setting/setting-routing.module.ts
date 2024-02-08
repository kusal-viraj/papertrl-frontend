import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SettingHomeComponent} from './setting-home/setting-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";

const routes: Routes = [
  {path: '', component: SettingHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Settings'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {
}
