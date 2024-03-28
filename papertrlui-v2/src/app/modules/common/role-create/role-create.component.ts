import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TreeNode} from 'primeng/api';
import {RoleService} from '../../../shared/services/roles/role.service';
import {RoleMasterDto} from '../../../shared/dto/role/role-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {TreeCheckboxComponent} from '../tree-checkbox/tree-checkbox.component';


@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.scss']
})
export class RoleCreateComponent implements OnInit {

  @Output() closeModal = new EventEmitter<boolean>();

  public createRoleForm: UntypedFormGroup;
  public treeNodes: TreeNode[] | any[];
  public roleRequestDto: RoleMasterDto = new RoleMasterDto();
  public display = false;
  public btnLoading = false;

  @ViewChild('treeCheckboxComponent') public treeCheckboxComponent: TreeCheckboxComponent;

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
  initFormBuilder() {
    this.createRoleForm = this.formBuilder.group({
      roleName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])]
    });
  }

  /**
   * Load Items in load
   */
  ngOnInit(): void {
    this.getInitialRoleStructure();
  }

  getInitialRoleStructure(): void {
    this.roleService.getInitialSystemRoles().subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.treeNodes = res.body.data;
          if (this.editView || this.detailView) {
            this.getSelectedRole();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  getSelectedRole(): void {
    this.roleService.getRoleSelectedMenu(this.id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.createRoleForm.get('roleName').patchValue(res.body.roleName);
          this.treeCheckboxComponent.selectNodes(res.body.privilegeList, this.treeNodes);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.createRoleForm.valid) {
      this.roleRequestDto.privilegeList = this.treeCheckboxComponent.getSelectedKeys(this.treeNodes);
      this.roleRequestDto.roleName = this.createRoleForm.get('roleName').value;

      if (this.roleRequestDto.privilegeList === undefined || this.roleRequestDto.privilegeList.length <= 0) {
        this.notificationService.infoMessage(HttpResponseMessage.PLEASE_SELECT_ATLEAST_ONE_PRIVILEGE);
      } else {
        this.btnLoading = true;
        if (this.editView) {
          this.updateRole();
        } else {
          this.createRole();
        }
      }
    } else {
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
          this.notificationService.successMessage(HttpResponseMessage.ROLE_UPDATED_SUCCESSFULLY);
          this.closeModal.emit();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.btnLoading = false;
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
    this.roleService.createRole(this.roleRequestDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.ROLE_CREATED_SUCCESSFULLY);
        this.closeModal.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.btnLoading = false;
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
    this.getInitialRoleStructure();
  }
}