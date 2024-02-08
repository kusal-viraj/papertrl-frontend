import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'app-additional-field-attach-doc',
  templateUrl: './additional-field-attach-doc.component.html',
  styleUrls: ['./additional-field-attach-doc.component.scss']
})
export class AdditionalFieldAttachDocComponent implements OnInit {

  @Input() fieldId: any;
  @Input() fieldTypeString: any;
  @Output() closeDialog = new EventEmitter();

  public tableSupportBase = new TableSupportBase();
  public documentForm: UntypedFormGroup;
  public fieldDetails: any[] = [];
  public existingDocuments: any[] = [];
  public existingDocumentsValues: any[] = [];
  public sections: any[];
  public loading = false;
  public isCheckedShowOnPOReport = false;
  public printLandscape = false;
  public sectionIds: any [] = [];
  public field: any = {};
  public fieldCount: number;

  constructor(public additionalFieldService: AdditionalFieldService, public notificationService: NotificationService,
              public formBuilder: UntypedFormBuilder, public confirmationService: ConfirmationService) {
  }

  async ngOnInit() {
    this.documentForm = this.formBuilder.group({
      documentRelation: [null, Validators.required],
      documentRelationList: [null],
      id: [null],
    });

    this.documentForm.get('id').patchValue(this.fieldId);
    await this.getSectionList();
    this.getData();
  }

