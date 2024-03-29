import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CategoryMstDto} from '../../../shared/dto/item/category-mst-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {ItemUtility} from '../../item/item-utility';
import {CategoryService} from '../../../shared/services/items/category.service';
import {MessageService} from 'primeng/api';
import {ItemService} from '../../../shared/services/items/item.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {

  public createCategoryForm: UntypedFormGroup;
  public categoryMstDto: CategoryMstDto = new CategoryMstDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public itemUtility: ItemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
  public isCategoryAvailable = false;
  @Output() updatedCategories = new EventEmitter();
  public loading = false;

  constructor(public formBuilder: UntypedFormBuilder, public categoryService: CategoryService, public messageService: MessageService,
              public billsService: BillsService,
              public itemService: ItemService, public notificationService: NotificationService, public privilegeService: PrivilegeService) {
    this.createCategoryForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(50)])]
    });
  }

  ngOnInit(): void {
  }

  /**
   * This method can be used create new category
   * @param createCategoryForm to form group instance
   */
  createNewCategory(createCategoryForm: UntypedFormGroup) {
    this.loading = true;
    this.categoryMstDto = Object.assign(this.categoryMstDto, createCategoryForm.value);

    if (this.createCategoryForm.valid) {
      this.createCategory();
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createCategoryForm);
    }
  }

  /**
   * This method is use for create new category
   */
  public createCategory() {
    this.categoryMstDto = Object.assign(this.categoryMstDto, this.createCategoryForm.value);
    this.categoryService.createCategory(this.categoryMstDto).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.CATEGORY_CREATED_SUCCESSFULLY);
        this.getUpdatedCategory();
      } else {
        this.loading = false;
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method use for check category name is exist
   */
  checkCategoryAvailability() {
    if (this.createCategoryForm.controls.name.value !== AppConstant.EMPTY_SPACE) {
      this.categoryMstDto = Object.assign(this.categoryMstDto, this.createCategoryForm.value);
      this.categoryService.getCategoryIsExist(this.categoryMstDto.name).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.isCategoryAvailable = res.body;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method can be used to reset category form
   */
  resetCategoryForm() {
    this.createCategoryForm.reset();
    this.isCategoryAvailable = false;
  }

  /**
   * get updated uom list
   */
  getUpdatedCategory() {
    this.itemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
    this.updatedCategories.emit(this.itemUtility.category);
    this.createCategoryForm.reset();
  }
}
