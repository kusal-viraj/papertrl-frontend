import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ActivatedRoute, Router} from '@angular/router';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {CreateVendorComponent} from '../create-vendor/create-vendor.component';
import {VirtualScroller} from 'primeng/virtualscroller';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {VendorFilterDto} from '../../../shared/dto/vendor/vendor-filter-dto';
import {VendorListDto} from '../../../shared/dto/vendor/vendor-list-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PoService} from '../../../shared/services/po/po.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {VendorInvoiceComponent} from '../vendor-invoice/vendor-invoice.component';
import {VendorPaymentComponent} from '../vendor-payment/vendor-payment.component';
import {VendorPoComponent} from '../vendor-po/vendor-po.component';
import {VendorGrnComponent} from '../vendor-grn/vendor-grn.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {VendorItemListComponent} from '../item/vendor-item-list/vendor-item-list.component';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {VendorDetailViewComponent} from '../vendor-detail-view/vendor-detail-view.component';

@Component({
  selector: 'app-vendor-home',
  templateUrl: './vendor-home.component.html',
  styleUrls: ['./vendor-home.component.scss']
})
export class VendorHomeComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public invoice = true;
  public vendorInfo = true;
  public beforeVendorInfo: boolean; // bring to current state from edit pages
  public vendorIdToEdit; // to vendor edit component
  public tabIndex = 0;
  public fromNotification = false;
  public clickedVendor: any;
  public searchVendor: any;
  public moreVendorDetailsMain: boolean;
  public letters: any[];
  public clickedLetter: number;
  public isOpenEditPage = false;
  public isVendorUploadPanel = false;
  public filterValues: VendorFilterDto = new VendorFilterDto();
  public vendorList: VendorListDto[] = [];
  public items;
  public vendorActionList: any [] = [];
  public statusEnums = AppEnumConstants;
  public vendorSearchCategories = [];
  public vendorSearchCategory: any;
  public searchVendorLetter: any;
  public vendorSearchSortOrder: boolean;
  public singleVendorId: any;
  public vendorName: any;
  public vendorId: any;
  public vendorEditName: any;
  public screenHeight: number;
  public vendorClickedAfterFilter = false;
  public vendorCollapsed = false;
  public vendorItemUpload = false;
  public firstVendor: any;
  public appAuthorities = AppAuthorities;
  public appEnumConstants = AppEnumConstants;
  public showSendInvitationButton: boolean;
  public isVendorCreate = false;

  @ViewChild('vs') vs: VirtualScroller;
  @ViewChild('createVendorComponent') createVendorComponent: CreateVendorComponent;

  @ViewChild('vendorInvoiceComponent') vendorInvoiceComponent: VendorInvoiceComponent;
  @ViewChild('vendorBillPaymentComponent') vendorBillPaymentComponent: VendorPaymentComponent;
  @ViewChild('vendorPurchaseOrder') vendorPurchaseOrder: VendorPoComponent;
  @ViewChild('vendorPoReceiptComponent') vendorPoReceiptComponent: VendorGrnComponent;
  @ViewChild('vendorItemListComponent') vendorItemListComponent: VendorItemListComponent;
  @ViewChild('vendorDetailViewComponent') vendorDetailViewComponent: VendorDetailViewComponent;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight - 208;
  }

  constructor(public router: Router, public billsService: BillsService, public privilegeService: PrivilegeService,
              public poService: PoService, private messageService: MessageService, public vendorService: VendorService,
              public route: ActivatedRoute, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public formGuardService: FormGuardService) {
    this.letters =
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  }

  ngOnInit(): void {
    this.onResize();
    this.route.params.subscribe(params => {
      if (params.id && params.status) {
        this.vendorInfo = false;
        this.isOpenEditPage = false;
        this.tabIndex = 2;
        this.fromNotification = true;
        return;
      }
      if (params.tab !== undefined) {
        this.fromNotification = true;
        this.vendorInfo = false;
        this.isOpenEditPage = false;
        this.tabIndex = parseInt(params.tab);
      }
    });

    // Tab view dropDown
    this.items = [
      {
        label: AppActionLabel.ACTION_SEND_INVITATION,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_SEND_VENDOR_INVITATION),
        command: () => {
          this.vendorInfo = false;
          this.isOpenEditPage = false;
          this.tabIndex = 0;
        }
      },
      {separator: true},
      {
        label: AppActionLabel.ACTION_IMPORT_VENDORS,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_UPLOAD),
        command: () => {
          this.isVendorUploadPanel = true;
        }
      },
      {separator: true},
      {
        label: AppActionLabel.ACTION_EXPORT_VENDORS,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_CSV_EXPORT),
        command: () => {
          this.vendorInfo = true;
          this.isOpenEditPage = false;
          this.exportVendor();
        }
      },
      {separator: true},
      {
        label: AppActionLabel.ACTION_VENDOR_REQUEST,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.VENDORS_APPROVE_VENDOR_REQUEST,
          AppAuthorities.VENDORS_DELETE_VENDOR_REQUEST, AppAuthorities.VENDORS_REJECT_VENDOR_REQUEST]),
        command: () => {
          this.vendorInfo = false;
          this.isOpenEditPage = false;
          this.tabIndex = 1;
        }
      },
      {separator: true},
      {
        label: AppActionLabel.ACTION_VENDOR_GROUPS,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.VENDOR_GROUP_CREATE,
          AppAuthorities.VENDOR_GROUP_EDIT, AppAuthorities.VENDOR_GROUP_DELETE, AppAuthorities.VENDOR_GROUP_INACTIVATE,
          AppAuthorities.VENDOR_GROUP_ACTIVATE]),
        command: () => {
          this.vendorInfo = false;
          this.isOpenEditPage = false;
          this.tabIndex = 2;
        }
      },
      {separator: true},
      {
        label: AppActionLabel.ACTION_COMMUNITY_VENDOR,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_ADD_TO_LOCAL_VENDOR_LIST),
        command: () => {
          this.vendorInfo = false;
          this.isOpenEditPage = false;
          this.tabIndex = 3;
        }
      }
    ];

    this.vendorActionList = [
      {
        icon: AppIcons.ICON_EDIT,
        label: AppActionLabel.ACTION_LABEL_EDIT,
        status: this.statusEnums.STATUS_ACTIVE,
        invitation: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_EDIT),
        command: () => {
          this.editVendorFromList(this.singleVendorId);
        }
      },
      {separator: true},
      {
        icon: AppIcons.ICON_DELETE, label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.statusEnums.STATUS_ACTIVE,
        invitation: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DELETE),
        command: () => {
          this.deleteVendorFromList(this.singleVendorId);
        }
      },
      {separator: true},
      {
        icon: AppIcons.ICON_DELETE, label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.statusEnums.STATUS_INACTIVE,
        invitation: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DELETE),
        command: () => {
          this.deleteVendorFromList(this.singleVendorId);
        }
      },
      {separator: true},
      {
        icon: AppIcons.ICON_INACTIVATE,
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.statusEnums.STATUS_ACTIVE,
        invitation: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_INACTIVATE),
        command: () => {
          const id = this.singleVendorId;
          this.deActivateVendorFromList(id);
        }
      },
      {separator: true},
      {
        icon: AppIcons.ICON_ACTIVE,
        status: this.statusEnums.STATUS_INACTIVE,
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        invitation: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_ACTIVATE),
        command: () => {
          const id = this.singleVendorId;
          this.activateVendorFromList(id);
        }
      },
      {separator: true},
      {
        icon: AppIcons.ICON_RESEND_INVITATION,
        label: AppActionLabel.ACTION_SEND_INVITATION,
        status: this.statusEnums.STATUS_ACTIVE,
        invitation: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_SEND_VENDOR_INVITATION),
        command: () => {
          const id = this.singleVendorId.id;
          this.sendInvitation(id);
        }
      },
      {separator: true},
      {
        icon: AppIcons.ICON_SEND_ACH_INFORMATION_REQUEST,
        label: AppActionLabel.ACTION_LABEL_SEND_ACH_INFORMATION_REQUEST,
        status: this.statusEnums.STATUS_ACTIVE,
        invitation: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.REQUEST_ACH_INFO),
        command: () => {
          const id = this.singleVendorId.id;
          this.sendACHInformationInvitation(id);
        }
      },
    ];

    // Dropdown menu list to search vendors
    this.vendorSearchCategories = [
      {label: 'Vendor Name', value: 'vendor.name'},
      {label: 'Vendor Code', value: 'vendor.vendorCode'},
      {label: 'Email', value: 'vendor.email'},
      {label: 'Contact Person', value: 'vendor.contactPerson'},
      {label: 'Active', value: AppEnumConstants.STATUS_ACTIVE},
      {label: 'Inactive', value: AppEnumConstants.STATUS_INACTIVE},
    ];

    // selected first element on dropdown to search
    this.vendorSearchCategory = this.vendorSearchCategories[0].value;
    this.filterValues.vendorSearchType = undefined;
    this.filterValues.vendorSearchValue = undefined;
    this.filterValues.sortOrder = undefined;
    this.filterValues.startLetter = undefined;
  }

  /**
   * Change actions (Edit, Delete, Inactivate, Activate) button array list according to status
   * @param status status
   * @param isCommunityVendor
   */
  actionButtonList(status, isCommunityVendor) {
    return this.vendorActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, isCommunityVendor));
  }

  mainActionButtonList() {
    return this.items.filter(x => x.authCode);
  }

  /**
   * This method use for filter table action match by element status+
   * @param status to status
   * @param common to common
   * @param isCommunityVendor
   */
  isActionMatch(status, common, isCommunityVendor) {
    return function f(element) {
      return (element.status === status || element.status === common) && element.authCode &&
        (!element.invitation || (element.invitation && !isCommunityVendor));
    };
  }

  /**
   * Edit Vendor From List
   */
  editVendorFromList(singleVendorId: any) {
    this.isOpenEditPage = false;
    setTimeout(() => {
      this.vendorIdToEdit = singleVendorId.id;
      this.isOpenEditPage = true;
      this.vendorEditName = singleVendorId.vendorName;
    }, 100);
  }

  /**
   * edit vendor after vendor selected
   */
  editVendor() {
    this.vendorIdToEdit = this.vendorId;
    this.vendorEditName = this.vendorName;
    this.isOpenEditPage = true;
  }

  /**
   * Delete Vendor From List
   */
  deleteVendorFromList(singleVendorId: any) {
    this.confirmationService.confirm({
      message: 'You want to delete this Vendor',
      key: 'vendor-home',
      accept: () => {
        this.vendorService.deleteVendor(singleVendorId.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.refreshVendorList(singleVendorId.id);
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_DELETED_SUCCESSFULLY);
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
   * Activate Vendor from List
   */
  activateVendorFromList(singleVendorId: any) {
    this.vendorService.activateVendor(singleVendorId.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.refreshVendorList();
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_ACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Deactivate Vendor from List
   */
  deActivateVendorFromList(singleVendorId: any) {
    this.vendorService.inActivateVendor(singleVendorId.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.refreshVendorList();
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_INACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to create vendor
   */
  createVen() {
    this.isOpenEditPage = false;
    // this.vendorInfo = false;
    this.isVendorCreate = true;
  }

  /**
   * This method can be used to export local vendors
   */
  exportVendor() {
    this.vendorService.exportLocalVendor(this.filterValues).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Vendor_List');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
  }

  /**
   * This method use to get specific vendor
   * @param val click index
   */
  vendorSelected(val) {
    this.vendorClickedAfterFilter = true;
    this.moreVendorDetailsMain = false;
    this.isOpenEditPage = false;
    this.vendorId = val.id;
    this.tabIndex = 0;
    this.vendorInfo = true;
    this.vendorName = val.vendorName;
    this.beforeVendorInfo = this.vendorInfo;

    if (this.vendorDetailViewComponent) {
      this.vendorDetailViewComponent.init(this.vendorId);
    }

    if (this.vendorInvoiceComponent) {
      this.vendorInvoiceComponent.loadTableData().then(value => {
        this.vendorInvoiceComponent.loadData(this.vendorInvoiceComponent.tableSupportBase.searchFilterDto);
      });
    }

    if (this.vendorBillPaymentComponent) {
      this.vendorBillPaymentComponent.loadTableData().then(() => {
        this.vendorBillPaymentComponent.loadData(this.vendorBillPaymentComponent.tableSupportBase.searchFilterDto);
      });
    }

    if (this.vendorPurchaseOrder) {
      this.vendorPurchaseOrder.loadTableData().then(() => {
        this.vendorPurchaseOrder.loadData(this.vendorPurchaseOrder.tableSupportBase.searchFilterDto);
      });
    }

    if (this.vendorPoReceiptComponent) {
      this.vendorPoReceiptComponent.loadTableData().then(() => {
        this.vendorPoReceiptComponent.loadData(this.vendorPoReceiptComponent.tableSupportBase.searchFilterDto);
      });
    }

    if (this.vendorItemListComponent) {
      this.vendorItemListComponent.loadTableData().then(() => {
        this.vendorItemListComponent.loadData(this.vendorItemListComponent.tableSupportBase.searchFilterDto);
      });
    }
  }

  /**
   * This method can be used to store data to session storage
   * @param index to tab index
   */
  vendorTabCHanged(index: number) {
    this.tabIndex = index;
    // this.storeSessionStore();
    const actionNames = [
      AppAnalyticsConstants.CREATE_VENDOR,
      AppAnalyticsConstants.SEND_AN_INVITATION,
      AppAnalyticsConstants.IMPORT_VENDORS,
      AppAnalyticsConstants.VENDOR_REQUESTS,
      AppAnalyticsConstants.VENDOR_GROUPS,
      AppAnalyticsConstants.COMMUNITY_VENDOR
    ];
    const actionName = actionNames[index] || '';
    this.vendorService.changeMainTabSet.next(actionName);
  }

  ngOnDestroy() {
    sessionStorage.removeItem(AppTableKeysData.VENDOR_STATE_KEY);
  }

  /**
   * This method execute load data to view
   * @param event to lazy load event
   */
  loadVendorListLazy(event: LazyLoadEvent) {
    this.filterValues.first = event.first;
    this.filterValues.rows = event.rows;
    this.filterValues.vendorSearchType = this.vendorSearchCategory;

    this.vendorService.searchVendors(this.filterValues).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.vendorList = Array.from({length: res.body.totalRecords});
          const loadedProducts = res.body.data;

          Array.prototype.splice.apply(this.vendorList, [
            ...[event.first, event.rows],
            ...loadedProducts
          ]);

          if (this.vendorList[0] && !this.clickedVendor && !this.searchVendor) {
            this.firstVendor = this.vendorList[0];
            this.loadFirstVendor(this.firstVendor);
          }

          // this.vendorList = [...loadedProducts];
          event.forceUpdate();

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * This method used to load first local vendor
   */
  loadFirstVendor(vendor) {
    if (this.fromNotification) {
      this.fromNotification = true;

    } else if (vendor) {
      this.vendorClicked(vendor);
    } else {
      this.createVen();
    }
  }

  /**
   * This method can be used to filter values
   */
  searchValue() {
    if (this.vendorSearchCategory === AppEnumConstants.STATUS_ACTIVE || this.vendorSearchCategory === AppEnumConstants.STATUS_INACTIVE) {
      this.searchVendor = undefined;
    }
    this.filterValues.vendorSearchType = this.vendorSearchCategory;
    this.filterValues.vendorSearchValue = this.searchVendor;
    this.filterValues.startLetter = this.searchVendorLetter;
    this.filterValues.sortOrder = this.vendorSearchSortOrder === true ? 'asc' : this.vendorSearchSortOrder === false ? 'desc' : undefined;
    this.vendorFilterGetData();
  }

  vendorFilterGetData() {
    this.filterValues.first = 0;
    this.filterValues.rows = 30;
    this.vendorClickedAfterFilter = false;
    this.vendorService.searchVendors(this.filterValues).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.vendorList = Array.from({length: res.body.totalRecords});
          this.vendorList = res.body.data;
          this.clickedVendor = undefined;
          if (this.vendorClickedAfterFilter) {
            this.vendorSelected(this.vendorList[0]);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * Send Invitation to Local Vendor
   */
  sendInvitation(id) {
    this.confirmationService.confirm({
      message: 'You want to send an invitation to ' + this.vendorName,
      key: 'vendor-invitation',
      accept: () => {
        this.vendorService.sendInvitation(id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.VENDOR_INVITATION_SENT_SUCCESSFULLY);
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, (error => {
            this.notificationService.errorMessage(error);
          })
        );
      }
    });
  }


  sendACHInformationInvitation(id) {
    this.confirmationService.confirm({
      message: 'You want to send an invitation to ' + this.vendorName,
      key: 'vendor-invitation',
      accept: () => {
        this.vendorService.sendACHInvitation(id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.VENDOR_ACH_REQUEST_SENT_SUCCESSFULLY);
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, (error => {
            this.notificationService.errorMessage(error);
          })
        );
      }
    });
  }

  /**
   * Clear All Vendor Filters
   */
  clearAllVendorFilters() {
    this.filterValues.vendorSearchValue = undefined;
    this.filterValues.startLetter = undefined;
    this.filterValues.sortOrder = undefined;
    this.filterValues.vendorSearchType = this.vendorSearchCategories[0].value;
    this.searchVendor = undefined;
    this.vendorSearchSortOrder = undefined;

    this.clickedLetter = undefined;
    this.searchVendor = undefined;
    this.searchVendorLetter = undefined;
    this.vendorSearchCategory = this.vendorSearchCategories[0].value;
    this.vendorFilterGetData();
  }

  letterClicked() {
    this.searchVendor = undefined;
  }

  letterTyped() {
    this.clickedLetter = undefined;
    this.searchVendorLetter = undefined;
  }

  refreshVendorList(id?, object?) {
    this.filterValues.rows = 30;
    if (object){
      id = object.id;
    }
    if (this.clickedVendor.id === id) {
      this.vs.scrollToIndex(0);
    }
    this.vendorService.searchVendors(this.filterValues).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.vendorList = Array.from({length: res.body.totalRecords});
          const loadedProducts = res.body.data;

          Array.prototype.splice.apply(this.vendorList, [
            ...[0, 30],
            ...loadedProducts
          ]);
          if (this.clickedVendor.id === id) {
            this.firstVendor = this.vendorList[0];
            this.loadFirstVendor(this.firstVendor);
          }

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * Does user has accesses to vendor
   */
  isVendorDetailsAuthorized() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.VENDORS_EDIT, AppAuthorities.VENDORS_MANAGE_VENDOR_REQUEST,
      AppAuthorities.VENDORS_UPLOAD, AppAuthorities.VENDORS_SEND_VENDOR_INVITATION, AppAuthorities.VENDORS_CREATE,
      AppAuthorities.VENDORS_DETAIL_VIEW, AppAuthorities.VENDORS_DELETE, AppAuthorities.VENDOR_SHOW_BILLS,
      AppAuthorities.VENDOR_SHOW_BILL_PAYMENTS, AppAuthorities.VENDOR_SHOW_PURCHASE_ORDERS, AppAuthorities.VENDOR_SHOW_PO_RECEIPTS,
      AppAuthorities.VENDORS_CSV_EXPORT]);
  }

  /**
   * Does user has accesses to bill
   */
  isVendorBillAuthorized() {
    return this.privilegeService.isAuthorized(AppAuthorities.VENDOR_SHOW_BILLS);
  }

  /**
   * Does user has accesses to bill payment
   */
  isVendorBillPaymentAuthorized() {
    return this.privilegeService.isAuthorized(AppAuthorities.VENDOR_SHOW_BILL_PAYMENTS);
  }

  /**
   * Does user has accesses to po
   */
  isVendorPOAuthorized() {
    return this.privilegeService.isAuthorized(AppAuthorities.VENDOR_SHOW_PURCHASE_ORDERS);
  }

  /**
   * Does user has accesses to po receipt
   */
  isVendorPOReceiptAuthorized() {
    return this.privilegeService.isAuthorized(AppAuthorities.VENDOR_SHOW_PO_RECEIPTS);
  }

  /**
   * check weather is access is available to user
   */
  isVendorItem() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.ITEMS_CREATE,
      AppAuthorities.ITEMS_UPLOAD]);
  }

  // vendor Clicked from select
  vendorClicked(vendor) {
    if (this.isVendorPOReceiptAuthorized() || this.isVendorPOAuthorized() ||
      this.isVendorBillPaymentAuthorized() || this.isVendorBillAuthorized() ||
      this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.clickedVendor = vendor;
      this.vendorSelected(vendor);
    }
    this.showSendInvitationButton = !vendor.communityVendor;
  }

  getVendorInfoClass() {
    if (!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      return 'col-12 lg:col-9';
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW) && !this.vendorCollapsed) {
      return 'col-12 lg:col-9';
    } else {
      return 'col-12 lg:col-12 vendor-card-overwrite-width';
    }
  }


  isSendInvitationEnabled() {
    return !this.privilegeService.isAuthorizedMultiple([this.appAuthorities.VENDORS_SEND_VENDOR_INVITATION,
      this.appAuthorities.VENDORS_DELETE_VENDOR_INVITATION, this.appAuthorities.VENDORS_RESEND_VENDOR_INVITATION]) || this.tabIndex !== 0;
  }

  isImportVendorsEnabled() {
   return !this.privilegeService.isAuthorized(this.appAuthorities.VENDORS_UPLOAD) || this.tabIndex !== 1;
  }

  isVendorRequestEnabled() {
    return !this.privilegeService.isAuthorizedMultiple([this.appAuthorities.VENDORS_APPROVE_VENDOR_REQUEST,
      this.appAuthorities.VENDORS_DELETE_VENDOR_REQUEST, this.appAuthorities.VENDORS_REJECT_VENDOR_REQUEST]) || this.tabIndex !== 1;
  }

  isVendorGroupEnabled() {
    return !this.privilegeService.isAuthorizedMultiple([this.appAuthorities.VENDOR_GROUP_CREATE,
      this.appAuthorities.VENDOR_GROUP_EDIT, this.appAuthorities.VENDOR_GROUP_DELETE, this.appAuthorities.VENDOR_GROUP_INACTIVATE,
      this.appAuthorities.VENDOR_GROUP_ACTIVATE]) || this.tabIndex !== 2;
  }

  isCommunityVendorsEnabled() {
    return !this.privilegeService.isAuthorized(this.appAuthorities.VENDORS_ADD_TO_LOCAL_VENDOR_LIST) || this.tabIndex !== 3;
  }

}

