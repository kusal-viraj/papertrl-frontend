import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {VendorBillTableDto} from '../../../shared/dto/vendor/vendor-bill-table-dto';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {VendorSuggestionDto} from '../../../shared/dto/vendor/vendor-suggestion-dto';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {CustomerRequestService} from '../../../shared/services/vendor-community/customer-request.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: VendorBillTableDto; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List

  public buttonValueInVendorTabResponsive: any;
  public bulkButtonListResponsive: any;

  public appAuthorities = AppAuthorities;
  public invitationForm: UntypedFormGroup;
  public suggestions: VendorSuggestionDto[] = [];
  public vendorId;

  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);

  public customers: DropdownDto = new DropdownDto();
  public customSelection: any[] = [];
  public btnLoading = false;

  public subscription = new Subscription();

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('dt') table: Table;
  @ViewChild('columnSelect') columnSelect: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public formBuilder: UntypedFormBuilder,
              public customerRequest: CustomerRequestService, public gridService: GridService, public messageService: MessageService,
              public privilegeService: PrivilegeService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.VENDOR_INVITATION_TABLE_KEY);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.CUSTOMERS_RESEND_REQUEST)) {
      this.availableHeaderActions.push(AppTableHeaderActions.RE_SENT_REQUEST);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.CUSTOMERS_DELETE_REQUEST)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);



    this.invitationForm = this.formBuilder.group({
      customerIds: [null, Validators.required],
      vendorId: [null],
    });

    this.loadTableData();
    this.actionButtonInit();
    this.getCustomers();
  }

  ////////////////////// Customer Form Starts/////////////////////

  getCustomers() {
    this.resetForm();
    this.customerRequest.getCustomerList().subscribe((res: any) => {
      this.customers.data = res.body;
    });
  }

  /**
   * This method can be used to submit vendor invitation form data
   * @param vendorInvitationForm to Form Group Instance
   */
  onSubmit(vendorInvitationForm: UntypedFormGroup) {
    this.btnLoading = true;
    this.invitationForm.get('vendorId').patchValue(this.vendorId);
    if (vendorInvitationForm.valid) {
      this.customerRequest.sendCustomerRequest(vendorInvitationForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_REQUEST_SENT_SUCCESSFULLY);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.getCustomers();
          this.btnLoading = false;
        } else {
          this.btnLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error) => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.invitationForm);
    }
  }

  /**
   * This method can be used to reset invitation form
   */
  resetForm() {
    this.invitationForm.reset();
  }


  ////////////////////// Customer Form Ends/////////////////////


  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.VENDOR_INVITATION_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_CUSTOMER_INVITATION_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.VENDOR_INVITATION_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getDataFromBackend();
  }

  getDataFromBackend() {
    this.customerRequest.getCustomerRequestTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (this.tableSupportBase.totalRecords === 0) {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
          } else {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_PENDING,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CUSTOMERS_DELETE_REQUEST),
        icon: this.iconEnum.ICON_DELETE,
        command: () => {
          const id = this.activeAction.id;
          this.deleteRequest(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_REJECT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CUSTOMERS_DELETE_REQUEST),
        icon: this.iconEnum.ICON_DELETE,
        command: () => {
          const id = this.activeAction.id;
          this.deleteRequest(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_RESEND_INVITATION,
        status: this.enums.STATUS_REJECT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CUSTOMERS_RESEND_REQUEST),
        icon: this.iconEnum.ICON_RESEND_INVITATION,
        command: () => {
          const id = this.activeAction.id;
          this.resendRequest(id);
        }
      },
    ];
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VENDOR_INVITATION_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_CUSTOMER_INVITATION_LIST;
            this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * This method use for get bulk button list data
   */


  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_DELETE:
        this.deleteRequestBulk();
        break;
      case AppBulkButton.RESEND_REQUEST:
        this.resentRequestBulk();
        break;
    }
  }


  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorBillTableDto) {
    this.activeAction = val;
  }


  public deleteRequest(id: any) {
    this.confirmationService.confirm({
      message: 'You want to delete this Request',
      key: 'customer',
      accept: () => {
        this.customerRequest.deleteRequest(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.getCustomers();
            this.customSelection = [];
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_REQUEST_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  public resendRequest(id: any) {
    this.customerRequest.resendRequest(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.customSelection = [];
        this.tableSupportBase.rows = [];
        this.getCustomers();
        this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_REQUEST_RESENT_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public deleteRequestBulk() {
    if (this.customSelection.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.customSelection.length > i; i++) {
        ids.push(this.customSelection[i].id);
      }

      this.confirmationService.confirm({
        message: 'You want to delete these Selected Request(s)',
        key: 'customer',
        accept: () => {
          this.customerRequest.deleteRequestBulk(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.customSelection = [];
                this.tableSupportBase.rows = [];
                this.getCustomers();
              } else {
                this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_REQUESTS_DELETED_SUCCESSFULLY);
                this.customSelection = [];
                this.tableSupportBase.rows = [];
                this.getCustomers();
                this.loadData(this.tableSupportBase.searchFilterDto);
              }
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  resentRequestBulk() {
    if (this.customSelection.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.customSelection.length > i; i++) {
        ids.push(this.customSelection[i].id);
      }

      this.customerRequest.resendRequestBulk(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.customSelection = [];
            this.tableSupportBase.rows = [];
            this.getCustomers();
          } else {
            this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_REQUESTS_RESENT_SUCCESSFULLY);
            this.customSelection = [];
            this.tableSupportBase.rows = [];
            this.getCustomers();
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  rowSelected() {
    this.customSelection = this.tableSupportBase.rows;
    this.customSelection = this.customSelection.filter(item => JSON.parse(JSON.stringify(item))['rel.status']
      !== AppEnumConstants.STATUS_APPROVED);
  }
}
