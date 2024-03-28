import {ElementRef, Injectable, Renderer2} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {CommonAutomationMstDto} from '../../dto/automation/common-automation-mst-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {BehaviorSubject} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {SetFieldValueDto} from '../../dto/automation/set-field-value-dto';
import {AppConstant} from '../../utility/app-constant';
import {CommonUtility} from '../../utility/common-utility';
import {AppFormConstants} from '../../enums/app-form-constants';
import {AppDocumentType} from '../../enums/app-document-type';
import {AppDocuments} from '../../enums/app-documents';

@Injectable({
  providedIn: 'root'
})
export class AutomationService {

  public isSelectedItemEvent = new BehaviorSubject<any>(null);
  public isSelectedAccountEvent = new BehaviorSubject<any>(null);
  public lineItemId = new BehaviorSubject<number>(null);
  public automationRule = new BehaviorSubject<number>(null);
  public updateTableData = new BehaviorSubject<any>(null);
  public updateFocusListeners = new BehaviorSubject<any>(null);
  public setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  private focusOutListeners: any[] = [];
  private focusInListeners: any[] = [];
  private isApiCallInProgress = false;
  /**
   * Queue to hold the pending API requests along with their promise handlers.
   * This ensures sequential processing of the requests.
   */
  private requestQueue: Array<{ dto: SetFieldValueDto, form: FormGroup, resolve: (value: any) => void, reject: (error: any) => void }> = [];
  private documentId: number;
  private endPoint: string;
  public poInputFieldsForAutomation = [AppFormConstants.PO_NUMBER, AppFormConstants.PO_HEADER_CONTACT_PERSON, AppFormConstants.PO_HEADER_CONTACT_NUMBER,
    AppFormConstants.FOCUS_LISTENER, AppFormConstants.AMOUNT, AppFormConstants.PO_HEADER_SHIPPING_ADDRESS, AppFormConstants.NOTES,
    AppFormConstants.PO_HEADER_BILLING_ADDRESS];

  public billInputFieldsForAutomation = [AppFormConstants.FOCUS_LISTENER, AppFormConstants.BILL_NO, AppFormConstants.BILL_AMOUNT, AppFormConstants.BILL_DATE_STR];
  public expenseInputFieldsForAutomation = [AppFormConstants.FOCUS_LISTENER, AppFormConstants.EXPENSE_HEADER_BUSINESS_PURPOSE];

  constructor(public httpClient: HttpClient) {
  }


