import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TreeNode} from "primeng/api";
import {RoleMasterDto} from "../../../shared/dto/role/role-master-dto";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {RoleService} from "../../../shared/services/roles/role.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-role-clone',
  templateUrl: './role-clone.component.html',
  styleUrls: ['./role-clone.component.scss']
})
export class RoleCloneComponent implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();

  public createRoleForm: UntypedFormGroup;
  public privilegeFiles: TreeNode[];
  public roleRequestDto: RoleMasterDto = new RoleMasterDto();
  public privilegeNode: TreeNode[];
  public isRoleNameAvailable = false;
  public btnLoading = false;

  @Input() panel;
  @Input() id;

  constructor(private formBuilder: UntypedFormBuilder, public notificationService: NotificationService, private roleService: RoleService) {
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
    this.getRoleWisePrivilegeStructure();
  }

  getRoleWisePrivilegeStructure(): void {
    this.roleService.getRoleWisePrivilegeStructure(this.id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.privilegeFiles = res.body.data;
          this.getSelectedRole();
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );

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
    if (this.createRoleForm.get('roleName').value) {
      if (this.createRoleForm.get('roleName').value[0] === ' ') {
        this.createRoleForm.get('roleName').patchValue('');
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
        if (!this.isRoleNameAvailable && this.createRoleForm.get('roleName').value !== '') {
          this.createRole();
        } else {
          this.btnLoading = false;
        }
      }
    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.createRoleForm);
    }
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
    this.createRoleForm.reset();
    this.getRoleData();
  }
}
