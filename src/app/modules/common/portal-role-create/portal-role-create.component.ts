import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
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


@Component({
  selector: 'app-portal-role-create',
  templateUrl: './portal-role-create.component.html',
  styleUrls: ['./portal-role-create.component.scss']
})
export class PortalRoleCreateComponent implements OnInit {

  @Output() closeModal = new EventEmitter<boolean>();


  public createRoleForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();

  public privilegedSubAccountList: any[] = [];
  public portalRolePrivilegeDto: PortalUserRole = new PortalUserRole();
  public rolePrivilegeNode: TreeNode[];

  public subAccountsWithRoles: any[];

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
    if (this.editView || this.detailView || this.isClone) {
      await this.getPortalRoleWisePrivilegeStructure();
      await this.getSubAccountRoleWisePrivilegeStructure(this.id);
      await this.getRoleDataDetails();
      await this.getPrivilegedSubAccountList(this.id);
    } else {
      await this.getInitialPortalMenuList();
      await this.getSubAccountRoleWisePrivilegeStructure(0);
    }
    this.createEmptySubAccountRolesList();
    if (this.isClone) {
      this.portalRolePrivilegeDto.subAccountPrivilegeList.forEach(value => {
        this.loadSubAccountPrivileges(value);
      })
    }
  }


  /**
   * This method can be use for get portal menu privileges when create new role
   * @private
   */
  private getInitialPortalMenuList(): Promise<unknown> {
    return new Promise<void>(resolve => {
      this.roleService.getPortalMenuList().subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.rolePrivilegeNode = res.body.data;
            resolve();
          }
        }, (error => {
          this.notificationService.errorMessage(error);
          resolve();
        })
      );
    })
  }

  /**
   * This method can be use for get portal menu privileges when edit role
   * @private
   */
  private getPortalRoleWisePrivilegeStructure(): Promise<unknown> {
    return new Promise<void>(resolve => {
      this.roleService.getPortalRoleWisePrivilegeStructure(this.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.rolePrivilegeNode = res.body.data;
            this.roleName = res.body.roleName;
            resolve();
          }
        }, (error => {
          this.notificationService.errorMessage(error);
          resolve();
        })
      );
    })

  }


  /**
   * This method can be use for get sub account role privileges when update role
   * @private
   */
  private getSubAccountRoleWisePrivilegeStructure(id): Promise<unknown> {
    return new Promise<void>(resolve => {
      this.roleService.getSubAccountRoleWisePrivilegeStructure(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.subAccountsWithRoles = res.body
          resolve();
        }
      }, error => {
        this.notificationService.errorMessage(error);
        resolve();
      });
    })

  }


  /**
   * This method use for get Sub Account List With role privileges
   */
  createEmptySubAccountRolesList() {
    this.subAccountsWithRoles.forEach(((value) => {
      const subAccountPrivilegeDto: SubAccountRoleGrantPrivileges = new SubAccountRoleGrantPrivileges();
      subAccountPrivilegeDto.subAccountId = value.getSubAccountId;
      subAccountPrivilegeDto.subAccountName = value.subAccountName;
      subAccountPrivilegeDto.rolePrivilegeList = value.roleItemContainerDtoV2.data;
      subAccountPrivilegeDto.modified = false;
      this.portalRolePrivilegeDto.subAccountPrivilegeList.push(subAccountPrivilegeDto);
    }));
  }


  /**
   * Get Role Data Information
   */
  getRoleDataDetails() {
    return new Promise<void>(resolve => {
      if (!this.isClone) {
        this.createRoleForm.get('roleName').patchValue(this.roleName);
      }
      this.roleService.getPortalRoleSelectedMenu(this.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.portalRolePrivilegeDto.previlageList = res.body.data;
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
          resolve();
        }, (error => {
          this.notificationService.errorMessage(error);
          resolve();
        })
      );
    })
  }


  /**
   * Submit form
   */
  onSubmit() {
    this.loading = true;
    if (this.createRoleForm.valid) {
      this.portalRolePrivilegeDto.roleName = this.createRoleForm.get('roleName').value;
      if (this.portalRolePrivilegeDto.previlageList) {
        for (const entry of this.portalRolePrivilegeDto.previlageList) {
          entry.__proto__ = null;
          entry.children = null;
          entry.parent = null;
        }
      }
      this.portalRolePrivilegeDto.subAccountPrivilegeList.forEach((value, index) => {
        for (const entry of value.rolePrivilegeList) {
          entry.__proto__ = null;
          entry.children = null;
          entry.parent = null;
        }

        for (const entry of value.subAccountPrivilegeList) {
          entry.__proto__ = null;
          entry.children = null;
          entry.parent = null;
        }
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
        this.resetRoleCreation();
        this.closeModal.emit();
        this.loading = false;
        this.eventEmitterService.loadSubAccounts();
      } else {
        this.resetRoleCreation();
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
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
        this.resetRoleCreation();
        this.closeModal.emit();
        this.eventEmitterService.loadSubAccounts();
        this.loading = false;
      } else {
        this.resetRoleCreation();
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
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
    this.portalRolePrivilegeDto.previlageList = [];
    this.portalRolePrivilegeDto.subAccountPrivilegeList = [];
    this.init();

  }

  /**
   * This method use for get sub account privileges
   * @param subAccount
   */
  loadSubAccountPrivileges(subAccount: SubAccountRoleGrantPrivileges) {
    if (this.editView || this.detailView || this.isClone) {
      this.roleService.getSelectedRolePrivilegeList(this.id, subAccount.subAccountId).then((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          subAccount.subAccountPrivilegeList = res.body.data;
          subAccount.modified = true;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }

  }

  private getPrivilegedSubAccountList(roleId) {
    return new Promise<void>(resolve => {
      this.roleService.getPrivilegedSubAccountList(roleId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.privilegedSubAccountList = res.body;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
        resolve();
      });
    })
  }


  /**
   * This method use for highlight privileged sub accounts
   * @param subAccount
   */
  isPrivilegeAvailable(subAccount: SubAccountRoleGrantPrivileges) {
    if (this.editView || this.detailView || this.isClone) {
      if (subAccount.modified) {
        return subAccount.subAccountPrivilegeList.length === 0 ? 'headerNoData' : '';
      }
      return !this.privilegedSubAccountList.includes(subAccount.subAccountId) ? 'headerNoData' : '';
    } else {
      return subAccount.subAccountPrivilegeList.length === 0 ? 'headerNoData' : '';
    }
  }
}
