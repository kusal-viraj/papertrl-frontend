import {Injectable} from '@angular/core';
import {ApiEndPoint} from "../../utility/api-end-point";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {DropdownDto} from "../../dto/common/dropDown/dropdown-dto";
import {map} from "rxjs/operators";
import {CommonUtility} from "../../utility/common-utility";
import {AppConstant} from "../../utility/app-constant";
import {AttachToDto} from "../../dto/inbox/attach-to-dto";

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  public attUrl: any = '';
  public emails: any[] = [];
  public fileFromInbox = new BehaviorSubject<any>(null);
  public attIdFromInbox = new BehaviorSubject<any>(null);
  public isButtonEnabled = new BehaviorSubject<boolean>(false)
  public attachmentUrl = new BehaviorSubject<any>(this.attUrl);
  public deletedSuccessEvent = new BehaviorSubject<boolean>(false);
  public isChangeAttachmentUrl = new BehaviorSubject<boolean>(false);
  public isProgreesSplitEvent = new BehaviorSubject<boolean>(false);
  public isRevertProgress = new BehaviorSubject<boolean>(false);
  public refreshToProcessTabList = new BehaviorSubject<boolean>(false);
  public refreshDeletedTabList = new BehaviorSubject<boolean>(false);
  public refreshProcessTabList = new BehaviorSubject<boolean>(false);
  public isDownloadAttachment = new BehaviorSubject<boolean>(false);
  public emailedByFileName = new BehaviorSubject<Object>({});
  public attachmentIdInToProcessData = new BehaviorSubject(null);
  public isViewEmptyAttachmentContent = new BehaviorSubject<boolean>(null);
  public commonUtil: CommonUtility = new CommonUtility();
  public attachedTo: AttachToDto = new AttachToDto();
  public getActiveAttachmentDetailsUsingEmailId = new BehaviorSubject<any>([]);

  constructor(public httpClient: HttpClient) {

  }

  /**
   * load inbox tabs data
   */
  searchInboxData(filterValues) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_get_email_list_by_status', filterValues,
      {observe: 'response'}).toPromise();
  }

  /**
   * load deleted tabs data
   */
  loadDeletedTabData(filterValues) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_get_deleted_attachment_list', filterValues,
      {observe: 'response'}).toPromise();
  }


  /**
   * delete to process tab record
   * @param attachmentIds to attachment id array
   */
  deleteToProcessItem(attachmentIds) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_delete_inbox_email',
      {observe: 'response', withCredentials: true, params: {attachmentIdList: attachmentIds}});
  }

  /**
   * delete to process tab record
   * @param emailIdList to selected email ids
   */
  deleteAsPermanent(emailIdList: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_permanent_delete_email', emailIdList,
      {observe: 'response', withCredentials: true});
  }

  /**
   * delete to process tab record
   * @param attachmentIdList to selected ids
   */
  recoverEmail(attachmentIdList: any) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_recover_email', attachmentIdList,
      {observe: 'response', withCredentials: true});
  }


  /**
   * this method can be used to move to to process tab from process tab
   * @param attId to attachment id
   */
  moveToProcess(attId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_move_to_to_process_list',
      {observe: 'response', withCredentials: true, params: {attachmentId: attId}});
  }

  /**
   * this method can used to get section list
   */
  getSectionList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_all_document_types_not_considering_automation_enabled',
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used get selected section document list
   * @param documentTypeId to documentTypeId
   * @param vendorID to vendorID
   */
  getSelectedSectionDocumentList(documentTypeId, vendorID) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_document_dropdown_list',
      {observe: 'response', withCredentials: true, params: {documentType: documentTypeId, vendorId: vendorID}});
  }

  /**
   * this method can be used to save attachment data
   * @param attachedToValue to attachment object
   */
  saveAttachedToFormData(attachedToValue) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_inbox_attachment_attach_to_the_document',
      attachedToValue,
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to download attachment
   * @param attachmentId to attachment id
   */
  getInboxAttachment(attachmentId) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_inbox_email_attachment',
        {
          params: {attachmentId},
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

  /**
   * this method can used to split attachment
   * @param attId to attachment id
   * @param pRange to page range array
   */
  splitAttachment(attId, pRange) {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/common_service/sec_get_segregated_attachment',
        {
          params: {attachmentId: attId, pageRange: pRange},
          observe: 'response',
          responseType: 'blob',
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

  /**
   * this method validate split function
   */
  validateSplitFunction(attId, pRange) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_segregate_attachment_validation',
      {observe: 'response', params: {attachmentId: attId, pageRange: pRange}, withCredentials: true});
  }

  /**
   * this method can be used to mark mail as read
   * @param emailID to mail id
   */
  markMailAsRead(emailID) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_mark_as_read_email',
      {observe: 'response', withCredentials: true, params: {emailId: emailID}});
  }

  /**
   * This method use to delete single attachment from deleted list
   * @param attachmentID to attachment id
   */
  deleteAttachmentFromDeletedList(attachmentIdList) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/common_service/sec_permanent_delete_attachment',
      {observe: 'response', withCredentials: true, params: {attachmentIdList}});
  }

  /**
   * This method use to recover single attachment from deleted list
   * @param attachmentID to attachment id
   */
  recoverAttachmentFromDeletedList(attachmentIdList: any[]) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_recover_attachment',
      {observe: 'response', withCredentials: true, params: {attachmentIdList}});
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

  /**
   * This method use get customer email address
   */
  getCustomerEmailAddress() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_tenant_wise_inbox_email_address',
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be use to edit email address
   */
  reQuestToUpdateEmail(emailAddress) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_send_change_client_inbox_email_request',
      {observe: 'response', params: {emailAddress: emailAddress}, withCredentials: true});
  }

  /**
   * this method can be use to send attachment to bill
   */
  sendToBill(attachmentIDs: any[]) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_send_to_bill_from_inbox', attachmentIDs,
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be use to send attachment to bill
   */
  sendSegregratedAttachmentToBill(attachment) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_segregate_and_send_to_bill_from_inbox', this.getFormData(attachment),
      {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be use to get email details
   */
  getAttachmentDetailUsingEmailId(ids) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_email_wise_attachment_list',
      {observe: 'response', params: {emailIdList: ids}, withCredentials: true});
  }


  uploadEmails(files: any) {
    return this.httpClient.post<any>(ApiEndPoint.API_URL + '/common_service/sec_upload_email_attachment',
      this.getFormData(files), {withCredentials: true, observe: 'response'});
  }

  sendToIdListUploadedFiles(attachmentIdList: any[]){
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_save_email_attachment_upload', attachmentIdList,
      {observe: 'response', withCredentials: true});
  }

  sendEmailToSupport(){
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_send_email_to_support_team_config_inbox_email',
      {observe: 'response', withCredentials: true});
  }


}
