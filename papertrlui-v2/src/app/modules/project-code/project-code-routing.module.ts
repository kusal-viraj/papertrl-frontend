import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CodeHomeComponent} from './code-home/code-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";

const routes: Routes = [
  { path: '', component: CodeHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Project Codes'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectCodeRoutingModule { }
