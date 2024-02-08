import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {RegisterRequestDto} from '../../../shared/dto/auth/vendor-register/register-request-dto';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {VendorMasterDto} from '../../../shared/dto/vendor/vendor-master-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {CommonUtility} from '../../../shared/utility/common-utility';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public vendorRegisterForm: UntypedFormGroup;
  public registerRequestDto: RegisterRequestDto = new RegisterRequestDto();
  public sicCode = [];
  public naicsCode = [];
  public countries: any;
  public vendorDto: VendorMasterDto = new VendorMasterDto();
  public paymentTypes: DropdownDto = new DropdownDto();
  public classification: DropdownDto = new DropdownDto();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);

  @ViewChild('w9Form')
  public w9Form: ElementRef;

  @ViewChild('diversity')
  public diversity: ElementRef;

  public loading = false;
  public queryParams;
  public queryUuid;
  public fromCard = false;

  constructor(public formBuilder: UntypedFormBuilder, public router: Router, public notificationService: NotificationService,
              public vendorService: VendorService, public messageService: MessageService, public activatedRoute: ActivatedRoute) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
  }

  ngOnInit(): void {
    this.vendorService.getSicCode().subscribe((res) => {
      this.sicCode = (res.body);
    });
    this.vendorService.getNaicsCode().subscribe((res) => {
      this.naicsCode = (res.body);
    });
    this.vendorService.getCountries().subscribe((res) => {
      this.countries = (res.body);
    });
    this.vendorRegisterForm = this.formBuilder.group({
      businessName: [null, Validators.required],
      contactPerson: [null, Validators.required],
      contactNumber: [null, Validators.required],
      country: [null, Validators.required],
      email: [null, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      sicCode: [null],
      naicsCode: [null],
      webUrl: [null],
      businessDescription: [null],
      w9Form: [null],
      w9FormName: [null],
      uuid: [null],
      id: [null],
      invitationUuid: [null],
      requestedTenantId: [null],
      classificationIdList: [null],
      diverseSupplier: [false],
      classificationAttachmentList: [null],
      classificationAttachmentListNames: [null],
      paymentOptionId: [null],
      isCard: [null]
    });

    this.queryParams = this.activatedRoute.snapshot.queryParams;
    this.queryUuid = this.activatedRoute.snapshot.queryParams?.uuid;
    this.fromCard = this.activatedRoute.snapshot.queryParams?.card === 'true';
    this.vendorRegisterForm.get('country').patchValue(AppConstant.COUNTRY_US);
    this.getVendorDetails();
    this.getPaymentType(this.paymentTypes);
    this.getClassificationList(this.classification);

    this.vendorRegisterForm.get('diverseSupplier').valueChanges.subscribe(value => {
      if (this.vendorRegisterForm.get('diverseSupplier').value){
        this.vendorRegisterForm.get('classificationIdList').setValidators(Validators.required);
      } else {
        this.vendorRegisterForm.get('classificationIdList').setValidators(null);
      }
      this.vendorRegisterForm.get('classificationIdList').updateValueAndValidity();
    });
  }

  getVendorDetails() {
    if (this.fromCard) {
      this.vendorRegisterForm.get('isCard').patchValue(this.fromCard);
    }
    if (!this.queryUuid) {
      return;
    }
    this.vendorService.getVendorDetailsFromUuid(this.queryUuid).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorRegisterForm.get('email').patchValue(res.body.email);
        this.vendorRegisterForm.get('email').disable();
        this.vendorRegisterForm.get('businessName').patchValue(res.body.businessName);
        this.vendorRegisterForm.get('id').patchValue(res.body.id);
        this.vendorRegisterForm.get('contactPerson').patchValue(res.body.contactPerson);
        this.vendorRegisterForm.get('uuid').patchValue(this.queryUuid);
        this.vendorRegisterForm.get('contactNumber').patchValue(res.body.contactNumber);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to submit the form
   * @param value to form values
   */
  onSubmit(value) {
    this.loading = true;
    this.vendorRegisterForm.get('contactNumber').markAsTouched();
    if (this.vendorRegisterForm.valid) {
      this.vendorDto.id = this.vendorRegisterForm.get('id').value;
      this.vendorDto.name = this.vendorRegisterForm.get('businessName').value;
      this.vendorDto.permenantAddress.country = this.vendorRegisterForm.get('country').value;
      this.vendorDto.contactPerson = this.vendorRegisterForm.get('contactPerson').value;
      this.vendorDto.contactNumber = new CommonUtility().getTelNo(this.vendorRegisterForm, 'contactNumber');
      this.vendorDto.email = this.vendorRegisterForm.get('email').value;
      this.vendorDto.sicCode = this.vendorRegisterForm.get('sicCode').value;
      this.vendorDto.naicsCode = this.vendorRegisterForm.get('naicsCode').value;
      this.vendorDto.webUrl = this.vendorRegisterForm.get('webUrl').value;
      this.vendorDto.businessDescription = this.vendorRegisterForm.get('businessDescription').value;
      this.vendorDto.w9Form = this.vendorRegisterForm.get('w9Form').value;
      this.vendorDto.uuid = this.vendorRegisterForm.get('uuid').value;
      this.vendorDto.paymentOptionId = this.vendorRegisterForm.get('paymentOptionId').value;
      this.vendorDto.classificationIdList = this.vendorRegisterForm.get('classificationIdList').value;
      this.vendorDto.diverseSupplier = this.vendorRegisterForm.get('diverseSupplier').value;
      this.vendorDto.classificationAttachmentList = this.vendorRegisterForm.get('classificationAttachmentList').value;
      if (undefined === this.queryParams.uuid) {
        this.vendorDto.invitationUuid = null;
        this.vendorDto.requestedTenantId = null;
      } else {
        this.vendorDto.invitationUuid = this.queryParams.uuid;
        this.vendorDto.requestedTenantId = this.queryParams.tenantid;
      }

      if (!this.vendorDto.diverseSupplier) {
        this.vendorDto.classificationIdList = [];
        this.vendorDto.classificationAttachmentList = null;
      }

      this.vendorService.registerVendor(this.vendorDto).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
            this.loading = false;
            this.vendorRegisterForm.reset();
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_REGISTERED_SUCCESSFULLY);

            setTimeout(() =>
                this.router.navigate(['/success']),
              2000);

          } else {
            this.loading = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, (error => {
          this.loading = false;
          this.notificationService.errorMessage(error);
        })
      );

    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.vendorRegisterForm);
    }
  }

  checkValidation(name) {
    if (this.vendorRegisterForm.get(name).value[0] === ' ') {
      this.vendorRegisterForm.get(name).patchValue('');
    }
  }

  fileUpload(event) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.vendorRegisterForm.patchValue({
        w9Form: targetFile
      });
    }
  }

  /**
   * This method use for get payment type list
   */
  getPaymentType(instance: DropdownDto) {
    this.vendorService.getPaymentTypeList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get classification list for dropdown
   */
  getClassificationList(instance: DropdownDto) {
    this.vendorService.getClassificationList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * patch classification attachments list
   */
  classificationUpload(event: any) {
    if (event.target.files[0]) {
      const targetFile = [];
      for (let index in event.target.files) {
        if (isNaN(event.target.files[index])) {
          targetFile.push(event.target.files[index]);
        }
      }
      this.vendorRegisterForm.patchValue({
        classificationAttachmentList: targetFile
      });
    } else {
      this.vendorRegisterForm.get('classificationAttachmentList').patchValue(null);
    }
  }

  getClassificationAttachmentNames(diversity: HTMLInputElement) {
    if (diversity.files.length > 1) {
      return `${diversity.files[0].name} and ${diversity.files.length - 1} more file(s)`;
    } else if (diversity.files.length === 1) {
      return diversity.files[0].name;
    } else {
      return null;
    }
  }

  resetForm() {
    if (this.w9Form?.nativeElement) {
      this.w9Form.nativeElement.value = null;
    }
    if (this.diversity?.nativeElement) {
      this.diversity.nativeElement.value = null;
    }
    this.vendorRegisterForm.reset();
    this.vendorRegisterForm.get('diverseSupplier').patchValue(false);
    this.vendorRegisterForm.get('country').patchValue(AppConstant.COUNTRY_US);
    this.getVendorDetails();
  }
}
