import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {map} from 'rxjs/operators';
import {CommonUtility} from '../../utility/common-utility';
import {BillMasterDto} from '../../dto/bill/bill-master-dto';
import {AppAuthorities} from '../../enums/app-authorities';
import {PrivilegeService} from '../privilege.service';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillSubmitService {
  private commonUtil = new CommonUtility();

  constructor(public http: HttpClient, public privilegeService: PrivilegeService) {
  }


  getSubmitPendingInvoices() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_unsubmit_bills_v2', {
      observe: 'response', withCredentials: true
    });
  }

  getExcluedBillList(idList) {
    if (idList !== undefined) {
      return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_unsubmit_bills_execlude_v2',
        {params: {excludeList: idList}, observe: 'response', withCredentials: true});
    }
  }

  getTemplateListByVendorId(idParam, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    if (undefined !== idParam && 0 !== idParam) {
      return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_template_list_v2',
        {params: {vendorId: idParam, isCreate}, observe: 'response', withCredentials: true});
    }
  }

  getDateFormats() {
    if (this.privilegeService.isVendor()) {
      return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_view_dateformats_from_vendor_v2',
        {observe: 'response', withCredentials: true});
    } else {
      return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_view_dateformats_v2',
        {observe: 'response', withCredentials: true});
    }
  }

  getBillAttachment(billId) {
    if (this.privilegeService.isVendor()) {
      return this.http
        .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_invoice_attachment_by_attachment_id',
          {
            params: {templateId: billId},
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

    } else {
      return this.http
        .get(ApiEndPoint.API_URL + '/vendor_portal/sec_download_bill_attachment_v2',
          {
            params: {billId},
            responseType: 'blob',
            withCredentials: true
          })
        .pipe(map(res => {
          return {
            filename: 'filename.pdf',
            data: new Blob([res], {type: 'application/pdf'})
          };
        }));
    }
  }

  getOCRTemplateAttachment(templateId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_ocr_bill_template_attachment_v2',
      {
        params: {templateId},
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


  getOCRTemplateAttachmentFromBillInvoice(billAttachmentId, tenantId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_attachment_by_bill_id_v2',
      {
        params: {billAttachmentId, tenantId},
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

  submitBill(billMasterDto: BillMasterDto) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_submit_bill_v2',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
  }

  saveBillAsApproved(billMasterDto: BillMasterDto) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_save_submit_bill_as_approved_v2',
      this.getFormData(billMasterDto), {observe: 'response', withCredentials: true});
  }

  editBill(billMasterDto: BillMasterDto, editOnly) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_and_resubmit_bill_v2',
      this.getFormData(billMasterDto), {params: {editOnly}, observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to create expense as approved
   * @param billRequestDto to expenseMasterDto
   */
  createBillAsApproved(billRequestDto: BillMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_create_bill_as_approved_v2',
      this.getFormData(billRequestDto), {observe: 'response', withCredentials: true});
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

  validWithFormat(date: string, dateformat: string) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_validate_bill_date_format_v2',
      {params: {dateStr: date, dateFormat: dateformat}, observe: 'response', withCredentials: true});
  }

  getAllApproverList(approvedBy) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/get_all_invoice_approvers',
      {params: {createdUser: approvedBy}});
  }

  getBillDetail(billId, isDetailView) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_v2',
      {observe: 'response', params: {billId, isDetailView}}).toPromise();
  }

  getDueDate(dateStr, dateFormat, termId, netDays, dueDateStr) {
    const url = ApiEndPoint.API_URL + '/vendor_portal/sec_bill_due_date_v2';

    return this.http.get(url, {params: {dateStr, dateFormat, termId, netDays: netDays !== undefined ? netDays : '',
        dueDateStr: dueDateStr !== undefined ? dueDateStr : ''},
      observe: 'response'
    });
  }

  deleteBill(id, isFromVendorCommunity) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bill_v2',
      {observe: 'response', params: {billId: id, isFromVendorCommunity}});
  }

  detectBill(billId) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_capture_an_bill',
      {observe: 'response', params: {billId}}).toPromise();
  }

  detectAllBills() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_capture_user_bill_list',
      {observe: 'response'}).toPromise();
  }

  getPoCeiling(obj) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_remaining_ceiling_v2', obj,
      {observe: 'response'});
  }

  createBillTemplate(billTemplate) {
    if (this.privilegeService.isVendor()) {
      return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_template_from_vendor_v2', billTemplate, {observe: 'response'});
    } else {
      return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_template_v2', billTemplate, {observe: 'response'});
    }
  }

  createBillTemplateFromManagement(billTemplate) {
    if (this.privilegeService.isVendor()) {
      return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_invoice_template_from_management_v2',
        this.getFormData(billTemplate), {observe: 'response'});
    } else {
      return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_bill_template_from_management_v2',
        this.getFormData(billTemplate), {observe: 'response'});
    }
  }

  updateBillTemplate(billTemplate) {
    if (this.privilegeService.isVendor()) {
      return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_ocr_invoice_template', this.getFormData(billTemplate),
        {observe: 'response'});
    } else {
      return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_edit_ocr_bill_template', this.getFormData(billTemplate),
        {observe: 'response'});
    }
  }

  public getTemplateDetectData(templateID, billiD) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_attach_bill_template_v2',
      {observe: 'response', withCredentials: true, params: {templateId: templateID, billId: billiD}});
  }

  valuesChanged(bill) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_bill_automation_v2',
      this.getFormData(bill), {observe: 'response', withCredentials: true}).toPromise();
  }

  /**
   * This service use for change assignee
   */
  changeAssignee(billMasterDto: BillMasterDto) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_bill_change_assignee_v2', billMasterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  getPoAttachment(poId) {
    return this.http
      .post(ApiEndPoint.API_URL + '/vendor_portal/sec_po_download_attachment_by_poid_v2', {},
        {
          params: {poId},
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/pdf'})
        };
      }));
  }

  getUom() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_uom_dropdown_list',
      {});
  }

  getPoListByVendorAndPoId(vendorID, PoID) {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_approved_po_list_by_vendor_po_id',
      {params: {vendorId: vendorID, poId: PoID}, observe: 'response', withCredentials: true});
  }

  submitBillFromInbox(billMasterDto: BillMasterDto, attachmentId) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_submit_bill_from_inbox',
      this.getFormData(billMasterDto), {
        params: {attachmentId: attachmentId},
        observe: 'response',
        withCredentials: true
      });
  }

  saveBillAsApprovedFromInbox(billMasterDto: BillMasterDto, attachmentId) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_bill_from_inbox',
      this.getFormData(billMasterDto), {
        params: {attachmentId: attachmentId},
        observe: 'response',
        withCredentials: true
      });
  }

  submitAndContinue(billMasterDto: BillMasterDto, attachmentId, pageRange) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_submit_and_continue_bill_from_inbox',
      this.getFormData(billMasterDto), {
        params: {attachmentId: attachmentId, pageRange: pageRange},
        observe: 'response',
        withCredentials: true
      });
  }

  saveAndContinue(billMasterDto: BillMasterDto, attachmentId, pageRange) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_save_and_continue_bill_from_inbox',
      this.getFormData(billMasterDto), {
        params: {attachmentId, pageRange},
        observe: 'response',
        withCredentials: true
      });
  }

  addNote(auditTrailObj) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/vendor_portal/sec_create_note_for_bill', auditTrailObj,
      {observe: 'response', withCredentials: true});
  }

  getValuesWhenTypingBillDescription(section, desc) {
    console.log(section);
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_fill_line_item_description_field',
      {
        observe: 'response',
        withCredentials: true,
        params: {sectionId: section, description: desc}
      });
  }

  /**
   * This service use for get bill default
   */
  getDefaultDateFormat() {
    return this.http.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_default_date_format',
      {observe: 'response', withCredentials: true});
  }
}
