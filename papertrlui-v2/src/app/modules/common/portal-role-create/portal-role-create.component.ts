import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TreeNode} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RoleService} from '../../../shared/services/roles/role.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PortalUserRole} from '../../../shared/dto/portal/portal-user-role';
import {SubAccountRoleGrantPrivileges} from '../../../shared/dto/portal/sub-account-role-grant-privileges';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {EventEmitterService} from '../../../shared/services/common/event-emitter/event-emitter.service';
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {TreeCheckboxComponent} from "../tree-checkbox/tree-checkbox.component";


@Component({
  selector: 'app-portal-role-create',
  templateUrl: './portal-role-create.component.html',
  styleUrls: ['./portal-role-create.component.scss']
})
export class PortalRoleCreateComponent implements OnInit {

  @Output() closeModal = new EventEmitter<boolean>();

  @ViewChild('treeCheckboxComponent') public treeCheckboxComponent: TreeCheckboxComponent;
  @ViewChildren('subAccountTreeCheckboxComponent') public subAccountTreeCheckboxComponents: QueryList<TreeCheckboxComponent>;

  public createRoleForm: UntypedFormGroup;

  public portalRolePrivilegeDto: PortalUserRole = new PortalUserRole();
  public treeNodes: TreeNode[];

  public subAccountsWithTreeNodes: any[];

  public loading = false;

  @Input() panel;
  @Input() roleName;
  @Input() editView = false;
  @Input() isClone = false;
  @Input() detailView = false;
  @Input() id = 0;

  constructor(private formBuilder: UntypedFormBuilder, public notificationService: NotificationService, private roleService: RoleService,
              public eventEmitterService: EventEmitterService) {

  }

  /**
   * Load Items in load
   */
  ngOnInit(): void {
    this.createRoleForm = this.formBuilder.group({
      roleName: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
    });
    this.init();
  }

  /**
   * load structures and data
   */
  async init() {
    this.getInitialPortalMenuList();
    await this.getSubAccountRoleWisePrivilegeStructure(this.id);

    if (this.editView || this.detailView || this.isClone) {
      await this.getRoleDataDetails();
    }
    this.createEmptySubAccountRolesList();
    if (this.isClone) {
      this.portalRolePrivilegeDto.subAccountPrivilegeList.forEach((value, index) => {
        this.loadSubAccountPrivileges(value, index);
      });
    }
  }


  /**
   * This method can be used for get portal menu privileges when create new role
   * @private
   */
  private getInitialPortalMenuList() {
    this.roleService.getPortalMenuList().subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.treeNodes = res.body.data;
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * This method can be use for get sub account role privileges when update role
   * @private
   */
  private getSubAccountRoleWisePrivilegeStructure(id): Promise<unknown> {
    return new Promise<void>(resolve => {
      this.roleService.getSubAccountRoleWisePrivilegeStructure(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.subAccountsWithTreeNodes = res.body;
          resolve();
        }
      }, error => {
        this.notificationService.errorMessage(error);
        resolve();
      });
    });
  }


  /**
   * This method use for get Sub Account List With role privileges
   */
  createEmptySubAccountRolesList() {
    this.subAccountsWithTreeNodes.forEach(((value) => {
      const subAccountPrivilegeDto: SubAccountRoleGrantPrivileges = new SubAccountRoleGrantPrivileges();
      subAccountPrivilegeDto.subAccountId = value.getSubAccountId;
      subAccountPrivilegeDto.subAccountName = value.subAccountName;
      subAccountPrivilegeDto.rolePrivilegeList = value.roleItemContainerDtoV2.data;
      subAccountPrivilegeDto.modified = false;
      subAccountPrivilegeDto.hasPrivilege = value.hasPrivilege;
      this.portalRolePrivilegeDto.subAccountPrivilegeList.push(subAccountPrivilegeDto);
    }));
  }


  /**
   * Get Role Data Information
   */
  getRoleDataDetails() {
    return new Promise(resolve => {
      this.roleService.getPortalRoleSelectedMenu(this.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            if (!this.isClone) {
              this.createRoleForm.get('roleName').patchValue(res.body.roleName);
            }
            this.treeCheckboxComponent.selectNodes(res.body.privilegeList, this.treeNodes);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
          resolve(true);
        }, (error => {
          this.notificationService.errorMessage(error);
          resolve(true);
        })
      );
    });
  }


  /**
   * Submit form
   */
  onSubmit() {
    this.loading = true;
    if (this.createRoleForm.valid) {
      this.portalRolePrivilegeDto.roleName = this.createRoleForm.get('roleName').value;
      this.portalRolePrivilegeDto.privilegeList = this.treeCheckboxComponent.getSelectedKeys(this.treeNodes);

      this.portalRolePrivilegeDto.subAccountPrivilegeList.forEach((value, index) => {
        value.subAccountPrivilegeList = this.treeCheckboxComponent.getSelectedKeys(value.rolePrivilegeList);
      });

      if (this.editView) {
        this.portalRolePrivilegeDto.roleId = this.id;
        this.updateRole(this.portalRolePrivilegeDto);
      } else {
        this.createRole(this.portalRolePrivilegeDto);
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createRoleForm);
    }
  }

  /**
   * Create Role
   */
  createRole(portalRolePrivilegeDto: PortalUserRole) {
    this.roleService.createPortalRole(portalRolePrivilegeDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.ROLE_CREATED_SUCCESSFULLY);
        this.closeModal.emit();
        this.eventEmitterService.loadSubAccounts();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Update Role
   */
  updateRole(portalRolePrivilegeDto: PortalUserRole) {
    this.roleService.updatePortalRole(portalRolePrivilegeDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ROLE_UPDATED_SUCCESSFULLY);
        this.closeModal.emit();
        this.eventEmitterService.loadSubAccounts();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Reset Role form
   */
  resetRoleCreation() {
    this.createRoleForm.reset();
    this.portalRolePrivilegeDto.privilegeList = [];
    this.portalRolePrivilegeDto.subAccountPrivilegeList = [];
    this.init();

  }

  /**
   * This method use for get sub account privileges
   * @param subAccount
   * @param i index
   */
  loadSubAccountPrivileges(subAccount: SubAccountRoleGrantPrivileges, i: number) {
    if ((this.editView || this.detailView || this.isClone) && !subAccount.modified) {
      this.roleService.getSelectedRolePrivilegeList(this.id, subAccount.subAccountId).then((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.subAccountTreeCheckboxComponents.toArray()[i].selectNodes(res.body.privilegeList, subAccount.rolePrivilegeList);
          subAccount.modified = true;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }

  }


  /**
   * This method use for highlight privileged sub accounts
   * @param subAccount
   */
  isPrivilegeAvailable(subAccount: SubAccountRoleGrantPrivileges) {
    if (this.editView || this.detailView || this.isClone) {
      if (!subAccount.modified) {
        return subAccount.hasPrivilege ? '' : 'role-accordion-header-text-light';
      }
    }
    for (let node of subAccount.rolePrivilegeList) {
      if (node.indeterminate || node.selected) {
        return '';
      }
    }
    return 'role-accordion-header-text-light';
  }
}
