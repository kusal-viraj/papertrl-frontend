import {NgModule} from '@angular/core';
import {AuditTrialComponent} from './audit-trial/audit-trial.component';
import {TimelineModule} from 'primeng/timeline';
import {CardModule} from 'primeng/card';
import {CommonModule} from '@angular/common';
import {SidebarModule} from 'primeng/sidebar';
import {ButtonModule} from 'primeng/button';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {AddVendorComponent} from './add-vendor/add-vendor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {TableBillNoOverlayComponent} from './table-bill-no-overlay/table-bill-no-overlay.component';
import {TablePoOverlayComponent} from './table-po-overlay/table-po-overlay.component';
import {DropdownModule} from 'primeng/dropdown';
import {AddTemplateComponent} from './add-template/add-template.component';
import {AdditionalFieldAddNewComponent} from './additional-field-add-new/additional-field-add-new.component';
import {ToastModule} from 'primeng/toast';
import {AddItemComponent} from './add-item/add-item.component';
import {AddAccountComponent} from './add-account/add-account.component';
import {InputSwitchModule} from 'primeng/inputswitch';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {CheckboxModule} from 'primeng/checkbox';
import {AddUomComponent} from './add-uom/add-uom.component';
import {AddCategoryComponent} from './add-category/add-category.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {AddUserComponent} from './add-user/add-user.component';
import {MultiSelectModule} from 'primeng/multiselect';
import {PasswordModule} from 'primeng/password';
import {DividerModule} from 'primeng/divider';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {BulkNotificationsComponent} from './bulk-notifications/bulk-notifications.component';
import {DialogModule} from 'primeng/dialog';
import {TableModule} from 'primeng/table';
import {UploadNotificationsComponent} from './upload-notifications/upload-notifications.component';
import {CalendarModule} from 'primeng/calendar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {AddDepartmentComponent} from './add-department/add-department.component';
import {AddExpenseTypeComponent} from './add-expense-type/add-expense-type.component';
import {CreateNewProjectCodeComponent} from './create-new-project-code/create-new-project-code.component';
import {AddNewApprovalGroupComponent} from './add-new-approval-group/add-new-approval-group.component';
import {AttachmentViewComponent} from './attachment-view/attachment-view.component';
import {ChipsModule} from 'primeng/chips';
import {InputNumberModule} from 'primeng/inputnumber';
import {NumberDirective} from './number-only';
import {DecimalNumberDirective} from './decimal-number.directive';
import {ConfirmationPopupComponent} from './confirmation-popup/confirmation-popup.component';
import {ReadMoreTextComponent} from './read-more-text/read-more-text.component';
import {AdditionalFileUploadComponent} from './additional-file-upload/additional-file-upload.component';
import {LabelModule} from '@progress/kendo-angular-label';
import {TooltipModule} from 'primeng/tooltip';
import {TableVendorOverlayComponent} from './table-vendor-overlay/table-vendor-overlay.component';
import {TablePaymentsOverlayComponent} from './table-payments-overlay/table-payments-overlay.component';
import {TablePoReceiptOverlayComponent} from './table-po-receipt-overlay/table-po-receipt-overlay.component';
import {TableProjectTaskOverlayComponent} from './table-project-task-overlay/table-project-task-overlay.component';
import {BillHeaderSectionComponent} from './bill-header-section/bill-header-section.component';
import {KeyFilterModule} from 'primeng/keyfilter';
import {TableItemOverlayComponent} from './table-item-overlay/table-item-overlay.component';
import {TableAccountOverlayComponent} from './table-account-overlay/table-account-overlay.component';
import {TableColumnFiltersComponent} from './table-column-filters/table-column-filters.component';
import {TableColumnToggleComponent} from './table-column-toggle/table-column-toggle.component';
import {OrderListModule} from 'primeng/orderlist';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TableHeaderActionButtonsComponent} from './table-header-action-buttons/table-header-action-buttons.component';
import {BlockSpace} from '../../shared/pipe/block-space';
import {RoleCreateComponent} from './role-create/role-create.component';
import {TreeModule} from 'primeng/tree';
import {FieldsetModule} from 'primeng/fieldset';
import {CreateApprovalGroupComponent} from './create-approval-group/create-approval-group.component';
import {ApprovalGroupCreateComponent} from './approval-group-create/approval-group-create.component';
import {WorkFlowSectionComponent} from './work-flow-section/work-flow-section.component';
import {TableExpenseOverlayComponent} from './table-expense-overlay/table-expense-overlay.component';
import {PortalRoleCreateComponent} from './portal-role-create/portal-role-create.component';
import {AccordionModule} from 'primeng/accordion';
import { AutomatedWorkflowPreviewComponent } from './automated-workflow-preview/automated-workflow-preview.component';
import { VendorGroupFormComponent } from './vendor-group-form/vendor-group-form.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ListboxModule} from 'primeng/listbox';
import { TableInlineColumnFiltersComponent } from './table-inline-column-filters/table-inline-column-filters.component';
import {TablePaymentTypeOverlayComponent} from './table-payment-type-overlay/table-payment-type-overlay.component';
import { AddVendorUsersComponent } from './add-vendor-users/add-vendor-users.component';

