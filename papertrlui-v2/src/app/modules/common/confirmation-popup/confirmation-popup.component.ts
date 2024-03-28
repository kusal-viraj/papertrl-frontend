import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
})
export class ConfirmationPopupComponent implements OnInit {

  public showFromInvitation = false;
  public valuesObject; // Can assign any kind of object for the result

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }

  /**
   * Check what method need to be executed from the dialog configs
   */
  ngOnInit() {
    this.config.data?.from === 'INVITATION' ? this.fromInvitation() : null;
  }

  /**
   * Confirm button clicked and return true as result to execute the function
   */
  confirm() {
    this.ref.close(true);
  }

  /**
   * Close button clicked and return false as result to execute the function
   */
  close(){
    this.ref.close(false)
  }

  /**
   * Execute this method when the dialog is opened from invitation
   */
  fromInvitation(): void{
    this.showFromInvitation = true;
    this.valuesObject = this.config.data?.values;
  }

}
