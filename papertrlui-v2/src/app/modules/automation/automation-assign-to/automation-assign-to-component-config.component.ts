import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-automation-assign-to-config',
  templateUrl: './automation-assign-to-component-config.component.html',
  styleUrls: ['./automation-assign-to-component-config.component.scss']
})
export class AutomationAssignToConfigComponent implements OnInit {

  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public isEdit: boolean;
  @Input()
  public isDetailView: boolean;
  @Input()

  @Input()
  public isAllowedToSelectAnAccount = false;
  @Input()
  public isAllowedToSelectAnItem = false;

  @Input()
  public dropDownSelectionId: any;

  @Input()
  public automationForm: UntypedFormGroup;
  public accountList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public isAddNewAccount = false;
  public isAddNewItem = false;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService, public billsService: BillsService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.getDropDownListAccordingToSelectEvent();
    this.getLineItemId();
    if (this.dropDownSelectionId) {
      this.automationAction.controls[this.actionIndex].get('assignToConfig').get('fieldValue').patchValue(this.dropDownSelectionId);
    }
  }

  /**
   * this method trigger change event from automation parent component
   */
  getDropDownListAccordingToSelectEvent() {
    this.automationService.isSelectedItemEvent.subscribe(isItem => {
      if (isItem) {
        this.getItems(this.itemList);
      }
    });
    this.automationService.isSelectedAccountEvent.subscribe(isAccount => {
      if (isAccount) {
        this.getAccounts(this.accountList);
      }
    });
  }

  /**
   * This method use for call add new action dropdown in automation creation screen
   */
  addActionDropDown() {
    this.addNew.emit();
  }

  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.automationAction.controls[this.actionIndex].get('assignToConfig').get('fieldValue').reset();
    this.billsService.getAccountList(!this.isEdit).subscribe((res: any) => {
      listInstance.data = res;
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        listInstance.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get item list
   * @param listInstance to dropdown dto
   */
  getItems(listInstance: DropdownDto) {
    this.automationAction.controls[this.actionIndex].get('assignToConfig').get('fieldValue').reset();
    this.automationService.getItemList().subscribe((res: any) => {
      listInstance.data = res.body;
      if (this.privilegeService.isAuthorized(AppAuthorities.ITEMS_CREATE)) {
        listInstance.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get assignToConfig() {
    return this.automationAction.controls[this.actionIndex].get('assignToConfig') as UntypedFormGroup;
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationAction() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }

  /**
   * this method can be used to change account list
   * @param id to account id
   */
  changeAccountList(id) {
    if (id === AppConstant.ZERO) {
      this.automationAction.controls[this.actionIndex].get('assignToConfig').get('fieldValue').reset();
      this.isAddNewAccount = true;
    }
  }


  /**
   * this method can be used to change account list
   * @param id to account id
   */
  changeItemList(id) {
    if (id === AppConstant.ZERO) {
      this.automationAction.controls[this.actionIndex].get('assignToConfig').get('fieldValue').reset();
      this.isAddNewItem = true;
    }
  }

  /**
   * this method used for get line item id
   */
  getLineItemId() {
    this.automationService.lineItemId.subscribe((id) => {
      if (id) {
        this.automationAction.controls[this.actionIndex].get('assignToConfig').get('fieldValue').patchValue(id);
      }
    });
  }
}
