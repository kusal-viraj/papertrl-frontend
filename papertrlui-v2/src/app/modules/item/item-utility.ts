import {ItemService} from '../../shared/services/items/item.service';
import {DropdownDto} from '../../shared/dto/common/dropDown/dropdown-dto';
import {MessageService} from 'primeng/api';
import {PrivilegeService} from '../../shared/services/privilege.service';
import {AppAuthorities} from '../../shared/enums/app-authorities';
import {AppConstant} from "../../shared/utility/app-constant";
import {CommonMessage} from "../../shared/utility/common-message";
import {NotificationService} from "../../shared/services/notification/notification.service";
import {BillsService} from '../../shared/services/bills/bills.service';

export class ItemUtility {
  public itemTypes = new DropdownDto();
  public uoms = new DropdownDto();
  public category = new DropdownDto();
  public statusList = new DropdownDto();
  public itemListNotConsideringVendor = new DropdownDto();

  constructor(public privilegeService: PrivilegeService, public itemService: ItemService, public messageService: MessageService,
              public notificationService: NotificationService, public billsService: BillsService) {
    this.getItemTypes(this.itemTypes, false);
    this.getUoms(this.uoms, true);
    this.getCategory(this.category, true);
    this.getItemListNotConsideringVendor(this.itemListNotConsideringVendor);
    this.statusList.data = [{id: 'A', name: 'Active'}, {id: 'I', name: 'Inactive'}];
  }

  /**
   * get uom list
   * @param listInstance to dropdown list instance
   * @param isAddNew to whether available add new
   */
  getUoms(listInstance: DropdownDto, isAddNew){
    this.itemService.getUom().subscribe((res: any) => {
      listInstance.data = (res);
    }, error => {
      this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: error});
    });
  }

  /**
   * get category
   * @param listInstance to dropdown dto
   * @param isAddNew to whether available add new
   */
  getCategory(listInstance: DropdownDto, isAddNew){
    this.itemService.getCategory().subscribe((res: any) => {
      listInstance.data = (res);
    }, error => {
      this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: error});
    });
  }

  /**
   * get item types
   * @param listInstance to dropdown dto
   * @param isAddNew to whether available add new
   */
  getItemTypes(listInstance: DropdownDto, isAddNew){
    this.itemService.getItemType().subscribe((res: any) => {
      listInstance.data = (res);
      if (isAddNew) {
        listInstance.addNew();
      }
    }, error => {
      this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: error});
    });
  }

  /**
   * this method validated file type and size
   * @param event to change event
   * @param file to selected file
   */
  isValidFile(event, file) {
    let itemImage: File;
    itemImage = event.target.files[0];
    if ((itemImage.size / 1024 / 1024) > AppConstant.MAX_PROPIC_SIZE) {
      itemImage = null;
      file.value = null;
      this.notificationService.infoMessage(CommonMessage.INVALID_IMAGE_SIZE);
      return false;
    } else {
      const contentType: string = itemImage.type;
      if (!AppConstant.SUPPORTING_PRO_PIC_TYPES.includes(contentType)) {
        itemImage = null;
        file.value = null
        this.notificationService.infoMessage(CommonMessage.INVALID_PRO_PIC_TYPE);
        return false;
      }
    }
    return true;
  }

  /**
   * get item list not considering vendor
   * @param listInstance to dropdown dto
   */
  getItemListNotConsideringVendor(listInstance: DropdownDto) {
    this.itemService.getItemListNotConsideringVendor().subscribe((res: any) => {
      listInstance.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

}
