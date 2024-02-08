import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminRoutingModule} from './admin-routing.module';
import {RoleManageComponent} from './role-manage/role-manage.component';
import {TabViewModule} from 'primeng/tabview';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {TreeModule} from 'primeng/tree';
import {ToastModule} from 'primeng/toast';
import {CustomerService} from '../../shared/services/demo/customerservice';
import {CalendarModule} from 'primeng/calendar';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {MenuModule} from 'primeng/menu';
import {SidebarModule} from 'primeng/sidebar';
import {AdminHomeComponent} from './admin-home/admin-home.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {UserCreateComponent} from './user-create/user-create.component';
import {UserManageComponent} from './user-manage/user-manage.component';
import {UserUploadComponent} from './user-upload/user-upload.component';
import {PasswordModule} from 'primeng/password';
import {ViewAllRolesComponent} from './view-all-roles/view-all-roles.component';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {ApprovalGroupListComponent} from './approval-group-list/approval-group-list.component';
import {ApprovalGroupUploadComponent} from './approval-group-upload/approval-group-upload.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import {FieldsetModule} from 'primeng/fieldset';
import {KeyFilterModule} from 'primeng/keyfilter';
import {FileUploadModule} from 'primeng/fileupload';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {BlockUIModule} from 'primeng/blockui';
import {PanelModule} from 'primeng/panel';
import {PortalModule} from '../portal/portal.module';
import { RoleCloneComponent } from './role-clone/role-clone.component';
import {NumberDirective} from './number-only';
import {CommonImplModule} from '../common/common-impl.module';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ContextMenuModule} from "primeng/contextmenu";
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";


@NgModule({
  declarations: [ RoleManageComponent, AdminHomeComponent, UserCreateComponent, UserManageComponent,
    UserUploadComponent, ViewAllRolesComponent, ApprovalGroupListComponent, ApprovalGroupUploadComponent,
    PasswordResetComponent, RoleCloneComponent, NumberDirective],
  imports: [
    CommonModule,
    AdminRoutingModule,
    TabViewModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TreeModule,
    ToastModule,
    TableModule,
    MultiSelectModule,
    FormsModule,
    CalendarModule,
    DropdownModule,
    MenuModule,
    SidebarModule,
    OverlayPanelModule,
    PasswordModule,
    ConfirmPopupModule,
    ConfirmDialogModule,
    FieldsetModule,
    KeyFilterModule,
    FileUploadModule,
    NgCircleProgressModule,
    BlockUIModule,
    PanelModule,
    PortalModule,
    CommonImplModule,
    AutoCompleteModule,
    InputSwitchModule,
    ContextMenuModule,
    NgxIntlTelInputModule,
  ],
  providers: [CustomerService, ConfirmationService],
    exports: [

    ]
})
export class AdminModule {
}
