import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ConfirmationService} from 'primeng/api';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';

@Component({
  selector: 'app-department-detail-view',
  templateUrl: './department-detail-view.component.html',
  styleUrls: ['./department-detail-view.component.scss']
})
export class DepartmentDetailViewComponent implements OnInit{

  public departmentDetailsForm: UntypedFormGroup;
  public commonUtil: CommonUtility = new CommonUtility();
  @Input() departmentId;
  @Output() closeDetailView = new EventEmitter();
  @Output() successDelete = new EventEmitter();
  @Output() successUpdate = new EventEmitter();
  // @Output() editDepartment = new EventEmitter();
  public editDepartment = false;

  public appAuthorities = AppAuthorities;

  constructor(public privilegeService: PrivilegeService, public confirmationService: ConfirmationService,
              private departmentService: DepartmentService, public notificationService: NotificationService,
              public formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
        this.departmentDetailsForm = this.formBuilder.group({
          id: [null],
          departmentCode: [null],
          departmentName: [null],
          billingAddress: this.formBuilder.group({
            addressLine1: [null],
            addressLine2: [null],
            city: [null],
            addressState: [null],
            zipCode: [null],
            country: [null],
          }),
          shippingAddress: this.formBuilder.group({
            addressLine1: [null],
            addressLine2: [null],
            city: [null],
            addressState: [null],
            zipCode: [null],
            country: [null],
          }),
          contactPerson: [null],
          useForPoCreation: [null],
          showAddress: [null]
        });

        this.getDepartmentData(this.departmentId);
    }

  /**
   * This method can be used for get form controls
   */
  get f() {
    return this.departmentDetailsForm.controls;
  }

  /**
   * Get Department data
   */
  getDepartmentData(departmentId: any) {
    this.departmentService.getDepartment(departmentId).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.departmentDetailsForm.patchValue(res.body);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for delete single department
   */
  deleteDepartment() {
    this.confirmationService.confirm({
      message: 'You want to delete this Department',
      key: 'dep',
      accept: () => {
        this.departmentService.deleteDepartment(this.departmentId).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.DEPARTMENT_DELETED_SUCCESSFULLY);
            this.closeDetailView.emit();
            this.successDelete.emit();
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * This method used for open edit screen
   */
  editDepartmentData() {
    this.editDepartment = true;
  }

  /**
   * This method is used to check shipping address values
   */
  isShippingEmpty() {
    const addressValues = [
      this.getShippingAddressLine1.value,
      this.getShippingAddressLine2.value,
      this.getShippingAddressCity.value,
      this.getShippingAddressState.value,
      this.getShippingAddressZipcode.value,
      this.getShippingAddressCountry.value
    ];

    return addressValues.some(value => value);
  }

  /**
   * This method is used to check Billing address values
   */
  isBillingEmpty() {
    const addressValues = [
      this.getBillingAddressLine1.value,
      this.getBillingAddressLine2.value,
      this.getShippingAddressCity.value,
      this.getShippingAddressState.value,
      this.getBillingAddressZipcode.value,
      this.getShippingAddressCountry.value
    ];

    return addressValues.some(value => value);
  }

  /**
   * Below four methods can be used for get form controls inside the billing and shipping addresses
   */
  get getBillingAddressLine1() {
    return this.departmentDetailsForm.get('billingAddress').get('addressLine1');
  }

  get getBillingAddressLine2() {
    return this.departmentDetailsForm.get('billingAddress').get('addressLine2');
  }

  get getBillingAddressCity() {
    return this.departmentDetailsForm.get('billingAddress').get('city');
  }

  get getBillingAddressState() {
    return this.departmentDetailsForm.get('billingAddress').get('addressState');
  }

  get getBillingAddressCountry() {
    return this.departmentDetailsForm.get('billingAddress').get('country');
  }

  get getBillingAddressZipcode() {
    return this.departmentDetailsForm.get('billingAddress').get('zipCode');
  }

  get getShippingAddressLine1() {
    return this.departmentDetailsForm.get('shippingAddress').get('addressLine1');
  }

  get getShippingAddressLine2() {
    return this.departmentDetailsForm.get('shippingAddress').get('addressLine2');
  }

  get getShippingAddressCity() {
    return this.departmentDetailsForm.get('shippingAddress').get('city');
  }

  get getShippingAddressState() {
    return this.departmentDetailsForm.get('shippingAddress').get('addressState');
  }

  get getShippingAddressZipcode() {
    return this.departmentDetailsForm.get('shippingAddress').get('zipCode');
  }

  get getShippingAddressCountry() {
    return this.departmentDetailsForm.get('shippingAddress').get('country');
  }
}
