import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TreeNode} from 'primeng/api';
import {RoleService} from '../../../shared/services/roles/role.service';
import {RoleMasterDto} from '../../../shared/dto/role/role-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';


@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.scss']
})
export class RoleCreateComponent implements OnInit {

  @Output() closeModal = new EventEmitter<boolean>();

  public createRoleForm: UntypedFormGroup;
  public privilegeFiles: TreeNode[];
  public roleRequestDto: RoleMasterDto = new RoleMasterDto();
  public privilegeNode: TreeNode[];
  public loading: boolean;
  public display = false;
  public isRoleNameAvailable = false;
  public btnLoading = false;


  @Input() panel;
  @Input() roleName;
  @Input() editView;
  @Input() detailView;
  @Input() id;

  constructor(private formBuilder: UntypedFormBuilder, public notificationService: NotificationService, private roleService: RoleService) {
    this.initFormBuilder();
  }

  /**
   * this method can be used to init form builder
   */
  initFormBuilder(){
    this.createRoleForm = this.formBuilder.group({
      roleName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])]
    });
  }

  /**
   * Load Items in load
   */
  ngOnInit(): void {
    this.getRoleData();
  }

  /**
   * This method used to get role data
   */
  getRoleData(): void {
    this.loading = true;

    if (this.editView || this.detailView) {
      this.getRoleWisePrivilegeStructure();
    } else {
      this.getInitialRoleStructure();
    }
  }

  getInitialRoleStructure(): void {
    this.roleService.getInitialSystemRoles().subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.privilegeFiles = res.body.data;
          this.loading = false;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  getRoleWisePrivilegeStructure(): void {
    this.roleService.getRoleWisePrivilegeStructure(this.id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.privilegeFiles = res.body.data;
          this.roleName = res.body.roleName;
          this.loading = false;
          this.getRoleDataDetails();
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );

  }


  /**
   * Get Role Data Information
   */
  getRoleDataDetails(): void {
    this.createRoleForm.get('roleName').patchValue(this.roleName);
    this.getSelectedRole();
  }

  getSelectedRole(): void {
    this.roleService.getRoleSelectedMenu(this.id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.privilegeNode = res.body.data;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  checkRoleNameAvailability(): void {
    const letter = this.createRoleForm.get('roleName').value;
    if (this.editView && (String(letter).trim() === String(this.roleName).trim())) {
      return;
    }
    if (this.createRoleForm.get('roleName').value) {
      if (this.createRoleForm.get('roleName').value[0] === AppConstant.EMPTY_SPACE) {
        this.createRoleForm.get('roleName').patchValue(AppConstant.EMPTY_STRING);
      } else {
        this.roleService.checkRoleNameAvailability(letter).subscribe((res: any) => {
            this.isRoleNameAvailable = !res;
          },
          error => {
            this.notificationService.errorMessage(error);
          });
      }
    }
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    this.btnLoading = true;
    if (this.createRoleForm.valid) {
      if (this.privilegeNode === undefined || this.privilegeNode.length <= 0) {
        this.notificationService.infoMessage(HttpResponseMessage.PLEASE_SELECT_ATLEAST_ONE_PRIVILEGE);
        this.btnLoading = false;
      } else {
        this.roleRequestDto.previlageList = this.privilegeNode;
        this.roleRequestDto.roleName = this.createRoleForm.value;
        if (this.editView) {
          if (!this.isRoleNameAvailable && this.createRoleForm.get('roleName').value !== '') {
            this.updateRole();
          } else {
            this.btnLoading = false;
          }
        } else {
          if (!this.isRoleNameAvailable && this.createRoleForm.get('roleName').value !== '') {
            this.createRole();
          } else {
            this.btnLoading = false;
          }
        }
      }
    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.createRoleForm);
    }
  }

  /**
   * Update Role
   */
  updateRole(): void {
    let role: RoleMasterDto = new RoleMasterDto();
    role = this.roleRequestDto;
    role.roleId = this.id;
    role.roleName = this.roleRequestDto.roleName = this.createRoleForm.get('roleName').value;
    this.roleService.updateRole(role).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.btnLoading = false;
          this.createRoleForm.reset();
          this.closeModal.emit();
          this.notificationService.successMessage(HttpResponseMessage.ROLE_UPDATED_SUCCESSFULLY);
        } else {
          this.btnLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * Create Role
   */
  createRole(): void {
    this.roleRequestDto.roleName = this.createRoleForm.get('roleName').value;
    this.roleService.createRole(this.roleRequestDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.ROLE_CREATED_SUCCESSFULLY);
        this.resetRoleCreation();
        this.closeModal.emit();
        this.btnLoading = false;
      } else {
        this.btnLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error) => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Reset Role form
   */
  resetRoleCreation(): void {
    if (!this.editView) {
      this.createRoleForm.reset();
      this.privilegeNode = undefined;
    } else {
      this.getRoleData();
    }
  }
}
