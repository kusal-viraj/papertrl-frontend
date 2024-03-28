import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {VendorSuggestionDto} from '../../../shared/dto/vendor/vendor-suggestion-dto';
import {OverlayPanel} from 'primeng/overlaypanel';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {InvitationService} from '../../../shared/services/vendors/invitation.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ConfirmationPopupComponent} from '../../common/confirmation-popup/confirmation-popup.component';
import {PrivilegeService} from '../../../shared/services/privilege.service';

@Component({
  selector: 'app-vendor-invitation-form',
  templateUrl: './vendor-invitation-form.component.html',
  styleUrls: ['./vendor-invitation-form.component.scss']
})
export class VendorInvitationFormComponent implements OnInit, OnDestroy {
  public vendorInvitationForm: UntypedFormGroup;
  public tableSupportBase: TableSupportBase = new TableSupportBase();
  public suggestions: VendorSuggestionDto[] = [];
  public vendorDetail = false;
  public vendorId;

  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);

  public isExistingCommunityVendor = false;
  public isExistingInvitation = false;
  public isClickSendAndInvitationButton = false;

  ref: DynamicDialogRef;

  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;

  @Output() refreshGrid = new EventEmitter();

  constructor(public formBuilder: UntypedFormBuilder, public vendorService: VendorService, public invitationService: InvitationService,
              public notificationService: NotificationService, public dialogService: DialogService,
              public privilegeService: PrivilegeService) {
    this.vendorInvitationForm = this.formBuilder.group({
      vendorName: [null, Validators.required],
      contactName: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      emailAddress: [null, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }

  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName && controlName.value && !controlName.value.replace(/\s/g, '').length) {
      controlName.setValue('');
    }
  }

  /**
   * This method will return form controls
   */
  get f() {
    return this.vendorInvitationForm.controls;
  }

  /**
   * This method can be used to submit vendor invitation form data
   * @param vendorInvitationForm to Form Group Instance
   */

  onSubmit(vendorInvitationForm: UntypedFormGroup) {
    this.isClickSendAndInvitationButton = true;
    if (vendorInvitationForm.valid && !this.isExistingInvitation && !this.isExistingCommunityVendor) {
      this.show();
    } else {
      this.isClickSendAndInvitationButton = false;
      new CommonUtility().validateForm(this.vendorInvitationForm);
    }
  }

  sendInvitation() {
    this.invitationService.sendVendorInvitation(this.vendorInvitationForm.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.vendorInvitationForm.reset();
        this.isClickSendAndInvitationButton = false;
        this.isExistingCommunityVendor = false;
        this.isExistingInvitation = false;
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_INVITATION_SENT_SUCCESSFULLY);
        this.refreshGrid.emit();
      } else {
        this.isClickSendAndInvitationButton = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error) => {
      this.isClickSendAndInvitationButton = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Show Confirmation Popup to double check form values
   * If okay send invitations
   */
  show() {
    this.ref = this.dialogService.open(ConfirmationPopupComponent, {
      header: 'Invitation Confirmation',
      width: this.privilegeService.isMobile() ? '90%' : '40%',
      styleClass: 'confirmation-popup',
      data: {values: this.vendorInvitationForm.value, from: 'INVITATION'},
      contentStyle: {'max-height': '500px', 'overflow': 'auto'},
      baseZIndex: 10000
    });

    this.ref.onClose.subscribe((value: any) => {
      if (value) {
        this.sendInvitation();
      } else {
        this.isClickSendAndInvitationButton = false;
      }
    });
  }


  /**
   * This method can be used to reset invitation form
   */
  restForm() {
    this.isExistingCommunityVendor = false;
    this.isExistingInvitation = false;
    this.vendorInvitationForm.reset();
  }

  /**
   * View Detail Of vendor on create
   * @param id id
   */
  detailView(id: any) {
    this.vendorOverlay.hide();
    this.vendorId = id;
    this.vendorDetail = true;
  }

  /**
   * Add Vendor to Local
   * @param id id
   */
  addTolLocal(id: any) {
    // this.vendorService.addToLocal(id).subscribe((res: any) => {
    //   if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
    //     this.messageService.add({
    //       key: 'vi', severity: 'success', summary: 'Success',
    //       detail: HttpResponseMessage.VENDOR_ADDED_TO_LOCAL_SUCCESSFULLY
    //     });
    //   } else {
    //     this.messageService.add({key: 'vi', severity: 'error', summary: 'Error', detail: res.body.message});
    //   }
    // }, error => {
    //   this.messageService.add({key: 'vi', severity: 'error', summary: 'Error', detail: error});
    // });
  }

  /**
   * Open Vendor Overlay on keyup
   */
  toggleOverlay(keyboardEvent, actualTarget: HTMLDivElement) {
    // if (this.vendorInvitationForm.get('vendorName').dirty && this.vendorInvitationForm.get('vendorName').value.length >= 2) {
    //
    //   this.vendorService.getVendorSuggestions(this.vendorInvitationForm.get('vendorName').value).subscribe((res) => {
    //     this.suggestions = res.body;
    //   }, (error) => {
    //     this.messageService.add({key: 'vi', severity: 'error', summary: 'Error', detail: error});
    //   });
    //
    //   this.vendorOverlay.show(keyboardEvent, actualTarget);
    // } else {
    //   this.vendorOverlay.hide();
    // }
  }

  /**
   * Check email address
   */
  checkEmailAvailability() {
    const emailAddress = this.vendorInvitationForm.get('emailAddress').value;
    if (emailAddress) {
      this.checkVendorEmailAvailableCommunity(emailAddress);
      this.checkVendorEmailAvailableInvitation(emailAddress);
    }
  }


  checkVendorEmailAvailableCommunity(emailAddress: string) {
    this.invitationService.checkVendorEmailAvailableCommunity(emailAddress).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.isExistingCommunityVendor = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  checkVendorEmailAvailableInvitation(emailAddress: string) {
    this.invitationService.checkVendorEmailAvailableInvitation(emailAddress).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.isExistingInvitation = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


}
