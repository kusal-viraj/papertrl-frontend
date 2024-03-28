import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SupportTicketHomeComponent} from "./support-ticket-home/support-ticket-home.component";

const routes: Routes = [
  {path: '', component: SupportTicketHomeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportRoutingModule { }
