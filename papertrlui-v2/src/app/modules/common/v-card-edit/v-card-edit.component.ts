import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {VCard} from "../../../shared/dto/v-card/v-card";
import {AppConstant} from "../../../shared/utility/app-constant";
import {OverlayPanel} from "primeng/overlaypanel";
import {ConfirmationService} from "primeng/api";
import {PaymentService} from "../../../shared/services/payments/payment.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppDocumentType} from "../../../shared/enums/app-document-type";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {debounceTime, Subject, Subscription} from "rxjs";
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";

@Component({
  selector: 'app-v-card-edit',
  templateUrl: './v-card-edit.component.html',
  styleUrls: ['./v-card-edit.component.scss']
})
export class VCardEditComponent implements OnInit, OnDestroy {

  @Output() closeDetailView = new EventEmitter();
  @Output() updateGrid = new EventEmitter();
  @Input() id;
  @Input() detailView;
  @Input() editFromAction = false;
  @Input() hideEditAction = false;
  @Input() statusActive = true;
  public editView = false;
  public fieldChanged = false;
  public vCard: VCard = new VCard();
  public appConstant: AppConstant = new AppConstant();
  public tableSupportBase = new TableSupportBase();
  public appDocumentType = AppDocumentType;
  public commonUtil: CommonUtility = new CommonUtility();
  public appEnumConstants = AppEnumConstants;
  public loading = false;
  public overlayId: any;
  public today = new Date();
  public maxDate = new Date();
  public formGroup: FormGroup;


  private subscription: Subscription | null = null;
  hoverTimeout;
  canShowOverlay = true;
  @ViewChild('billOverlay') public billOverlay: OverlayPanel;
  @ViewChild('expenseOverlay') expenseOverlay: OverlayPanel;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('accountOverlay') accountOverlay: OverlayPanel;
  @ViewChild('projectOverlay') projectOverlay: OverlayPanel;
  @ViewChild('nickName') public inputNickName: ElementRef;


  constructor(public confirmationService: ConfirmationService, private paymentService: PaymentService,
              private notificationService: NotificationService, public privilegeService: PrivilegeService,
              private detailViewService: DetailViewService, public formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.subscription = this.detailViewService._cardsState.subscribe(state => {
      if (state && state.id) {
        this.id = state.id;
        this.detailView = state.detailView;
        this.getVCardData();
        this.detailViewService._cardsState.next(null);
      }
    });
    this.formGroup = this.formBuilder.group({
      nickName: [null, [Validators.required]],
      cardNumber: [null],
      cardOwner: [null],
      utilizedAmountStr: [null],
      balanceAmountStr: [null],
      amount: [null, [Validators.required]],
      amountStr: [null],
      id: [null],
      poId: [null],
      poNo: [null],
      poAmount: [null],
    });
    this.today.setDate(this.today.getDate() + 1); // Add one day
    this.editView = this.editFromAction;
    this.getVCardData();
  }

  getVCardData() {
    if (!this.id) {
      return;
    }
    this.paymentService.getVCardData(this.id).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.vCard = res.body;
          this.inputNickName.nativeElement.focus();
          try {
            res.body.maxDate = new Date(res.body.maxDate);
          } catch (e) {

          }
          this.formGroup.patchValue(res.body);
          if (res.body.cardType === AppEnumConstants.CARD_TYPE_DIGITAL) {
            this.formGroup.get('amount').setValidators([Validators.required, minValue(res.body.utilizedAmountStr)]);
            this.formGroup.get('amount').updateValueAndValidity();
            if (res.body.poId && res.body.poAmount) {
              this.formGroup.get('amount').setValidators([Validators.compose([Validators.required,
                maxValue(res.body.poAmount), minValue(res.body.utilizedAmountStr)])]);
              this.formGroup.get('amount').updateValueAndValidity();
            }
          }

          // Function to create max value validator
          function maxValue(max): ValidatorFn {
            return (control: AbstractControl): { [key: string]: any } | null => {
              const forbidden = control.value > max;
              return forbidden ? {max: {value: control.value}} : null;
            };
          }

          function minValue(min): ValidatorFn {
            return (control: AbstractControl): { [key: string]: any } | null => {
              const forbidden = control.value <= min;
              return forbidden ? {min: {value: control.value}} : null;
            };
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error: err => this.notificationService.errorMessage(err)
    });
  }

  reset() {
    this.fieldChanged = false;
    this.getVCardData();
  }

  close(switchEdit) {
    if (!this.editView && switchEdit) {
      this.editView = !this.editView;
      return;
    }

    if (this.fieldChanged) {
      this.confirmationService.confirm({
        key: 'fieldChange',
        message: 'You want to discard unsaved changes',
        accept: () => {
          this.fieldChanged = false;
          if (switchEdit) {
            this.editView = !this.editView;
            this.getVCardData();
            return;
          }
          this.closeDetailView.emit();
        }
      });
    } else if (switchEdit) {
      this.editView = !this.editView;
    } else {
      this.detailView = false;
      this.closeDetailView.emit();
    }
  }

  submit() {
    if (this.formGroup.invalid) {
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.loading = true;
    const vCard = Object.assign({}, this.vCard);
    vCard.effectiveUntil = null;
    try {
      vCard.effectiveUntilStr = vCard.effectiveUntilStr.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } catch (e) {
    }
    vCard.amount = this.formGroup.get('amount').value;
    vCard.nickName = this.formGroup.get('nickName').value;
    this.paymentService.updateVCardData(vCard).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.CARD_UPDATED_SUCCESSFULLY);
          if (this.editFromAction) {
            this.closeDetailView.emit();
            this.updateGrid.emit();
            return;
          }
          if (this.editView) {
            this.getVCardData();
            this.editView = false;
            this.fieldChanged = false;
            this.detailView = true;
            this.updateGrid.emit();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error: err => {
        this.loading = false;
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * A Single value hover from table
   * @param id id
   * @param type doc type
   */
  tdHover(id, type, event, target) {
    // Clear the timeout when a new hover event is triggered
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.canShowOverlay = true;

    // Set a new timeout
    this.hoverTimeout = setTimeout(() => {
      if (this.canShowOverlay) {
        if (type === AppDocumentType.BILL &&
          this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
          this.overlayId = id;
          showOverlay(this.billOverlay);
        }
        if (type === AppDocumentType.EXPENSE_REPORT &&
          this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
          this.overlayId = id;
          showOverlay(this.expenseOverlay);
        }

        if (type === AppDocumentType.PURCHASE_ORDER &&
          this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
          this.overlayId = id;
          showOverlay(this.poOverlay);
        }

        if (type === AppDocumentType.PROJECT &&
          this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW)) {
          this.overlayId = id;
          showOverlay(this.projectOverlay);
        }

        if (type === AppDocumentType.ACCOUNT &&
          this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DETAIL_VIEW)) {
          this.overlayId = id;
          showOverlay(this.accountOverlay);
        }
      }
    }, 300); // delay of 300ms

    function showOverlay(overlay) {
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event, target);
      }
    }
  }

  /**
   * A Single value clicked from table
   * @param id id
   * @param type doc type
   */
  tdClick(id, type) {
    if (type === AppDocumentType.BILL && this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
      this.detailViewService.openBillDetailView(id);
    }
    if (type === AppDocumentType.EXPENSE_REPORT && this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
      this.detailViewService.openExpenseDetailView(id);
    }
    if (type === AppDocumentType.PURCHASE_ORDER && this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
      this.detailViewService.openPODetailView(id);
    }
    if (type === AppDocumentType.PROJECT && this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW)) {
      this.detailViewService.openProjectCodeDetailView(id);
    }
    if (type === AppDocumentType.ACCOUNT && this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW)) {
      this.detailViewService.openAccountsDetailView(id);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    // clear any existing timeout to avoid showing overlay after mouse has left
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.canShowOverlay = false;
    }

    if (this.billOverlay.overlayVisible) {
      this.billOverlay.hide();
    }
    if (this.expenseOverlay.overlayVisible) {
      this.expenseOverlay.hide();
    }
    if (this.poOverlay.overlayVisible) {
      this.poOverlay.hide();
    }
    if (this.accountOverlay.overlayVisible) {
      this.accountOverlay.hide();
    }
    if (this.projectOverlay.overlayVisible) {
      this.projectOverlay.hide();
    }
  }

  get f() {
    return this.formGroup.controls;
  }

  /**
   *
   * @param status
   */
  getStatus(status: string): string {
    switch (status) {
      case this.appEnumConstants.STATUS_LETTER_CANCELED:
        return this.appEnumConstants.LABEL_TRANSACTION_CANCELED;
      case this.appEnumConstants.STATUS_LETTER_ACTIVE:
        return this.appEnumConstants.STATUS_ACTIVE;
      case this.appEnumConstants.STATUS_LETTER_INACTIVE:
        return this.appEnumConstants.STATUS_INACTIVE;
      default:
        return '-';
    }
  }

  /**
   * Is the field is has data to show in overlay
   * @param type doc type
   */
  isClassHover(type) {
    if (type === AppDocumentType.BILL) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
    }

    if (type === AppDocumentType.EXPENSE_REPORT) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
    }

    if (type === AppDocumentType.PURCHASE_ORDER) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
    }

    if (type === AppDocumentType.PROJECT) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW);
    }

    if (type === AppDocumentType.ACCOUNT) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DETAIL_VIEW);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onHide() {
    this.editView = false;
    this.detailView = false;
    this.closeDetailView.emit(true);
  }
}
