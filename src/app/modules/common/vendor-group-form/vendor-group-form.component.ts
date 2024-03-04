import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {DialogService} from 'primeng/dynamicdialog';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {InvitationService} from '../../../shared/services/vendors/invitation.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {of} from 'rxjs';
import {VendorHomeComponent} from '../../vendor/vendor-home/vendor-home.component';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';


@Component({
  selector: 'app-vendor-group-form',
  templateUrl: './vendor-group-form.component.html',
  styleUrls: ['./vendor-group-form.component.scss']
})
export class VendorGroupFormComponent implements OnInit {


  @Input() editView;
  @Input() panel;
  @Input() groupId;
  @Output() refreshGrid = new EventEmitter();

  public form: UntypedFormGroup;
  public tableSupportBase: TableSupportBase = new TableSupportBase();
  public buttonLoading = false;
  public vendorsList: DropdownDto = new DropdownDto();
  public isAddVendor = false;
  public vendorNameList = [];
  public appAuthorities = AppAuthorities;

  constructor(public formBuilder: UntypedFormBuilder, public vendorService: VendorService,
              public notificationService: NotificationService, public dialogService: DialogService, public vendorHome: VendorHomeComponent,
              public privilegeService: PrivilegeService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: [null],
      name: [null, Validators.required],
      vendorIdList: [null],
    });
    this.getVendorList().then(r => {
      if (this.editView) {
        this.getGroupInfo();
      }
    });
  }

  setVendorNames() {
    const selectedIdList = this.form.get('vendorIdList').value;
    this.vendorNameList = this.vendorsList.data.filter(x => selectedIdList.includes(x.id)).map(y => y.name);
  }

  /**
   * This method can be used to submit vendor invitation form data
   * @param vendorInvitationForm to Form Group Instance
   */

  onSubmit(vendorInvitationForm: UntypedFormGroup) {
    this.buttonLoading = true;
    if (vendorInvitationForm.valid) {
      if (this.editView) {
        this.updateGroup();
      } else {
        this.createGroup();
      }
    } else {
      this.buttonLoading = false;
      new CommonUtility().validateForm(this.form);
    }
  }

  createGroup() {
    this.vendorService.createGroup(this.form.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.form.reset();
        this.buttonLoading = false;
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUP_CREATED_SUCCESSFULLY);
        this.vendorService.groupSubject.next(true);
        this.refreshGrid.emit();
      } else {
        this.buttonLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error) => {
      this.buttonLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  updateGroup() {
    this.vendorService.updateGroup(this.form.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.form.reset();
        this.buttonLoading = false;
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUPS_UPDATED_SUCCESSFULLY);
        this.refreshGrid.emit();
        this.vendorService.groupSubject.next(true);
      } else {
        this.buttonLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error) => {
      this.buttonLoading = false;
      this.notificationService.errorMessage(error);
    });
  }


  getVendorList() {
    return new Promise(resolve => {
      this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.vendorsList.data = res.body;
        }
        resolve(true);
      }, error => {
        this.notificationService.errorMessage(error);
        resolve(true);
      });
    });
  }

  /**
   * This method can be used to reset invitation form
   */
  restForm() {
    this.form.reset();
    if (this.editView) {
      this.getGroupInfo();
    }
  }


  /**
   * this method can be used to get if vendor is confidential get approval user list
   */
  changeVendorList(event) {
    if (event.itemValue === AppConstant.ZERO) {
      this.isAddVendor = true;
    }
    const idList = this.form.get('vendorIdList').value;
    this.form.get('vendorIdList').patchValue(idList?.filter(x => x !== 0));
    this.setVendorNames();
  }

  private getGroupInfo() {
    this.vendorService.getVendorGroup(this.groupId).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.form.patchValue(res.body);
          this.setVendorNames();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }
    });
  }

}
