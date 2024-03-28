import {Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillSubmitInvoiceListDto} from '../../../shared/dto/bill/bill-submit-invoice-list-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {Subscription} from 'rxjs';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppInvoiceColors} from '../../../shared/enums/app-invoice-colors';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {ReceiptSocketService} from '../../../shared/services/expense/receipt-socket.service';

@Component({
  selector: 'app-receipt-upload',
  templateUrl: './receipt-upload.component.html',
  styleUrls: ['./receipt-upload.component.scss']
})
export class ReceiptUploadComponent implements OnInit, OnDestroy {
  receiptCreateFormGroup: UntypedFormGroup;
  uploadFormGroup: UntypedFormGroup;
  public smallHorSplitter = false;
  public screenSize: any;
  public responsiveSize;
  public employees: DropdownDto = new DropdownDto();
  public receiptList: BillSubmitInvoiceListDto[] = [];
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public enums = AppEnumConstants;
  public appFieldType = AppFieldType;
  public billDetail: BillMasterDto = new BillMasterDto();
  @Output() isCloseSubmissionView = new EventEmitter();
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;

  public appConstant: AppConstant = new AppConstant();
  public fileName: any;

  public currentIndex = 0;
  public currentIndexHover: any;
  public addNewVendor: boolean;
  public attachmentUrl: any;
  public originalFileName: string;
  public isLoading: boolean;
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public receiptId: any;
  public appAuthorities = AppAuthorities;
  public commonUtil = new CommonUtility();
  public appFormConstants = AppFormConstants;
  public isDataFetching = false;
  public subscription: Subscription = new Subscription();
  public loading: boolean;
  public files: any [] = [];
  public merchantResults: any;
  public addNewCard = false;
  public showIframeHider = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenSize = window.innerWidth;
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
  }

  constructor(public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public automationService: AutomationService, public expenseService: ExpenseService,
              public privilegeService: PrivilegeService, public sanitizer: DomSanitizer, public billsService: BillsService,
              private receiptSocketService: ReceiptSocketService) {
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.subscription.unsubscribe();
      this.receiptSocketService.configReceiptWebSocketConnection(false);
      this.receiptSocketService.disconnect();
    }, 2000);
  }


  ngOnInit(): void {
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }

    this.initForm();

    this.getEmployees();
    this.getPendingReceiptList();
    this.receiptSocketService.connect();

    this.subscription = this.receiptSocketService.behaviorSubject.subscribe(
      (val: any) => {
        this.checkOcrStatus(val);
      },
      err => console.error('Socket Error' + err)
    );
  }

  initForm() {
    this.uploadFormGroup = this.formBuilder.group({
      files: []
    });

    this.receiptCreateFormGroup = this.formBuilder.group({
      id: [null],
      employeeId: [null],
      cardNo: [AppConstant.NULL_VALUE],
      transactionDateStr: [AppConstant.NULL_VALUE, Validators.required],
      amount: [AppConstant.NULL_VALUE, Validators.compose([Validators.required, Validators.min(0.01)])],
      merchant: [AppConstant.NULL_VALUE],
      description: [AppConstant.NULL_VALUE],
    });
  }

  /**
   * Check Ocr Status from Socket
   * to update the status of bill list
   * @param receiptList from socket
   */
  checkOcrStatus(receiptList) {
    this.receiptList.forEach(value => {
      receiptList.forEach((value1) => {
        if (value.id === value1.id) {
          value.ocrRunningStatus = value1.ocrRunningStatus;
          if (value1.detectionLevel) {
            value.detectionLevel = value1.detectionLevel;
          }
          if (this.receiptId === value.id && this.isDataFetching) {
            this.isDataFetching = false;
            this.receiptSelected(value);
          }
        }
      });
    });
  }

  /**
   * This method can be used to get attachment pdf color
   * @param status to detection status
   */
  attachmentColors(status) {
    switch (status) {
      case 'F':
        return AppInvoiceColors.FULL_MATCH;
      case 'P':
        return AppInvoiceColors.HALF_MATCH;
      case 'N':
        return AppInvoiceColors.NO_MATCH;
    }
  }

  /**
   * On Files uploaded to drop zone
   * @param event
   */
  changeFileList(event) {
    this.files.push(...event.addedFiles);
    if (this.files.length === 0) {
      this.notificationService.infoMessage(HttpResponseMessage.FILE_UPLOAD_VALID);
      this.loading = false;
      return;
    }
    this.loading = true;
    this.expenseService.uploadReceipts(this.files).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.FILES_UPLOADED_SUCCESSFULLY);
          if (this.receiptList.length === 0) {
            this.getPendingReceiptList();
          } else {
            this.getExcludedReceiptList();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.loading = false;
        this.files = [];
      },
      error => {
        this.notificationService.errorMessage(error);
        this.loading = false;
        this.files = [];
      });
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  /**
   * Get excluded Receipt list
   */
  getExcludedReceiptList() {
    const existIds: any [] = [];
    this.receiptList.forEach(value => {
      existIds.push(value.id);
    });
    this.expenseService.getExcludedReceiptList(existIds).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        res.body.forEach(value => {
          this.receiptList.push(value);
        });
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * Get pending Receipt list
   */
  getPendingReceiptList() {
    this.expenseService.getUnSavedReceiptsList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.receiptList = res.body;
        this.receiptList.forEach(value => {
          if (value.ocrRunningStatus === this.enums.STATUS_FAILED) {
            value.ocrRunningStatus = this.enums.STATUS_NOT_PROCESSED;
          }
        });
        this.receiptSelected(this.receiptList[0]);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * This method can be used to get selected receipt data
   * @param receipt
   */
  receiptSelected(receipt) {
    if (!receipt) {
      return;
    }
    const id = receipt.id;
    if (this.isDataFetching) {
      if (this.receiptId !== id) {
        this.isDataFetching = false;
      }
    }
    if (receipt?.ocrRunningStatus === this.enums.STATUS_PENDING) {
      this.isDataFetching = true;
    }
    this.receiptId = id;
    this.resetForm();
    this.expenseService.getReceiptDetail(id).then((res: any) => {
      this.receiptCreateFormGroup.patchValue(res.body);
      this.generateAttachmentUrl(false, this.receiptId);
    });
  }

  /**
   * Is Splitter Resized End
   */
  splitterResized(event) {
    this.screenSize = window.innerWidth;
    const size = event.split('px');
    this.smallHorSplitter = !((this.screenSize / 2) > parseInt(size[0]));
  }


  getEmployees() {
    return new Promise<void>(resolve => {
      this.automationService.getApprovalUserList().subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.employees.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    })
  }

  /**
   * Generates a Url for view in iframe with security bypass
   * @param isDownload boolean
   * @param id to id
   */
  generateAttachmentUrl(isDownload: boolean, id) {
    this.expenseService.downloadReceipt(id).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      if (isDownload) {
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', this.originalFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.attachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Deletes a single attachment from list
   */
  deleteReceipt(obj, index) {
    this.confirmationService.confirm({
      message: 'You want to delete this Receipt',
      key: 'receipt-delete',
      accept: () => {
        this.expenseService.deleteReceipt(obj.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_RECEIPT_DELETED_SUCCESSFULLY);
            this.receiptList.splice(index, 1);
            if (this.receiptList.length === 0) {
              this.isCloseSubmissionView.emit(true);
            } else {
              this.receiptSelected(this.receiptList[0]);
              this.currentIndex = 0;
            }
            this.expenseService.receiptListSubject.next(true);
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
   * Detect Receipt From OCR
   * @param receipt
   */
  detectReceipt(receipt: BillSubmitInvoiceListDto) {
    // If already Receipt is status done or in pending
    if (receipt.ocrRunningStatus == this.enums.STATUS_DONE || receipt.ocrRunningStatus == this.enums.STATUS_PENDING) {
      return;
    }
    // If current Receipt Id == to selected Receipt id then disable the form
    if (this.receiptId === receipt.id) {
      this.isDataFetching = true;
    }
    // Change the Status of selected Receipt to Pending
    receipt.ocrRunningStatus = this.enums.STATUS_PENDING;
    this.expenseService.detectReceipt(receipt.id).then(() => {
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Read all data from OCR
   */
  readAllReceiptsFromOcr() {
    this.expenseService.detectAllReceipts().then(() => {
      this.receiptList.forEach(value => {
        if (!(value.ocrRunningStatus == this.enums.STATUS_DONE || value.ocrRunningStatus == this.enums.STATUS_PENDING)) {
          value.ocrRunningStatus = this.enums.STATUS_PENDING;
          if (value.id === this.receiptId) {
            this.isDataFetching = true;
          }
        }
      });
    }, error => {
      this.isDataFetching = false;
      this.notificationService.errorMessage(error);
      this.receiptList.forEach(value => {
        if (value.ocrRunningStatus == this.enums.STATUS_PENDING) {
          value.ocrRunningStatus = this.enums.STATUS_NOT_PROCESSED;
          this.isDataFetching = false;
        }
      });
    });
  }

  /**
   * On Vendor changed from dropdown event
   * @param id
   */
  changeVendorList(id) {
    if (id === 0) {
      this.addNewVendor = true;
      setTimeout(() => {
        this.receiptCreateFormGroup.controls.vendorId.reset();
      }, 100);
    }
  }

  /**
   * Search for Merchants on type
   * minimum 2 letters are required
   * @param event
   */
  searchMerchants(event: any) {
    this.expenseService.searchMerchants(event.query).subscribe(res => {
      this.merchantResults = res.body;
    });
  }

  /**
   * Reset the form
   */
  resetForm() {
    this.receiptCreateFormGroup.reset();
  }

  /**
   * Submit Form and check validations
   */
  submitForm() {
    this.isLoading = true;
    if (this.receiptCreateFormGroup.valid) {
      const obj = this.receiptCreateFormGroup.value;
      if (obj.transactionDateStr) {
        try {
          obj.transactionDateStr = obj.transactionDateStr.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        } catch (e) {

        }
      }
      if (obj.cardNo?.id) {
        obj.cardNo = obj.cardNo.id;
      }
      if (!obj.id) {
        obj.id = this.receiptId;
      }
      this.createReceipt(obj);
    } else {
      this.isLoading = false;
      new CommonUtility().validateForm(this.receiptCreateFormGroup);
    }
  }

  /**
   * Save Receipt Details receipt object
   * @private
   */
  createReceipt(obj) {
    this.expenseService.createReceipt(obj).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.RECEIPT_UPDATED_SUCCESSFULLY);
        this.receiptCreateFormGroup.reset();
        this.receiptList.splice(this.currentIndex, 1);
        if (this.receiptList.length === 0) {
          this.isCloseSubmissionView.emit(true);
        } else {
          this.receiptSelected(this.receiptList[this.currentIndex]);
        }
        this.expenseService.cardListSubject.next(true);
        this.expenseService.receiptListSubject.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  cardChanged(event: any) {
    if (event.value === -1) {
      this.receiptCreateFormGroup.get(AppFormConstants.CARD_NO).reset();
      this.addNewCard = true;
    }
  }
}
