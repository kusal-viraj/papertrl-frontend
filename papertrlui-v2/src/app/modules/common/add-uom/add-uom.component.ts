import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UomDto} from '../../../shared/dto/item/uom-dto';
import {ItemUtility} from '../../item/item-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {UomService} from '../../../shared/services/items/uom.service';
import {ItemService} from '../../../shared/services/items/item.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {MessageService} from 'primeng/api';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {OverlayPanel} from 'primeng/overlaypanel';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-add-uom',
  templateUrl: './add-uom.component.html',
  styleUrls: ['./add-uom.component.scss']
})
export class AddUomComponent implements OnInit {

  public createUOMForm: UntypedFormGroup;
  public uomDto: UomDto = new UomDto();
  public itemUtility: ItemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
  @Output() updatedUoms = new EventEmitter();
  @ViewChild('uom') uom: OverlayPanel;
  @ViewChild('category') category: OverlayPanel;
  public uoms: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public loading = false;

  constructor(public formBuilder: UntypedFormBuilder, public uomService: UomService, public itemService: ItemService,
              public notificationService: NotificationService, public messageService: MessageService,
              public privilegeService: PrivilegeService, public billsService: BillsService) {
    this.createUOMForm = this.formBuilder.group({
      unit: [null, Validators.compose([Validators.maxLength(10)])],
      description: ['']
    });
  }

  ngOnInit(): void {
  }

  /**
   * This method can be used to create uom
   * @param createUOMForm to form group instance
   */
  createNewUOM(createUOMForm: UntypedFormGroup) {
    this.loading = true;
    this.uomDto = Object.assign(this.uomDto, createUOMForm.value);
    if (this.createUOMForm.valid) {
      this.createUOM(this.uomDto);
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createUOMForm);
    }
  }

  /**
   * This method can be use to reset uom form
   */
  resetUOMForm() {
    this.createUOMForm.reset();
  }



  /**
   * This method use for create new uom
   * @param uomDto to uom dto
   */
  createUOM(uomDto) {
    this.uomService.createUOMService(uomDto).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.UOM_CREATED_SUCCESSFULLY);
        this.getUpdatedUoms();
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get updated uom list
   */
  getUpdatedUoms() {
    this.itemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
    this.updatedUoms.emit(this.itemUtility.uoms);
    this.createUOMForm.reset();
  }
}
