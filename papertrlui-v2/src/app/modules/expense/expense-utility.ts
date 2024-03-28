import {ExpenseService} from '../../shared/services/expense/expense.service';
import {DropdownDto} from '../../shared/dto/common/dropDown/dropdown-dto';
import {AppConstant} from '../../shared/utility/app-constant';
import {NotificationService} from '../../shared/services/notification/notification.service';
import {CommonMessage} from '../../shared/utility/common-message';
import {HttpResponseMessage} from '../../shared/utility/http-response-message';
import {AppDocumentType} from '../../shared/enums/app-document-type';
import {PrivilegeService} from "../../shared/services/privilege.service";
import {AppAuthorities} from "../../shared/enums/app-authorities";
import {AppResponseStatus} from "../../shared/enums/app-response-status";
import {ManageDrawerService} from "../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {BillsService} from '../../shared/services/bills/bills.service';

export class ExpenseUtility {

  public approvalUserList: DropdownDto = new DropdownDto();
  public expenseTypeList: DropdownDto = new DropdownDto();
  public expenseAccountList: DropdownDto = new DropdownDto();
  public automationNameList: DropdownDto = new DropdownDto();
  public showExpenseDraftListByDefault = false;

  constructor(public expenseService: ExpenseService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public drawerService: ManageDrawerService, public billsService: BillsService) {
    this.getExpenseTypeList(this.expenseTypeList);
    this.getAutomationNameList(this.automationNameList);
    this.getAccounts(this.expenseAccountList);
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getExpenseTypeList(listInstance: DropdownDto) {
    this.expenseService.getExpenseTypeList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * validate additional attachments
   * @param file to file
   */
  validateExpenseAttachments(file) {
    if ((file.size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      this.notificationService.errorMessage(CommonMessage.INVALID_FILE_SIZE);
      return false;
    } else {
      return true;
    }
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getAutomationNameList(listInstance: DropdownDto) {
    this.expenseService.getAutomationNameList(AppDocumentType.EXPENSE).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.expenseService.getExpenseAccountList().subscribe((res: any) => {
      listInstance.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to download attachment
   */
  commonDownloadAttachment(attachmentId) {
    if (attachmentId.id != null) {
      this.expenseService.downloadAttachment(attachmentId.id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', attachmentId.fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  downloadAdditionalAttachment(val) {
    this.expenseService.downloadAdditionalFieldAttachment(val.id).subscribe((res: any) => {
      console.log('start download:', res);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Function used to get user's expense draft list
   * Call from create expense constructor()
   */
  getExpenseDraftListState(){
    this.drawerService.getDefaultDrawerState(AppConstant.EXPENSE_DRAFT_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showExpenseDraftListByDefault = res.body;
      }else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error =>{
      this.notificationService.errorMessage(error);
    });
  }

}