  /**
   * Add listeners to check the focus in and out from a query selector
   * @param form Instance of form
   * @param renderer Renderer2
   * @param el ElementRef
   * @param setFieldValueDto Data Object
   * @param documentId documentId
   * @param fieldList fields which trigger the automation in focusout
   */
  setUpFocusListeners(form: FormGroup, renderer: Renderer2, el: ElementRef, setFieldValueDto: SetFieldValueDto, documentId: number, fieldList: AppFormConstants[]) {
    this.updateFocusListeners.next(null);
    this.setFieldValueDto = setFieldValueDto;
    this.documentId = documentId;
    this.focusOutListeners.forEach(fn => fn());
    this.focusInListeners.forEach(fn => fn());
    // reset the listeners arrays
    this.focusOutListeners = [];
    this.focusInListeners = [];
    fieldList.forEach(controlName => {
      const formEl: HTMLElement = el.nativeElement;
      const controlEl: HTMLInputElement = formEl.querySelector(`[formControlName="${controlName}"]`) as HTMLInputElement;
      let timer: any;
      if (controlEl) {
        const focusOutUnlisten = renderer.listen(controlEl, 'focusout', () => {
          timer = setTimeout(() => {
            if (form.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT) &&
              form.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).value) {
              this.setFieldValueDto.documentObject = new CommonUtility().convertDataToAutomation(form.getRawValue(), this.documentId);
              form.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(false);
            }
            this.setAutomationData(form, controlName);
          }, 100);
        });
        this.focusOutListeners.push(focusOutUnlisten);


        // Listen to focusin on the entire document
        const focusInUnlisten = renderer.listen(document, 'focusin', (event) => {
          if (event.target === controlEl || controlEl.contains(event.target as Node)) {
            if (timer) {
              clearTimeout(timer);
            }
          }
        });
        this.focusInListeners.push(focusInUnlisten);
      }
    });
  }

  /**
   * Set single or multiple field value to automation object
   * @param form document form
   * @param controlName form control name
   * @param multipleControls list of form controls to set multiple values
   */
  setAutomationData(form, controlName, multipleControls?: any []) {
    this.setFieldValueDto.documentObject.event = form.get('event')?.value;
    if (multipleControls) {
      multipleControls.forEach(control => {
        this.setFieldValueDto.documentObject[control] = form.get(control)?.value;
      });
    } else {
      this.setFieldValueDto.documentObject[controlName] = form.get(controlName)?.value;
    }
    this.getAutomationSetFieldValues(this.setFieldValueDto, form).then(value => {
      this.updateFocusListeners.next(value);
    }, (reason) => {
    });
  }

  /**
   * Manually trigger focus and blur events for a specific control.
   * @param controlName Name of the control to trigger events for
   * @param parentElement element of the current page
   */
  triggerFocusListeners(controlName: string, parentElement?) {
    let controlEl: HTMLInputElement;
    if (parentElement){
      controlEl = parentElement.querySelector(`[formControlName="${controlName}"]`) as HTMLInputElement;
    } else {
      controlEl = document.querySelector(`[formControlName="${controlName}"]`) as HTMLInputElement;
    }

    if (controlEl) {
      // Create a new focusin event
      const focusInEvent = new FocusEvent('focusin');
      controlEl.dispatchEvent(focusInEvent);

      setTimeout(() => {
        // Create a new focusout event
        const focusOutEvent = new FocusEvent('focusout');
        controlEl.dispatchEvent(focusOutEvent);
      }, 500);
    }
  }

  /**
   * This function makes a request to the server or queues it if another request is in progress.
   * It returns a promise which will be resolved or rejected based on the API call's outcome.
   * Request the set field value object to user filled data
   * Set field values to the form object
   * @param setFieldValueDto The DTO to be sent to the server.
   * @param form The form group instance.
   * @returns A promise resolving with the response or rejecting with an error.
   */
  getAutomationSetFieldValues(setFieldValueDto: SetFieldValueDto, form: FormGroup): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isApiCallInProgress) {
        this.requestQueue.push({dto: setFieldValueDto, form, resolve, reject});
      } else {
        this.processApiCall(setFieldValueDto, form, resolve, reject);
      }
    });
  }

  /**
   * Private helper function to process an API call.
   * It sends a request to the server, handles the response, and manages the API call queue.
   * @param setFieldValueDto The DTO to be sent to the server.
   * @param form The form group instance.
   * @param resolve The resolve function of the associated promise.
   * @param reject The reject function of the associated promise.
   */
  processApiCall(setFieldValueDto: SetFieldValueDto, form: FormGroup, resolve: (value: any) => void,
                 reject: (error: any) => void) {

    this.isApiCallInProgress = true;
    setFieldValueDto.documentObject = new CommonUtility().convertDataToAutomation(setFieldValueDto.documentObject, this.documentId, form.value);

    switch (this.documentId) {
      case AppDocumentType.BILL:
        this.endPoint = 'sec_bill_automation_changes';
        break;
      case AppDocumentType.PURCHASE_ORDER:
        this.endPoint = 'sec_po_automation_changes';
        break;
      case AppDocumentType.EXPENSE:
        this.endPoint = 'sec_expense_automation_changes';
        break;
    }

    this.httpClient.post(ApiEndPoint.API_URL + `/vendor_portal/${this.endPoint}`, setFieldValueDto,
      {observe: 'response'}).subscribe(async (res: any) => {
      this.isApiCallInProgress = false;
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        await this.patchNullValuesToForm(res, form);
        resolve(res.body); // Resolve promise with the result
      } else {
        reject(res); // Reject promise if status is not success
      }
      this.checkAndProcessNextInQueue();
    }, (err) => {
      this.isApiCallInProgress = false;
      reject(err); // Reject promise on error
      this.checkAndProcessNextInQueue();
    });
  }


  /**
   * Private helper function to check the request queue and process the next request if available.
   */
  checkAndProcessNextInQueue() {
    if (this.requestQueue.length > 0) {
      const nextRequest = this.requestQueue.shift();
      this.processApiCall(nextRequest.dto, nextRequest.form, nextRequest.resolve, nextRequest.reject);
    }
  }

  /**
   * Clear the fields that does not have any values which are related to automation set field value
   * @param res response
   * @param form form object
   */
  patchNullValuesToForm(res, form) {
    return new Promise(resolve => {
      const patchObject = {};
      if (AppDocuments.DOCUMENT_EVENT_APPROVED === res.body.documentObject.event){
        resolve(res.body.documentObject);
        return;
      }
      for (const field of res.body.automationFields) {
        try {
          if (res.body.documentObject[field]) {
            patchObject[field] = res.body.documentObject[field];
          } else {
            // Temporary
            if (this.documentId == AppDocumentType.PURCHASE_ORDER && field == 'departmentId') {
              continue;
            }
            patchObject[field] = null;
          }
        } catch (e) {
        }
      }
      this.updateFocusListeners.next(AppFormConstants.FOCUS_LISTENER);
      form.patchValue(patchObject);
      resolve(res.body.documentObject);
    });
  }

  /**
   * Resets the set field value data object by initializing it to a new instance.
   */
  resetSetFieldValueData() {
    this.updateFocusListeners.next(null)
    this.setFieldValueDto = new SetFieldValueDto();
  }

  /**
   * Invokes and cleans up both focus out and focus in listeners.
   * This ensures no lingering events or potential memory leaks.
   */
  cleanupListeners() {
    this.focusOutListeners.forEach(fn => fn());
    this.focusInListeners.forEach(fn => fn());
  }


  /**
   * Work Flow List
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getAutomations(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/common_service/sec_automation_search_grid_v2', searchFilterDto, {observe: 'response'});
  }


  /**
   * This service use for get automation action type list
   */
  getActionTypeList(automationEventActionDto) {
    return this.httpClient.post<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_action_list_v2', automationEventActionDto,
      {observe: 'response'}).toPromise();
  }

  /**
   * This service use for get document type list
   */
  getDocumentTypeList(isRuleAutomation) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_all_document_types_v2',
      {observe: 'response', params: {isRuleAutomation}});
  }

  /**
   * This service use for get event list according to document type
   * @Param documentId number
   */
  getEventList(documentTypeId, isRuleAutomation) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_events_document_type_v2',
      {observe: 'response', params: {documentTypeId, isRuleAutomation}});
  }

  /**
   * This service use for get event list according to document type for rule configuration
   */
  getEventListForRule() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_events_for_rule_config',
      {observe: 'response', withCredentials: true});
  }


  /**
   * This service use for get all event list
   */
  getAllEventList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_event_list_v2',
      {observe: 'response'});
  }

  /**
   * This service use for get documents field list
   */
  getConditionEnableFieldList(documentIdParam) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_condition_enable_field_list_by_document_v2',
      {observe: 'response', params: {documentTypeId: documentIdParam}});
  }

  /**
   * This service use for get documents field list
   */
  getActionEnableFieldList(obj) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_get_action_enable_field_list_by_document_v2', obj,
      {observe: 'response'});
  }

  /**
   * This service use for get condition according to field id
   * @param fieldId number
   */
  getConditionList(fieldIdParam) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_condition_list_field_v2',
      {observe: 'response', params: {field: fieldIdParam}});
  }

  /**
   * This service user for get user list
   */
  getApprovalUserList(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/user_management/sec_get_userlist_dropdown',
      {observe: 'response', params: {isCreate}});
  }

  /**
   * This service use for get automation list
   */
  getAutomationList() {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/automation/automation-workflows.json',
      {observe: 'response'});
  }

  /**
   * This service use for get 3rd party application list
   */
  getIntegrationSystemList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/integration/sec_get_integration_systems_list_v2',
      {observe: 'response'});
  }

  /**
   * This method use for get automation name is exist
   * @param automationName string
   */
  getAutomationNameIsExist(automationName: string) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_check_automation_name_availability_v2',
      {params: {name: automationName}, observe: 'response'});
  }

  /**
   * This service use for create new automation
   * @param workflowMstDto CommonAutomationMstDto
   */
  createAutomation(automationMstDto: CommonAutomationMstDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_automation_v2', automationMstDto,
      {observe: 'response'});
  }

  /**
   * This service use for get automation data by automation id
   * @param workflowId number
   */
  getAutomationData(automationIdParam) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_view_automation_v2',
      {observe: 'response', params: {automationId: automationIdParam}});
  }

  /**
   * This service use for edit automation
   * @param workflowMstDto CommonAutomationMstDto
   */
  editAutomation(workflowMstDto: CommonAutomationMstDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_update_automation_v2', workflowMstDto, {
      observe: 'response'
    });
  }

  /**
   * This service use for delete automation
   * @param workflowIdParam number
   */
  deleteAutomation(automationIdParam) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/common_service/sec_delete_automation_v2', {
      params: {automationId: automationIdParam},
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for inactivate automation
   * @param automationIdParam number
   */
  inactiveAutomation(automationIdParam) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_automation_v2', {}, {
      params: {automationId: automationIdParam}, observe: 'response'
    });
  }

  /**
   * This service use for active automation
   * @param automationIdParam number
   */
  activeAutomation(automationIdParam) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_activate_automation_v2', {}, {
      params: {automationId: automationIdParam}, observe: 'response'
    });
  }

  /**
   * Update user status
   * @param ids to approval group ids
   */
  deleteAutomationList(ids) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_delete_bulk_automation_v2', ids,
      {observe: 'response'});
  }

  /**
   * Update user status
   * @param ids to approval group ids
   */
  activeAutomationList(ids) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_activate_bulk_automation_v2', ids,
      {observe: 'response'});
  }

  /**
   * Update user status
   * @param ids to approval group ids
   */
  inactiveAutomationList(ids) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_inactivate_bulk_automation_v2', ids,
      {observe: 'response'});
  }

  /**
   * Update user status
   * @param ids to approval group ids
   */
  getAutomationFieldSpec(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_automation_field_spec_v2',
      {observe: 'response', params: {fieldId: idParam}});
  }

  /**
   * This service use for get dropdown data by endpoint
   * @param endpointUrl
   * @param isCreate
   */
  getDropDownData(endpointUrl: string, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + endpointUrl,
      {observe: 'response', params: {isCreate}});
  }

  /**
   * Get Account Name
   */
  getAccountName(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_view_account', {
      params: {accountId: idParam},
      observe: 'response'
    });
  }

  /**
   * This service use for get expense account list
   */
  getItemList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_dropdown_list_not_considering_vendor',
      {observe: 'response'});
  }

  /**
   * This service use for get item name by item id
   * @param idParam number
   */
  getItemInfo(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_item_name_by_id', {
      params: {id: idParam},
      observe: 'response', withCredentials: true
    });
  }

  /**
   * This service use for get automation second value availability
   * @param conditionId Number
   */
  getConditionSecondValueAvailability(conditionId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_second_value_entry_availability', {
      params: {conditionId},
      observe: 'response'
    });
  }


  getProgressPercentage(uuid) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_automation_progress_status',
      {observe: 'response', params: {uuid}});
  }
}