import {VCardEditComponent} from './v-card-edit/v-card-edit.component';
import {DCardCreateComponent} from './d-card-create/d-card-create.component';
import { CountryCodeValidationComponent } from './country-code-validation/country-code-validation.component';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {TableCardsOverlayComponent} from './table-cards-overlay/table-cards-overlay.component';
import { AdditionalFieldLineItemsComponent } from './additional-field-line-items/additional-field-line-items.component';
import { AddCustomerInvoiceComponent } from './add-customer-invoice/add-customer-invoice.component';
import { TabindexMinusOneDirective } from './tabindex-minus-one.directive';
import { SkipTabviewDirective } from './skip-tabview.directive';
import { CountryPanelOpenDirective } from './country-panel-open.directive';
import { MultiselectFocusDirective } from './multiselect-focus.directive';
import { AdditionalFieldHeaderItemsComponent } from './additional-field-header-items/additional-field-header-items.component';
import { NoNegativeValuesDirective } from './no-negative-values.directive';
import { LoaderComponent } from './loader/loader.component';
import { TreeCheckboxComponent } from './tree-checkbox/tree-checkbox.component';
import { AccessDeniedContainer } from './access-denied/access-denied-container';


@NgModule({
  declarations: [AuditTrialComponent, AddVendorComponent, TableBillNoOverlayComponent,
    TablePoOverlayComponent, AddTemplateComponent, AdditionalFieldAddNewComponent, CreateNewProjectCodeComponent,
    AddItemComponent, AddAccountComponent, AddUomComponent, AddCategoryComponent, AddUserComponent,
    BulkNotificationsComponent, UploadNotificationsComponent, AttachmentViewComponent, TableAccountOverlayComponent,
    AddDepartmentComponent, AddExpenseTypeComponent, AddNewApprovalGroupComponent, NumberDirective,
    DecimalNumberDirective, ConfirmationPopupComponent, ReadMoreTextComponent, AdditionalFileUploadComponent,
    TableVendorOverlayComponent, TablePaymentsOverlayComponent, TablePoReceiptOverlayComponent,
    TableProjectTaskOverlayComponent, BillHeaderSectionComponent, TableItemOverlayComponent, TableColumnFiltersComponent,
    TableColumnToggleComponent, TableHeaderActionButtonsComponent, BlockSpace, RoleCreateComponent, PortalRoleCreateComponent,
    ApprovalGroupCreateComponent, CreateApprovalGroupComponent, WorkFlowSectionComponent, TableExpenseOverlayComponent,
    AutomatedWorkflowPreviewComponent, VendorGroupFormComponent, TableInlineColumnFiltersComponent,
    TablePaymentTypeOverlayComponent, AddVendorUsersComponent, DCardCreateComponent, TableCardsOverlayComponent,
    VCardEditComponent, CountryCodeValidationComponent, AddCustomerInvoiceComponent, TabindexMinusOneDirective,
    SkipTabviewDirective, CountryPanelOpenDirective, MultiselectFocusDirective, AdditionalFieldLineItemsComponent, AdditionalFieldHeaderItemsComponent, NoNegativeValuesDirective, LoaderComponent, TreeCheckboxComponent, AccessDeniedContainer],

    exports: [
        AuditTrialComponent,
        AddVendorComponent,
        TablePoOverlayComponent,
        TableBillNoOverlayComponent,
        AddTemplateComponent,
        AdditionalFieldAddNewComponent,
        AddItemComponent,
        AddAccountComponent,
        AddUserComponent,
        BulkNotificationsComponent,
        AddUomComponent,
        AddDepartmentComponent,
        AddExpenseTypeComponent,
        CreateNewProjectCodeComponent,
        AddNewApprovalGroupComponent,
        AttachmentViewComponent,
        ReadMoreTextComponent,
        AdditionalFileUploadComponent,
        TableVendorOverlayComponent,
        TablePaymentsOverlayComponent,
        TablePoReceiptOverlayComponent,
        TableProjectTaskOverlayComponent,
        DecimalNumberDirective,
        BillHeaderSectionComponent,
        TableItemOverlayComponent,
        TableAccountOverlayComponent,
        TableColumnToggleComponent,
        TableColumnFiltersComponent,
        TableHeaderActionButtonsComponent,
        BlockSpace,
        RoleCreateComponent,
        ApprovalGroupCreateComponent,
        WorkFlowSectionComponent,
        TableExpenseOverlayComponent,
        PortalRoleCreateComponent,
        CreateApprovalGroupComponent,
        AutomatedWorkflowPreviewComponent,
        VendorGroupFormComponent,
        TableInlineColumnFiltersComponent,
        TablePaymentTypeOverlayComponent,
        AddVendorUsersComponent,
        DCardCreateComponent,
        VCardEditComponent,
        CountryCodeValidationComponent,
        TableCardsOverlayComponent,
        TabindexMinusOneDirective,
        SkipTabviewDirective,
        MultiselectFocusDirective,
        AdditionalFieldLineItemsComponent,
        AdditionalFieldHeaderItemsComponent,
        NoNegativeValuesDirective,
        LoaderComponent,
        TreeCheckboxComponent,
    ],
    imports: [
        TimelineModule,
        CardModule,
        SidebarModule,
        ButtonModule,
        InputTextareaModule,
        ReactiveFormsModule,
        InputTextModule,
        DropdownModule,
        ToastModule,
        InputSwitchModule,
        CurrencyMaskModule,
        CheckboxModule,
        FormsModule,
        CommonModule,
        OverlayPanelModule,
        MultiSelectModule,
        PasswordModule,
        DividerModule,
        NgxExtendedPdfViewerModule,
        DialogModule,
        TableModule,
        CalendarModule,
        RadioButtonModule,
        InputTextareaModule,
        ChipsModule,
        InputNumberModule,
        LabelModule,
        TooltipModule,
        KeyFilterModule,
        ConfirmDialogModule,
        OrderListModule,
        TreeModule,
        FieldsetModule,
        AccordionModule,
        AutoCompleteModule,
        ListboxModule,
        NgxIntlTelInputModule,
    ]
})
export class CommonImplModule {
}