  /**
   * Get Master Data from backend
   */
  getData() {
    this.additionalFieldService.getSelectedField(this.fieldId).subscribe(res => {
      this.fieldDetails = [
        {
          fieldTypeName: res.body.fieldTypeName,
          status: res.body.status,
          fieldName: res.body.fieldName
        }];
      this.sectionIds.push(AppModuleSection.LINE_ITEM_SECTION_ID);
      this.sectionIds.push(AppModuleSection.PURCHASING_ACCOUNT_INFO);
      this.getActiveFieldCountOnPOReport(false);
      this.existingDocuments = res.body.documentRelationList;
      this.existingDocumentsValues = res.body.documentRelationValueList;
      res.body.documentRelationValueList.forEach((selectedValues) => {
        this.sections.forEach(section => {
          section.items.forEach(item => {
            if (JSON.stringify(item.value) === JSON.stringify(selectedValues)) {
              item.inactive = true;
            }
          });
        });
      });
      this.documentForm.get('documentRelation').patchValue(this.existingDocumentsValues);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get document section list for dropdown
   */
  async getSectionList() {
    await this.additionalFieldService.getSectionListWithSelected(this.fieldId).then((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.sections = res.body;
      }
    });
  }

  submit() {
    if (!this.documentForm.valid) {
      new CommonUtility().validateForm(this.documentForm);
    } else {
      this.documentForm.get('documentRelationList').patchValue(this.existingDocuments);
      const obj = {documentRelationList: null, documentRelationValueList: null, id: null};
      obj.documentRelationList = this.documentForm.get('documentRelationList').value;
      obj.documentRelationValueList = this.documentForm.get('documentRelation').value;
      obj.id = this.documentForm.get('id').value;
      this.loading = true;
      this.additionalFieldService.attachDocument(obj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.DOCUMENT_ATTACHED_TO_FIELD_SUCCESSFULLY);
          this.close();
          this.reset();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.loading = false;
      }, error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  showExportCheck(moduleId) {
    /**
     * Bill
     * Purchase Order
     * Purchase Order Receipt
     * Expense Report
     */
    const exportDocuments = [1, 2, 3, 4, 8];
    return exportDocuments.includes(moduleId);
  }

  close() {
    this.closeDialog.emit();
  }

  reset() {
    this.documentForm.reset();
    this.documentForm.get('id').patchValue(this.fieldId);
    this.getData();
  }

  /**
   * Toggle Field status
   * @param field
   */
  fieldStatusChanged(field: any) {
    const tempArray = [];
    tempArray.push(this.fieldId);
    this.additionalFieldService.activateInactivateField(tempArray, field.status).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (!field.status) {
          // Disable all documents if the field is inactivated
          this.inactivateAndDisableDocs();
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
        field.status = !field.status;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      field.status = !field.status;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Toggle document
   * @param field
   */
  documentStatusChanged(field: any) {
    if (!field.status && field.appearOnReport) {
      field.appearOnReport = false;
      field.headerAppearOnReport = null;
    }
    this.additionalFieldService.activateInactivateDocument(field.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
      } else {
        this.notificationService.infoMessage(res.body.message);
        field.status = !field.status;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      field.status = !field.status;
      this.notificationService.errorMessage(error);
    });
  }


  /**
   *   Disable all documents if the field is inactivated
   */
  inactivateAndDisableDocs() {
    this.existingDocuments.forEach(value => {
      value.status = false;
      if (value.appearOnReport) {
        value.appearOnReport = false;
        value.headerAppearOnReport = null;
      }
    });
  }

  /**
   * Required Status Changed
   * @param document
   */
  requiredStatusChanged(document) {
    this.additionalFieldService.documentRequiredStatusChanged(document.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
      } else {
        this.notificationService.infoMessage(res.body.message);
        document.required = !document.required;
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      document.required = !document.required;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to validate po report line level additional field count
   * @param field to manage doc table row object
   */
  checkAdditionalFieldCountOnPOReport(field) {
    this.field = {};
    this.field = field;
    this.isCheckedShowOnPOReport = this.field.appearOnReport;
    let allowedTOCall = false;
    let selectedLineLevel = false;
    this.sectionIds = [];

    if (this.field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID && !this.field.appearOnReport) {
      this.field.headerAppearOnReport = null;
    }

    selectedLineLevel = (this.field.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) ||
      (this.field.sectionId === AppModuleSection.PURCHASING_ACCOUNT_INFO);

    if (selectedLineLevel) {
      allowedTOCall = true;
      this.sectionIds.push(AppModuleSection.LINE_ITEM_SECTION_ID);
      this.sectionIds.push(AppModuleSection.PURCHASING_ACCOUNT_INFO);
    }

    if (!allowedTOCall) {
      return;
    }
    if (this.isCheckedShowOnPOReport) {
      this.getActiveFieldCountOnPOReport(true);
    } else {
      field.printLandscape = false;
      this.validateConfirmationMessage();
      this.field.headerAppearOnReport = null;
    }
  }

  /**
   * this method get active fields count in po report
   */

  getActiveFieldCountOnPOReport(fromCheckBox) {
    this.additionalFieldService.validateAdditionalFieldCount(AppDocumentType.PURCHASE_ORDER, this.sectionIds)
      .subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.fieldCount = null;
          this.fieldCount = Number(res.body.message);
          if (Number(res.body.message) === 3 && fromCheckBox) {
            this.getConfirmationToCreateAdditionalField(this.field);
          }
          this.validateConfirmationMessage();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * this method get confirmation to print po report according to the field count
   * @param field to manage doc table row object
   */
  getConfirmationToCreateAdditionalField(field: any) {
    if (this.printLandscape) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'additionalFieldCreateConfirmation',
        message: HttpResponseMessage.PO_REPORT_ORIENTATION_MODE_ACCORDING_TO_FIELD_COUNT,
        accept: () => {
          this.printLandscape = true;
          field.printLandscape = true;
        },
        reject: () => {
          field.appearOnReport = false;
          this.printLandscape = false;
          field.printLandscape = false;
        },
      });
    }
  }

  /**
   * this method used for show hide po report additional field print count confirmation
   */
  validateConfirmationMessage() {
    const isActiveOnReport =
      this.existingDocuments.filter(x => x.appearOnReport === true && (x.sectionId === 2 || x.sectionId === 9)).length > 0;
    this.printLandscape = this.fieldCount >= 3 && isActiveOnReport;
  }

  /**
   * this method used for patch same value to po module line sections
   */
  patchSectionHeadingLabelAsSame(item: any) {
    if (!item) {
      return;
    } else {
      let existingDocuments: any = [];
      existingDocuments = this.existingDocuments.filter(x => (x.sectionId === 2 || x.sectionId === 9));
      if (item.sectionId === 2 || item.sectionId === 9) {
        existingDocuments.forEach(value => {
          value.headerAppearOnReport = item.headerAppearOnReport;
        });
      }
    }
  }
}
