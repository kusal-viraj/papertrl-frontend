import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {AdditionalFieldDetailDto} from '../../dto/additional-field/additional-field-detail-dto';
import {AppConstant} from '../../utility/app-constant';
import {CommonUtility} from '../../utility/common-utility';
import {map} from 'rxjs/operators';
import {AdditionalFieldDataSourceDto} from '../../dto/additional-field/additional-field-data-source-dto';
import {AdditionalFieldOptionDto} from '../../dto/additional-field/additional-field-option-dto';
import {BulkButtonActionDto} from "../../dto/common/bulk-button-action-dto";
import {BehaviorSubject} from "rxjs";
import {FieldValidationDto} from '../../dto/additional-field/field-validation-dto';
import {AppResponseStatus} from '../../enums/app-response-status';

@Injectable({
  providedIn: 'root'
})
export class AdditionalFieldService {

  private commonUtil = new CommonUtility();
  public updateTableData = new BehaviorSubject<any>(null);

  constructor(public httpClient: HttpClient) {
  }

  /**
   * This service use for get section list
   */
  getSectionList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_section_name_list',
      {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get section list
   */
  getSectionListWithSelected(id) {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_section_name_list',
      {observe: 'response', withCredentials: true, params: {id}}).toPromise();
  }

  /**
   * This service use for get all section list
   */
  getAllSectionList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_all_section_name_list',
      {observe: 'response', withCredentials: true});
  }


  /**
   * This service use for get field type list
   */
  getFieldTypeList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_field_types',
      {observe: 'response'});
  }

  /**
   * This service use for get field properties
   * @param idParam fieldType
   */
  public getAdditionalFieldProperties(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_field_validations', {
      params: {id: idParam}, observe: 'response', withCredentials: true
    });
  }


  /**
   * This service use for get dropdown datasource
   */
  public getDataSourceList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_data_source_list_v2', {
      observe: 'response', withCredentials: true
    });
  }

  /**
   * This service use for get additional field option template
   */
  public getOptionTemplate() {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/common_service/download_additional_field_template',
        {
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
        };
      }));
  }


  /**
   * This service use for get dropdown properties
   */
  public getDropdownPropertyList() {
    return this.httpClient.get<DropdownDto[]>('assets/demo/data/dropdowns/additional-field/additional-field-dropdown-properties.json', {
      observe: 'response', withCredentials: true
    });
  }


  /**
   * This service use for get additional field by id
   */
  public getField(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_additional_field',
      {params: {id: idParam}, observe: 'response', withCredentials: true});
  }


  /**
   * Get additional field  table data
   */
  getAdditionalFieldTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/common_service/sec_search_additional_fields_v2',
      searchFilterDto, {observe: 'response'});
  }

  /**
   * Get additional field data for document specific table
   * @param moduleIdList number array
   * @param sortData TableSearchFilterDataDto
   */
  getDocumentTypeTableData(moduleIdList: any, sortData: TableSearchFilterDataDto) {
    return this.httpClient.post<any>(ApiEndPoint.API_URL + '/common_service/sec_get_sorted_additional_fields_v2', {
      moduleIdList, sortData
    }, {observe: 'response'});
  }

  /**
   * Create additional field
   */

  public createAdditionalFields(additionalField: AdditionalFieldDetailDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_additional_field_v2',
      additionalField, {observe: 'response', withCredentials: true});
  }

  /**
   * Remove additional field
   * @param idParam number
   */
  public removeAdditionalField(idParam) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/common_service/sec_remove_additional_field', {
      params: {id: idParam}, observe: 'response', withCredentials: true
    });
  }

  /**
   * Get additional field name availability
   */
  getAdditionalFieldAvailability(docId: number, sectionId: number, fieldName: string, idd: number) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_field_name_availability_v2', {
      params: {moduleId: docId + '', sectionId: sectionId + '', name: fieldName, id: idd ? idd + '' : 0 + ''},
      observe: 'response'
    });
  }

  /**
   * Create data source
   */
  createDataSource(dataSource) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_data_source_v2', this.getFormData(dataSource),
      {observe: 'response'});
  }

  /**
   * Update data source
   */
  updateDataSource(dataSource) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_edit_data_source', this.getFormData(dataSource),
      {observe: 'response'});
  }

  /**
   * This method use for get data source creation form data
   * @param dataSource AdditionalFieldDataSourceDto
   * @private
   */
  private getFormData(dataSource: AdditionalFieldDataSourceDto) {
    const formData = new FormData();
    for (const key in dataSource) {
      this.commonUtil.appendFormData(formData, key, dataSource[key]);
    }
    return formData;
  }

  /**
   * This service use for get additional field data
   * @param idParam to id
   * @param isViewDetails to id is detail view
   * @param isCreate this parameter use to check additional field in the create screen or edit screen
   */
  public getAdditionalField(idParam, isViewDetails, isCreate) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_additional_fields_v2', {
      params: {id: idParam, isDetailSection: isViewDetails, isCreate},
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for get datasource by id
   * @param idParam to id
   * @param fieldId number - This parameter is represented id of the additional field.
   */
  public getDatasourceById(idParam, fieldId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_datasource_by_id', {
      params: {dataSourceId: idParam, fieldId},
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * This service use for get additional field data
   * @param idParam to id
   * @param isViewDetails to id is detail view
   */
  public getAdditionalFieldToRecurringBill(idParam, isViewDetails, isCreate) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_additional_fields_v2', {
      params: {id: idParam, isDetailSection: isViewDetails, isCreate},
      observe: 'response',
      withCredentials: true
    }).toPromise();
  }

  /**
   * This service use for create data source dropdown option
   */
  public createDataSourceOption(dataSource: AdditionalFieldOptionDto, isCreate) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_data_source_option_v2', dataSource,
      {observe: 'response',
        params: {isCreate}});
  }

  /**
   * This service use for create field dropdown option
   * @param dataSource
   */
  public createFieldDropdownOption(dataSource: AdditionalFieldOptionDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_dropdown_option', dataSource, {
      observe: 'response',
      withCredentials: true
    });

  }

  /**
   * This method use for edit additional field
   * @param additionalField
   */
  public editAdditionalFields(additionalField: AdditionalFieldDetailDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_edit_additional_field',
      additionalField, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get document type list
   */
  getDocumentTypeList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_all_additional_field_document_types_v2',
      {observe: 'response'});
  }

  /**
   * Check dropdown option can be deleted in edit screen
   * @param moduleId
   * @param fieldId
   * @param optionId
   */
  public isOptionUsed(moduleId, fieldId, optionId) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_get_additional_field_option_in_use', moduleId, {
      params: {fieldId, optionId}, observe: 'response', withCredentials: true
    }).toPromise();
  }

  getSelectedField(fieldId) {
    return this.httpClient.get<any>(ApiEndPoint.API_URL + '/common_service/sec_get_additional_field_by_id',
      {observe: 'response', params: {fieldId}});
  }

  public attachDocument(documentData) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_attach_document_to_additional_field', documentData,
      {observe: 'response', withCredentials: true});
  }

  public activateInactivateField(id, isActive) {
    return this.httpClient.put(ApiEndPoint.API_URL + `/common_service/sec_toggle_additional_field/${isActive}`, id,
      {observe: 'response', withCredentials: true});
  }

  public activateInactivateDocument(documentId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_toggle_additional_field_document',
      {observe: 'response', withCredentials: true, params: {documentId}});
  }

  public documentRequiredStatusChanged(documentId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_toggle_required_status_of_additional_field_document',
      {observe: 'response', withCredentials: true, params: {documentId}});
  }

  public getAdditionalFieldBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/additional-field-bulk-button-data.json',
      {observe: 'response'});
  }

  public validateAdditionalFieldCount(moduleId, sectionIds) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_additional_fields_on_report_count',
      {observe: 'response', withCredentials: true, params: {moduleId, sectionIds}});
  }


  /**
   * Mandatory Fields
   */

  /**
   *
   * @param documentId
   */
  public fieldsMandatory(documentId){
    return this.httpClient.get(ApiEndPoint.API_URL + '/common_service/sec_get_required_field_by_document_id',
      {observe: 'response', params: {documentId}});
  }
  public getMandatoryFieldForConfig(){
   return  this.httpClient.get<FieldValidationDto>(ApiEndPoint.API_URL + '/common_service/sec_get_required_field',
      {observe: 'response', });
  }

  updateMandatoryField(fields: FieldValidationDto[]) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/common_service/sec_set_document_vise_required_field', fields,
      {observe: 'response'});
  }

  /**
   * This service use for Activate / Inactivate additional field Data Source Option
   * @param dataSourceId number - This parameter is represented datasource id.
   * @param optionId number - This parameter is represented datasource option id.
   * @param IsActive boolean - This parameter use to check the status of the option.
   */
  public activateInactivateDataSrcOption(dataSourceId, optionId, IsActive) {
    return this.httpClient.get(ApiEndPoint.API_URL + `/common_service/sec_get_additional_fields_Active`,
      {params: {dataSourceId, optionId, IsActive}, observe: 'response'});
  }

  /**
   * This service use for delete additional field Data Source Option
   * @param fieldId number - This parameter is represented id of the additional field.
   * @param optionId number - This parameter is represented data source option id.
   */
  public deleteDataSrcOption(fieldId, optionId) {
    return this.httpClient.delete(ApiEndPoint.API_URL + `/common_service/sec_get_additional_fields_Option_Validate`,
      {params: {fieldId, optionId}, observe: 'response'});
  }
}
