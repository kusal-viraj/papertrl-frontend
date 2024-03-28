import {AutomationService} from '../../shared/services/automation-service/automation.service';
import {AppResponseStatus} from '../../shared/enums/app-response-status';
import {AdditionalFieldService} from '../../shared/services/additional-field-service/additional-field-service.';
import {AppConstant} from '../../shared/utility/app-constant';

export class AdditionalFieldUtility {

  public documentType: any[] = [];
  public sections: any[] = [];
  public allSections: any[] = [];
  public fieldType: any[] = [];
  public fieldDataType: any[] = [];
  public dataSources: any[] = [];
  public dropdownProperties: any[] = [];
  public fileTypes: any[] = [];
  private appConstant = new AppConstant();


  constructor(public automationService: AutomationService, public additionalFieldService: AdditionalFieldService) {

    this.getDocumentTypeList();
    this.getSectionList();
    this.getFieldTypeList();
    this.getFieldDataTypeList();
    this.getDataSourceList();
    this.getDropdownPropertyList();
    this.getFileTypeList();
  }

  /**
   * This method use for get document type list for dropdown
   */
  getDocumentTypeList() {
    this.additionalFieldService.getDocumentTypeList().subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.documentType = res.body;
      } else {
      }
    });
  }

  /**
   * This method use for get document section list for dropdown
   */
  getSectionList() {
    this.additionalFieldService.getSectionList().subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.sections = res.body;
      } else {
      }
    });
  }

  /**
   * This method use for get document section list for dropdown
   */
  getAllSectionList() {
    this.additionalFieldService.getAllSectionList().subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.allSections = res.body;
      } else {
      }
    });
  }

  /**
   * This method use for get document section list for dropdown
   */
  getFieldTypeList() {
    this.additionalFieldService.getFieldTypeList().subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.fieldType = res.body;
      } else {
      }
    });
  }

  /**
   * This method use for get document section list for dropdown
   */
  getFieldDataTypeList() {
    this.fieldDataType = new Array();
    this.appConstant.DATA_TYPE_PATTERN_MAP.forEach((value, key) => {
      this.fieldDataType.push({id: key, label: value});
    });
  }

  /**
   * This method use for get datasource List for dropdown
   */
  getDataSourceList() {
    this.additionalFieldService.getDataSourceList().subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        this.dataSources = res.body;
        this.dataSources[0].items.splice(0, 0, {id: 0, label: 'Add New'});

      } else {
      }
    });
  }

  /**
   * This method use for get dropdown Property List for dropdown
   */
  getDropdownPropertyList() {
    this.additionalFieldService.getDropdownPropertyList().subscribe((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.dropdownProperties = res.body;
      } else {
      }
    });
  }

  /**
   * This method use for get file type List for dropdown
   */
  getFileTypeList() {

    this.fileTypes = new Array();
    this.appConstant.MIME_TYPE_MAP.forEach((value, key) => {
      this.fileTypes.push({id: key, label: value});
    });
  }

}
