import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {PoMasterDto} from '../../dto/po/po-master-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {AppEnumConstants} from '../../enums/app-enum-constants';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {map} from 'rxjs/operators';
import {AppAuthorities} from '../../enums/app-authorities';
import {BehaviorSubject} from 'rxjs';
import {CommonUtility} from '../../utility/common-utility';
import {AppConstant} from '../../utility/app-constant';

@Injectable({
  providedIn: 'root'
})
export class PoService {
  getValues = new BehaviorSubject<any[]>(null);
  vendorId = new BehaviorSubject<any>(null);
  public commonUtil: CommonUtility = new CommonUtility();
  public isProcessingPatchingDataFromPoDraft = new BehaviorSubject({isProgress: false, index: AppConstant.ZERO});

  constructor(public httpClient: HttpClient) {
  }

  /**
   * This service use for get purchase order not availability
   * @param poNumber number
   */
  checkPurchaseOrderNoAvailability(poNumber) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_po_number_availability_v2',
      {params: {poNo: poNumber}, observe: 'response'});
  }

  /**
   * This method use for create purchase order
   * @param poMasterDto PoMasterDto
   */
  createPurchaseOrder(poMasterDto: PoMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_purchase_order_v2',
      this.getFormData(poMasterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * This method use for create purchase order as approved
   * @param poMasterDto PoMasterDto
   */
  createPurchaseOrderAsApproved(poMasterDto: PoMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_purchase_order_as_approved_v2',
      this.getFormData(poMasterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * This method use for get PO information
   * @param poId number
   * @param isDetailView
   */
  getPoData(poId, isDetailView) {
    return this.httpClient.get<PoMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_po_v2',
      {params: {poId, isDetailView}, observe: 'response', withCredentials: true});
  }

  getPoLineItemData(poId) {
    return this.httpClient.get<PoMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_item_details',
      {params: {poId}, observe: 'response', withCredentials: true}).toPromise();
  }

  getPoLineAccountData(poId) {
    return this.httpClient.get<PoMasterDto>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_account_details',
      {params: {poId}, observe: 'response', withCredentials: true}).toPromise();
  }


  getPOTableColumns(gridNameParam: string) {
    return this.httpClient.get<TableColumnsDto>(ApiEndPoint.API_URL + '/common_service/load_data_grid',
      {params: {gridName: gridNameParam}, observe: 'response'});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/common_service/save_data_grid_state', tableDataOptions,
      {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getPOBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/po-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * this method can be used to close po
   * @param id to id
   */
  closePo(id) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_close_po_v2', '',
      {params: {id}, observe: 'response'});
  }

  /**
   * close po list
   * @param poIds to selected po ids
   */
  closePoList(poIds) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_bulk_close_v2', poIds,
      {observe: 'response', withCredentials: true});
  }

  /**
   * open po list
   * @param poIds to selected po ids
   */
  openPoList(poIds) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_bulk_open_v2', poIds,
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to reopen po
   * @param id to po id
   */
  reopenPo(id) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_re_open_po_v2', '',
      {params: {id}, observe: 'response'});
  }

  /**
   * This service use for get data from backend to grid
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getPOTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_purchase_orders_v2', searchFilterDto,
      {observe: 'response'});
  }

  getDashboardPOTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_dashboard_purchase_orders_v2', searchFilterDto,
      {observe: 'response'});
  }

  getVendorPOTableData(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_local_vendor_purchase_orders_v2', searchFilterDto,
      {params: {vendorId}, observe: 'response'});
  }

  getUom() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_dropdown_list',
      {observe: 'response'});
  }

  /**
   * PO Audit Trial
   */
  getAuditTrial(poId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_purchase_order_audit_trial_v2',
      {observe: 'response', params: {poId}});
  }

  /**
   * This service use for get vendor information
   * @param idPram number
   */
  public getVendorDetail(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_vendor_info', {
      params: {vendorId: idParam},
      observe: 'response'
    });
  }

  /**
   * This service use for get item name by item id
   * @param idParam number
   */
  public getItemName(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_name_by_id', {
      params: {id: idParam},
      observe: 'response', withCredentials: true
    });
  }

  /**
   * This service use for get PO receipt
   * @param idParam po number
   */
  public getPoAttachment(attachmentID) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_attachment_v2', {},
        {
          params: {attachmentId: attachmentID},
          responseType: 'blob',
          withCredentials: true,
          observe: 'response',
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  /**
   * This service user for get po attachment list
   */
  public getPoAttachmentList(poIdParam) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_purchase_order_attachment_list_v2',
      {observe: 'response', params: {poId: poIdParam}});
  }


  /**
   * This service use for download po attachements
   */
  public downloadPOAttachment(idList) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_receipt_download_bulk_selected_v2', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }


  /**
   * This service use for get assignee selection is enable
   * @param idParam poId
   */
  public getIsAssigneeListCanSelect(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_approvers_can_select_v2', {
      params: {poId: idParam},
      observe: 'response', withCredentials: true
    });
  }

  /**
   * This service use for approve and resign po
   * @param poMasterDto PoMasterDto
   */
  public approveAndReassign(poMasterDto: PoMasterDto, isInsertApprover: boolean) {
    const api = isInsertApprover ? '/vendor_portal/sec_insert_approver_to_po' : '/vendor_portal/sec_approve_and_reassign_v2';
    return this.httpClient.put(ApiEndPoint.API_URL + api, poMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for approve and finalize po
   * @param poMasterDto PoMasterDto
   */
  public approveAndFinalize(poMasterDto: PoMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_and_finzlize_v2', poMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for edit and resubmit po
   * @param poMasterDto PoMasterDto
   * @param editOnly
   */
  public editAndResubmit(poMasterDto: PoMasterDto, editOnly) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_and_resubmit_purchase_order_v2',
      this.getFormData(poMasterDto), {
        observe: 'response',
        withCredentials: true,
        params: {editOnly}
      });
  }

  /**
   * This method use for reject purchase order
   * @param poMasterDto PoMasterDto
   */
  public rejectPurchaseOrder(poMasterDto: PoMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_purchase_order_v2', poMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for deleteExpense po
   */
  public deletePurchaseOrder(poId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_purchase_order_v2',
      {
        params: {poId},
        observe: 'response',
        withCredentials: true
      });
  }

  /**
   * This service use for skip to next workflow level
   */
  public skipApproval(poId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_skip_po_approval_v2', poId, {
      observe: 'response',
      withCredentials: true,
    });
  }

  /**
   * This service use for change assignee
   * @param poMasterDto PoMasterDto
   */
  public changeAssignee(poMasterDto: PoMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_po_change_assignee_v2', poMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }


  /**
   * This method use for send to vendor approval
   * @param idParam number
   */
  public sendToVendorApproval(poId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_send_to_vendor_approval_v2', {},
      {
        params: {poId},
        observe: 'response',
        withCredentials: true
      });
  }

  /**
   * This method use for change vendor approval
   * @param poMasterDto PoMasterDto
   */
  public vendorApprovalChange(poMasterDto: PoMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_update_vendor_approval_status_v2', poMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This method use for get pending po list
   */
  public getAllPendingPurchaseOrders(tableSearch, pendingOnly) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_all_po_id_v2', tableSearch,
      {
        observe: 'response',
        withCredentials: true,
        params: {pendingOnly}
      });
  }

  /**
   * This method use for get form data from po master dto
   * @param poMasterDto PoMasterDto
   */
  getPurchaseOrderFormData(poMasterDto: PoMasterDto) {
    const formData = new FormData();

    for (const key in poMasterDto) {
      if (poMasterDto[key] != null) {

        if (key === 'purchaseOrderDetails') {
          poMasterDto.purchaseOrderDetails.forEach((value, index) => {

            if (value.productId !== undefined && value.productId !== null) {
              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('productId'), value.productId + '');
            }
            if (value.qty !== undefined && value.qty !== null) {
              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('qty'), value.qty + '');
            }
            if (value.uomId !== undefined && value.uomId !== null) {
              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('uomId.id'), value.uomId + '');
            }
            if (value.unitPrice !== undefined && value.unitPrice !== null) {
              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('unitPrice'), value.unitPrice + '');
            }
            if (value.discountAmount !== undefined && value.discountAmount !== null) {
              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('discountAmount'), value.discountAmount + '');
            }
            if (value.amount !== undefined && value.amount !== null) {
              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('amount'), value.amount + '');
            }
          });
        } else if (key === 'adHocWorkflowDetails') {

          poMasterDto.adHocWorkflowDetails.forEach((value, index) => {

            if (value.approvalOrder !== undefined && value.approvalOrder !== null &&
              (value.approvalGroup !== undefined && value.approvalGroup !== null ||
                value.approvalUser !== undefined && value.approvalUser !== null)) {

              formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                .concat('approvalOrder'), value.approvalOrder + '');

              if (value.approvalGroup !== undefined && value.approvalGroup !== null) {
                formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                  .concat('approvalGroup'), value.approvalGroup + '');
              }
              if (value.approvalUser !== undefined && value.approvalUser !== null) {
                formData.append(key.concat('[' + index + ']').concat(AppEnumConstants.LABEL_DOT_STRING)
                  .concat('approvalUser'), value.approvalUser.toString() + '');
              }
            }

          });

        } else {
          formData.append(key, poMasterDto[key]);
        }

      }
    }

    if (poMasterDto.attachments) {

      if (poMasterDto.attachments.length < 1) {
        formData.delete('attachments');
      }

      for (const file of poMasterDto.attachments) {
        formData.append('attachments', file);
      }
    }
    return formData;
  }


  deletePoAttachment(attachmentId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_purchase_order_attachment_v2', {
      params: {attachmentId},
      observe: 'response'
    });
  }

  downloadPoAttachment(attachmentID) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_attachment_v2', {},
      {
        params: {attachmentId: attachmentID},
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  downloadVendorPoAttachment(attachmentId, tenantId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_attachment_by_customer_v2', {},
      {
        params: {attachmentId, tenantId},
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  downloadAdditionalAttachment(attachmentId: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_additional_attachment_v2',
      {
        params: {attachmentId},
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  vendorPoDownloadAdditionalAttachment(attachmentId: any, tenantId: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_additional_attachment_by_customer_v2',
      {
        params: {attachmentId, tenantId},
        responseType: 'blob',
        observe: 'response',
        withCredentials: true
      })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  deletePoAdditionalAttachment(attachmentID) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_po_delete_additional_attachment_v2', {
      params: {attachmentId: attachmentID},
      observe: 'response'
    });
  }

  /**
   * Convert objects into forms
   */
  getFormData(object) {
    const formData = new FormData();
    for (const key in object) {
      this.commonUtil.appendFormData(formData, key, object[key]);
    }
    return formData;
  }

  bulkExportAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_export_bulk_all_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  vendorPoBulkExportAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_export_bulk_all_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  bulkExportSelected(billIdList: any[]) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_export_bulk_selected_v2', billIdList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'application/csv'})
        };
      }));
  }

  bulkDownloadAll(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_bulk_all_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'po_list.zip',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  vendorPoBulkDownloadAll(searchFilterDto: TableSearchFilterDataDto, vendorId) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_bulk_all_by_vendor_v2', searchFilterDto,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true,
          params: {vendorId}
        })
      .pipe(map(res => {
        return {
          filename: 'po_list.zip',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  bulkDownloadSelected(idList: any[]) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_bulk_selected_v2', idList,
        {
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'po_list.zip',
          result: res,
          data: new Blob([res.body], {type: 'application/zip'})
        };
      }));
  }

  bulkDelete(poIdList: any[]) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_delete_bulk_v2', poIdList,
      {observe: 'response', withCredentials: true});
  }

  deletePo(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_receipt_v2', {
      params: {id},
      observe: 'response'
    });

  }

  bulkReject(poIdList: any[]) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_reject_bulk_v2', poIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkApprove(poIdList: any[]) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_po_approve_bulk_v2', poIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkSendToVendor(poIdList: any[]) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/vendor_portal/sec_send_to_vendor_approval_bulk_v2', poIdList,
      {observe: 'response', withCredentials: true});
  }

  bulkSendPoAttachment(SendPoToVendorDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_send_po_attachment_to_vendor_v2', SendPoToVendorDto,
      {observe: 'response', withCredentials: true});
  }


  createBill(bill, isFromPoOrReceipt) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_from_po_v2', this.getFormData(bill),
      {params: {isFromPoOrReceipt}, observe: 'response', withCredentials: true});
  }

  createBillAsApproved(bill, isFromPoOrReceipt) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_create_bill_as_approved_v2',
      this.getFormData(bill), {params: {isFromPoOrReceipt}, observe: 'response', withCredentials: true});
  }

  getReceipts(poId: any, receiptIdList: any []) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_receipt_drop_down_v2',
      {params: {poId, receiptIdList}, observe: 'response'});
  }

  valuesChanged(bill) {
    return this.httpClient.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_purchase_order_automation_v2',
      this.getFormData(bill), {observe: 'response', withCredentials: true}).toPromise();
  }

  viewReport(attachmentId) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_attachment_v2', {},
        {
          params: {attachmentId},
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  vendorViewReport(poId) {
    return this.httpClient
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_by_customer_with_field_config_v2', {},
        {
          params: {poId},
          responseType: 'blob',
          observe: 'response',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          result: res,
          data: new Blob([res.body], {type: 'application/pdf'})
        };
      }));
  }

  getPoNumberPattern(departmentId: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_auto_generate_po_no',
      {params: {departmentId}, observe: 'response', withCredentials: true});
  }

  getProjectBudget(projectCodeId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_project_remaining_amount',
      {params: {projectCodeId}, observe: 'response', withCredentials: true});
  }

  /**
   * get item related sku
   * @param vendorID to vendor id
   * @param itmMstID to item master id
   */
  getItemRelatedSKU(vendorID, itmMstID) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_vendor_item_dropdown_list_v2',
      {observe: 'response', params: {vendorId: vendorID, itmMstId: itmMstID}});
  }

  canEdit(poId: any) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_purchase_order_is_editable', {
      params: {poId},
      observe: 'response',
      withCredentials: true
    });
  }

  undoPo(poId: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_undo_purchase_order', {}, {
      params: {poId},
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This method use for get PO information
   * @param poId number
   */
  getSummaryPoData(id) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/sec_get_po_details_dto_v2',
      {params: {id}, observe: 'response', withCredentials: true});
  }

  /**
   * This method use for get PO related credit notes
   * @param poId to selected po id
   */
  getPORelatedCreditNoteDetails(poId) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/vendor_portal/sec_view_attached_credit_note_list_by_po',
      {params: {poId}, observe: 'response', withCredentials: true});
  }


  //Po Draft related services
  /**
   * Save / edit po draft
   * @param poMasterDto to po master object
   * @param isEdit to identify edit view
   * @param isOverrideData to is override from draft and  perform save as draft
   */
  savePOAsDraft(poMasterDto: PoMasterDto, isEdit, isOverrideData) {
    return this.httpClient.post((isEdit || isOverrideData) ? ApiEndPoint.API_URL + '/vendor_portal/sec_edit_po_draft' :
        ApiEndPoint.API_URL + '/vendor_portal/sec_save_po_as_draft',
      this.getFormData(poMasterDto), {observe: 'response', withCredentials: true});
  }


  /**
   * This service use for get enable status of confidential feature
   * @param projectId to project master id
   * @param isCreate what is the screen
   * @param poId to bill id
   */
  loadAccountProjectCodeWiseInPo(projectId, isCreate, poId?){
    if (isCreate == null) {
      isCreate = false;
    }
    if (!poId) {
      poId = AppConstant.ZERO;
    }
    if (!projectId) {
      projectId = AppConstant.ZERO;
    }
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_dropdown_list_project_wise_for_po',
      {observe: 'response', withCredentials: true, params: {isCreate, projectId, poId}});
  }

  /**
   * check availability of draft equals to entered po number
   * @param poNumber to po number
   */
  getAvailableDraftIdByName(poNumber) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_check_po_draft_available',
      {params: {poNumber}, observe: 'response'});
  }

  /**
   * this method used for get user's available draft list
   */
  getUserAvailableDraftList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_po_drafts',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This method is used to check whether the specified tenant is active or not
   *
   * @param tenantId
   */
  isTenantActive(tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/vendor_portal/sec_is_active_tenant',
      {observe: 'response', withCredentials: true, params: {tenantId}});
  }
}
