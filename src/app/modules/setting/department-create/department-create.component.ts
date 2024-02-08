import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {MessageService} from 'primeng/api';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';

@Component({
  selector: 'app-department-create',
  templateUrl: './department-create.component.html',
  styleUrls: ['./department-create.component.scss']
})
export class DepartmentCreateComponent implements OnInit {

  public departmentForm: UntypedFormGroup;
  @Input() panel;
  @Input() editView = false;
  @Input() depId;


  @Output() updateDepartments = new EventEmitter();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public loading = false;
  public showShippingAddress = false;
  public filteredGroups: any[];
  public cities = [];
  public states = [];
  public countries: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public messageService: MessageService, public privilegeService: PrivilegeService,
              private departmentService: DepartmentService, public vendorService: VendorService) {
       this.initializeFormBuilder();
  }

  ngOnInit(): void {
    if (this.editView) {
      this.getDepartmentData();
    }

    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });

    this.vendorService.getCountries().subscribe((res) => {
      this.countries.data = res.body;
    });

    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });
  }

  /**
   * this method can be used for initialize form group
   */
  initializeFormBuilder(){
    this.departmentForm = this.formBuilder.group({
      id: [null],
      departmentCode: ['', Validators.required],
      departmentName: ['', Validators.required],
      billingAddress: this.formBuilder.group({
        addressLine1: [null],
        addressLine2: [null],
        city: [null],
        addressState: [null],
        zipCode: [null, Validators.compose([Validators.maxLength(30)])],
        country: [null],
      }),
      shippingAddress: this.formBuilder.group({
        addressLine1: [null],
        addressLine2: [null],
        city: [null],
        addressState: [null],
        zipCode: [null, Validators.compose([Validators.maxLength(30)])],
        country: [null],
      }),
      contactPerson: [null],
      useForPoCreation: [false],
      existShippingAddress: [false]
    });
  }

  /**
   * Get Department data
   */
  getDepartmentData() {
    this.departmentService.getDepartment(this.depId).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.departmentForm.patchValue(res.body);
        this.setValidators();
        this.showShippingAddress = res.body.existShippingAddress;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Checks form is valid
   * Decides it is an update or create
   */
  submitForm() {
    this.loading = true;
    if (this.departmentForm.valid) {
      if (this.editView) {
        this.updateDepartment(this.departmentForm.value);
      } else {
        this.createDepartment(this.departmentForm.value);
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.departmentForm);
    }
  }

  /**
   * This method can be use to reset form
   */
  reset() {
    this.departmentForm.reset();
    this.departmentForm.get('existShippingAddress').patchValue(false);
    this.departmentForm.get('useForPoCreation').patchValue(false);
    this.showShippingAddress = false;
    this.setValidators();
    if (this.editView){
      this.getDepartmentData();
    }
  }

  /**
   * This method use for create new Department
   * @param department object
   */
  createDepartment(department) {
    this.departmentService.createDepartment(department).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.DEPARTMENT_CREATED_SUCCESSFULLY);
        this.loading = false;
        this.reset();
        this.updateDepartments.emit();
        this.showShippingAddress = false;
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for update new Department
   * @param department object
   */
  updateDepartment(department) {
    this.departmentService.updateDepartment(department).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.DEPARTMENT_UPDATED_SUCCESSFULLY);
        this.loading = false;
        this.updateDepartments.emit();
        this.showShippingAddress = false;
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to show hide shipping address
   * @param event to change event
   */
  showShippingAddressFields(event) {
      this.showShippingAddress = event.checked;
      this.setValidators();
  }

  /**
   * Below four methods can be used for get form controls inside the sub form
   */
  get getBillingAddressCountry() {
    return this.departmentForm.get('billingAddress').get('country');
  }

  get getBillingAddressZipcode() {
    return this.departmentForm.get('billingAddress').get('zipCode');
  }

  get getShippingAddressZipcode() {
    return this.departmentForm.get('shippingAddress').get('zipCode');
  }

  get getShippingAddressCountry() {
    return this.departmentForm.get('shippingAddress').get('country');
  }

  get bAddressLine1() {
    return this.departmentForm.get('billingAddress').get('addressLine1');
  }

  get sAddressLine1() {
    return this.departmentForm.get('shippingAddress').get('addressLine1');
  }

  /**
   * Auto Complete Cities
   * @param event keyboard event
   * @param country this parameter represent formController value
   */
  filterCities(event, country) {
    if (country.value !== AppConstant.COUNTRY_US) {
      this.filteredGroups = [];
      return;
    }
    const query = event.query;
    const filtered = [];
    this.cities.forEach(city => {
      if (city.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(city);
      }
    });
    this.filteredGroups = filtered;
  }

  /**
   * Auto Complete Cities
   * @param event keyboard event
   * @param country this parameter represent formController value
   */
  filterStates(event, country) {
    if (country.value !== AppConstant.COUNTRY_US) {
      this.filteredGroups = [];
      return;
    }
    const query = event.query;
    const filtered = [];
    this.states.forEach(state => {
      if (state.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(state);
      }
    });
    this.filteredGroups = filtered;
  }

  /**
   * This method is used to set validators for billing address line 1 after user check useForPoCreation
   * check box
   */
  setValidators() {
    const useForPoCreation = this.departmentForm.get('useForPoCreation').value;
    const existShippingAddress = this.departmentForm.get('existShippingAddress').value;
    const billingAddressLine1 = this.departmentForm.get('billingAddress').get('addressLine1');
    const billingAddressCountry = this.getBillingAddressCountry;
    const shippingAddressLine1 = this.departmentForm.get('shippingAddress').get('addressLine1');
    const shippingAddressCountry = this.getShippingAddressCountry;

    if (!useForPoCreation) {
      billingAddressLine1.clearValidators();
      billingAddressLine1.updateValueAndValidity();
      billingAddressCountry.clearValidators();
      billingAddressCountry.updateValueAndValidity();
    } else {
      billingAddressLine1.setValidators([Validators.required]);
      billingAddressLine1.updateValueAndValidity();
      billingAddressCountry.setValidators([Validators.required]);
      billingAddressCountry.updateValueAndValidity();
    }

    if (useForPoCreation && existShippingAddress) {
      shippingAddressLine1.setValidators([Validators.required]);
      shippingAddressLine1.updateValueAndValidity();
      shippingAddressCountry.setValidators([Validators.required]);
      shippingAddressCountry.updateValueAndValidity();
    } else {
      shippingAddressLine1.clearValidators();
      shippingAddressLine1.updateValueAndValidity();
      shippingAddressCountry.clearValidators();
      shippingAddressCountry.updateValueAndValidity();
    }
  }
}