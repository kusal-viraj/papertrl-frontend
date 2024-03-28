export class HttpResponseMessage {

  public static VENDOR_REGISTERED_SUCCESSFULLY = 'Your request successfully submitted, you will be notified further via an email upon the approval or rejection.';
  public static VENDOR_ACH_REGISTERED_SUCCESSFULLY = 'We have received your submission, and your ACH information has been updated.';
  public static SESSION_EXPIRED = 'Your access token has expired, please login to continue.';

  public static VENDOR_CREATED_SUCCESSFULLY = 'Vendor created successfully.';
  public static VENDOR_CREATED_AND_INVITATION_SENT_SUCCESSFULLY = 'Vendor created and invitation sent successfully.';
  public static W9_FORM_NOT_FOUND = 'There is no W9 form attached to this vendor.';
  public static VENDOR_APPROVED_SUCCESSFULLY = 'Vendor approved successfully.';
  public static VENDOR_UPDATED_SUCCESSFULLY = 'Vendor updated successfully.';
  public static VENDOR_ACTIVATED_SUCCESSFULLY = 'Vendor activated successfully.';
  public static VENDOR_DELETED_SUCCESSFULLY = 'Vendor deleted successfully.';
  public static VENDOR_INACTIVATED_SUCCESSFULLY = 'Vendor inactivated successfully.';
  public static VENDOR_ADDED_TO_LOCAL_SUCCESSFULLY = 'Vendor successfully added to local list.';
  public static VENDOR_REJECTED_SUCCESSFULLY = 'Vendor rejected successfully.';
  public static USER_CREATED_SUCCESSFULLY = 'User created successfully.';
  public static TENANT_CREATED_SUCCESSFULLY = 'Tenant created successfully.';
  public static TENANT_UPDATED_SUCCESSFULLY = 'Tenant updated successfully.';
  public static TENANT_DELETED_SUCCESSFULLY = 'Tenant deleted successfully.';
  public static EMAIL_SENT_SUCCESSFULLY = 'Email sent successfully.';
  public static VENDOR_CLASSIFICATION_ATTACHMENT_SIZE_EXCEED = 'Only 10 attachments are allowed to upload for vendor classification.';
  public static CAN_NOT_UPDATE_WORKFLOW_PENDING_INVOICES_EXIST = 'Can not change the invoice approval automation, there are pending or rejected invoices.';

  public static EMPLOYEE_CREATED_SUCCESSFULLY = 'Employee created successfully.';

  public static PACKAGE_CREATED_SUCCESSFULLY = 'Package created successfully.';
  public static PACKAGE_CHANGE_APPROVED_SUCCESSFULLY = 'Package approved successfully.';
  public static PACKAGE_CHANGE_REJECTED_SUCCESSFULLY = 'Package change request rejected.';
  public static PACKAGE_CHANGE_REQUEST_SEND_SUCCESSFULLY = 'Request sent successfully, you will be notified upon the acceptance or rejection.';
  public static PACKAGE_CHANGE_REQUEST_DELETED_SUCCESSFULLY = 'Request deleted successfully.';
  public static CLIENT_CREATED_SUCCESSFULLY = 'Client created successfully.';
  public static ATTACHMENT_DELETED_SUCCESSFULLY = 'Attachment deleted successfully.';

  public static TRIAL_REQUEST_APPROVED_SUCCESSFULLY = 'Trial request approved successfully.';
  public static TRIAL_REQUEST_REJECTED_SUCCESSFULLY = 'Trial request rejected.';
  public static TRIAL_REQUEST_REJECTION_COMMENT_IS_REQUIRED = 'Rejection comment is required.';

  public static RECORD_UPDATED_SUCCESSFULLY = 'Record updated successfully.';
  public static RECORD_DELETED_SUCCESSFULLY = 'Record deleted successfully.';
  public static RECORD_INACTIVATED_SUCCESSFULLY = 'Record inactivated successfully.';
  public static RECORD_ACTIVATED_SUCCESSFULLY = 'Record activated successfully.';
  public static RECORD_UNLOCKED_SUCCESSFULLY = 'Record unlocked successfully.';


  public static RECORDS_UPDATED_SUCCESSFULLY = 'Records updated successfully.';
  public static RECORDS_DELETED_SUCCESSFULLY = 'Records deleted successfully.';
  public static RECORDS_INACTIVATED_SUCCESSFULLY = 'Records inactivated successfully.';
  public static RECORDS_ACTIVATED_SUCCESSFULLY = 'Records activated successfully.';
  public static RECORDS_UNLOCKED_SUCCESSFULLY = 'Records unlocked successfully.';

  public static FILE_UPLOADED_SUCCESSFULLY = 'File uploaded successfully.';
  public static FILES_UPLOADED_SUCCESSFULLY = 'File(s) uploaded successfully.';
  public static FILE_UPLOADED_AND_SEND_INVITATION_SUCCESSFULLY = 'File uploaded and invitations sent successfully.';
  public static FILE_UPLOAD_VALID = 'Please attach at least one file to proceed with the upload (Valid types are PDF, JPG, JPEG, PNG).';
  public static FAILED_TO_DOWNLOAD_FILE = 'File download failed.';
  public static FILE_DOWNLOADED_SUCCESSFULLY = 'File downloaded successfully.';
  public static FILE_DOWNLOD_ERROR = 'An error occurred while downloading the file.';
  public static FILE_SIZE_EXCEED = 'The maximum file size supported is 25MB.';
  public static FILE_TYPE_ONLY_CSV = 'Please upload only CSV file type format.';
  public static FILE_LIMIT_ONE = 'Please upload only a single file at a time.';

  public static INVOICE_SUBMITTED_SUCCESSFULLY = 'Invoice created successfully.';
  public static SUBMITTED_SUCCESSFULLY = 'Successfully submitted for approval.';
  public static BILL_UPDATED_SUCCESSFULLY = 'Bill updated successfully.';
  public static INVOICE_APPROVED_SUCCESSFULLY = 'Invoice approved successfully.';
  public static INVOICE_RESUBMITTED_SUCCESSFULLY = 'Invoice submitted successfully.';
  public static INVOICE_REJECTED_SUCCESSFULLY = 'Invoice rejected successfully.';
  public static INVOICE_REASSIGN_SUCCESSFULLY = 'Invoice re-assigned successfully.';
  public static UNDO_SUCCESSFULLY = 'Your previous action on this invoice has been reversed successfully.';
  public static ADMIN_UNDO_SUCCESSFULLY = 'User action reversed successfully.';
  public static INVOICE_APPROVAL_SKIP_SUCCESSFULLY = 'Invoice approval successfully skipped to next level.';
  public static NO_APPSROVED_INVOICEES = 'No approved invoices to be displayed.';


  public static WORKFLOW_SAVED_SUCCESSFULLY = 'Workflow details saved successfully.';
  public static WORKFLOW_UPDATED_SUCCESSFULLY = 'Workflow details updated successfully.';
  public static WORKFLOW_DELETED_SUCCSSFULLY = 'Workflow deleted successfully.';


  // User Specific
  public static PROFILE_UPDATED_SUCCESSFULLY = 'Your profile information updated successfully.';
  public static PASSWORD_CHANGED_SUCCESSFULLY = 'Password changed successfully.';
  public static PASSWORD_RESET_LINK_SEND_SUCCESSFULLY = 'Password reset link successfully sent to your PaperTrl registered email address.';
  public static CURRENT_PASSWORD_MUST_BE_DIFFERENT = 'Current password and new password can not be identical.';

  // User Role------
  public static ROLE_CREATED_SUCCESSFULLY = 'Role created successfully.';
  public static ROLE_UPDATED_SUCCESSFULLY = 'Role updated successfully.';

  public static ROLE_ACTIVATED_SUCCESSFULLY = 'Role activated successfully.';
  public static ROLE_INACTIVATED_SUCCESSFULLY = 'Role inactivated successfully.';
  public static ROLE_DELETED_SUCCESSFULLY = 'Role deleted successfully.';

  public static ROLES_ACTIVATED_SUCCESSFULLY = 'Selected role(s) activated successfully.';
  public static ROLES_INACTIVATED_SUCCESSFULLY = 'Selected role(s) inactivated successfully.';
  public static ROLES_DELETED_SUCCESSFULLY = 'Selected role(s) deleted successfully.';

  public static PLEASE_SELECT_ATLEAST_ONE_PRIVILEGE = 'Please assign at least one privilege.';
  public static PLEASE_SELECT_A_ROLE_NAME = 'Please enter a role name.';
  public static CAN_NOT_DELETE_ROLE_USERS_EXIST = 'Can not deleteExpense the role, there are users already assigned to it.';
  public static CAN_NOT_INACTIVATE_ROLE_USERS_EXIST = 'Can not inactivate the role, there are users already assigned to it.';

  // Date Format Error
  public static INVALID_DATE_FORMAT_ERROR = 'Invalid date format, please select correct date format.';

  public static INTERNET_CONNECTION_ERROR = 'Your internet connection has been interrupted, to continue please refresh the page.';

  public static SYNC_SUCCESSFULLY = 'Sync process completed successfully.';
  public static P_SYNC_SUCCESSFULLY = 'Record started syncing successfully.';
  public static P_RE_SYNC_SUCCESSFULLY = 'The record synchronization process has been successfully started.';
  public static P_BULK_SYNC_SUCCESSFULLY = 'Record(s) started syncing successfully.';
  public static P_BULK_RE_SYNC_SUCCESSFULLY = 'Record(s) started re-syncing successfully.';
  public static SYNC_PRIVILEGES = 'PaperTrl credentials saved successfully.';
  public static AUTO_SYNC_STATUS_CHANGED = 'Auto sync status changed successfully.';

  // Payment Management
  public static PAYMENT_SUBMITTED_SUCCESSFULLY = 'Payment successfully submitted for approval.';
  public static PAYMENT_CREATED_SUCCESSFULLY = 'Payment created successfully.';
  public static PAYMENT_SCHEDULED_SUCCESSFULLY = 'Payment has been scheduled successfully.';
  public static CHECK_MAILED_SUCCESSFULLY = 'Check number successfully mark as mailed.';
  public static CHECK_UPDATED_SUCCESSFULLY = 'Payment details updated successfully.';
  public static PAYMENT_ROVOKE_SUCCESSFULLY = 'Transaction canceled successfully.';
  public static PAYMENTS_ROVOKE_SUCCESSFULLY = 'Transaction(s) canceled successfully.';
  public static PAYMENTS_APPROVED_SUCCESSFULLY = 'Transaction(s) approved successfully.';

  // Vendor Management
  public static VENDOR_INVITATION_SENT_SUCCESSFULLY = 'Vendor invitation sent successfully.';
  public static VENDOR_ACH_REQUEST_SENT_SUCCESSFULLY = 'Request successfully sent.';
  public static VENDOR_INVITATION_DELETED_SUCCESSFULLY = 'Vendor invitation deleted successfully';
  public static VENDOR_INVITATION_RESEND_SUCCESSFULLY = 'Vendor invitation resent successfully';

  public static VENDOR_INVITATIONS_DELETED_SUCCESSFULLY = 'Selected vendor invitations deleted successfully.';
  public static VENDOR_INVITATIONS_RESEND_SUCCESSFULLY = 'Selected vendor invitations resent successfully.';

  public static VENDOR_REQUESTS_DELETED_SUCCESSFULLY = 'Selected request(s) deleted successfully.';
  public static VENDOR_REQUEST_DELETED_SUCCESSFULLY = 'Selected request deleted successfully.';

  public static VEN_ADDED_TO_LOCAL_SUCCESSFULLY = 'Vendor successfully added to local.';
  public static VENS_ADDED_TO_LOCAL_SUCCESSFULLY = 'Selected vendors successfully added to local.';


  public static VENDOR_GROUP_CREATED_SUCCESSFULLY = 'Vendor group created successfully.';
  public static VENDOR_GROUP_DELETED_SUCCESSFULLY = 'Vendor group deleted successfully.';
  public static VENDOR_GROUP_ACTIVATED_SUCCESSFULLY = 'Vendor group activated successfully.';
  public static VENDOR_GROUP_INACTIVATED_SUCCESSFULLY = 'Vendor group inactivated successfully.';
  public static VENDOR_GROUPS_ACTIVATED_SUCCESSFULLY = 'Selected vendor group(s) activated successfully.';
  public static VENDOR_GROUPS_INACTIVATED_SUCCESSFULLY = 'Selected vendor group(s) inactivated successfully.';
  public static VENDOR_GROUPS_DELETED_SUCCESSFULLY = 'Selected vendor group(s) deleted successfully.';
  public static VENDOR_GROUPS_UPDATED_SUCCESSFULLY = 'Vendor group updated successfully.';


  // Approval Level Management
  public static APPROVAL_GROUP_CREATED_SUCCESSFULLY = 'Approval group created successfully.';
  public static APPROVAL_GROUP_DELETED_SUCCESSFULLY = 'Approval group deleted successfully.';
  public static APPROVAL_GROUP_ACTIVATED_SUCCESSFULLY = 'Approval group activated successfully.';
  public static APPORVAL_GROUP_INACTIVATED_SUCCESSFULLY = 'Approval group inactivated successfully.';
  public static APPROVAL_GROUPS_ACTIVATED_SUCCESSFULLY = 'Selected approval group(s) activated successfully.';
  public static APPROVAL_GROUPS_INACTIVATED_SUCCESSFULLY = 'Selected approval group(s) inactivated successfully.';
  public static APPROVAL_GROUPS_DELETED_SUCCESSFULLY = 'Selected approval group(s) deleted successfully.';
  public static APPROVAL_GROUPS_UPDATED_SUCCESSFULLY = 'Approval group updated successfully.';

  //User management
  public static USER_ACTIVATED_SUCCESSFULLY = 'User activated successfully.';
  public static USER_INACTIVATED_SUCCESSFULLY = 'User inactivated successfully.';
  public static USERS_ACTIVATED_SUCCESSFULLY = 'Selected user(s) activated successfully.';
  public static USERS_INACTIVATED_SUCCESSFULLY = 'Selected user(s) inactivated successfully.';
  public static USER_DELETED_SUCCESSFULLY = 'User deleted successfully.';
  public static USERS_DELETED_SUCCESSFULLY = 'Selected user(s) deleted successfully.';
  public static USER_UPDATED_SUCCESSFULLY = 'User details updated successfully.';
  public static USER_UNLOCKED_SUCCESSFULLY = 'User unlocked successfully.';

  // Code Management
  public static CODE_SAVED_SUCCESSFULLY = 'Project created successfully.';
  public static CODE_UPDATED_SUCCESSFULLY = 'Project details updated successfully.';
  public static CODE_ALREADY_EXIST = 'Project details already Exist.';
  public static CODE_INACTIVATED_SUCCESSFULLY = 'Project inactivated successfully.';
  public static CODE_ACTIVATED_SUCCESSFULLY = 'Project activated successfully.';
  public static CODE_DELETED_SUCCESSFULLY = 'Project deleted successfully.';
  public static CODES_ACTIVATED_SUCCESSFULLY = 'Selected projects(s) activated successfully.';
  public static CODES_INACTIVATED_SUCCESSFULLY = 'Selected projects(s) inactivated successfully.';
  public static CODES_DELETED_SUCCESSFULLY = 'Selected projects(s) deleted successfully.';

  // Proposal Management
  public static PROPOSAL_SUBMITTED_SUCCESSFULLY = 'Proposal successfully submitted for approval.';
  public static PROPOSAL_UPDATED_SUCCESSFULLY = 'Proposal updated successfully.';
  public static PROPOSAL_REJECT_SUCCESSFULLY = 'Proposal rejected successfully.';
  public static PROPOSAL_APPROVED_SUCCESSFULLY = 'Proposal approved successfully.';
  public static PROPOSAL_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Proposal assignee changed successfully.';
  public static PROPOSAL_APPROVAL_SKIP_SUCCESSFULLY = 'Proposal approval is successful, skipped to the next level.';

  // Expense Management
  public static EXPENSES_SUBMITTED_SUCCESSFULLY = 'Expense report successfully submitted for approval.';
  public static EXPENSE_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Expense assignee changed successfully.';
  public static EXPENSE_UPDATED_SUCCESSFULLY = 'Expense updated successfully.';
  public static SKIP_APPROVAL_SUCCESSFULLY = 'Expense approval successfully skipped to next level.';
  public static EXPENSE_APPROVED_SUCCESSFULLY = 'Expense approved successfully.';
  public static EXPENSE_REJECTED_SUCCESSFULLY = 'Expense rejected successfully.';
  public static EXPENSE_TYPE_SAVED_SUCCESSFULLY = 'Expense type saved successfully.';
  public static EXPENSES_INSERT_THE_APPROVER_SUCCESSFULLY = 'Expense report successfully submitted for approval.';

  public static CREDIT_CARD_ADDED_SUCCESSFULLY = 'Credit card added successfully.';
  public static CREDIT_CARD_UPDATED_SUCCESSFULLY = 'Credit card updated successfully.';
  public static CREDIT_CARD_DELETED_SUCCESSFULLY = 'Credit card deleted successfully.';
  public static CREDIT_CARD_INACTIVATED_SUCCESSFULLY = 'Credit card inactivated successfully.';
  public static CREDIT_CARD_ACTIVATED_SUCCESSFULLY = 'Credit card activated successfully.';
  public static CREDIT_CARD_BULK_DELETED_SUCCESSFULLY = 'Credit card(s) deleted successfully.';
  public static CREDIT_CARD_BULK_INACTIVATED_SUCCESSFULLY = 'Credit card(s) inactivated successfully.';
  public static CREDIT_CARD_BULK_ACTIVATED_SUCCESSFULLY = 'Credit card(s) activated successfully.';
  public static CREDIT_CARD_TRANSACTIONS_CREATED_AS_BILL = 'Bill created successfully.';


  public static RECEIPT_UPDATED_SUCCESSFULLY = 'Receipt updated successfully.';
  public static RECEIPT_DELETED_SUCCESSFULLY = 'Receipt deleted successfully.';
  public static RECEIPT_BULK_DELETED_SUCCESSFULLY = 'Receipt(s) deleted successfully.';
  public static DRAFTED_RECEIPT_CANNOT_BE_DOWNLOAD = 'Drafted Receipt(s) cannot be downloaded.';
  public static DRAFTED_RECEIPT_CANNOT_BE_EXPORTED = 'Drafted Receipt(s) cannot be exported.';

  public static CREDIT_CARD_TRANSACTION_ADDED_SUCCESSFULLY = 'Transaction added successfully.';
  public static CREDIT_CARD_MISSING_RECEIPT_UPDATED_SUCCESSFULLY = 'Missing receipt saved successfully.';

  public static CREDIT_CARD_STATEMENT_APPROVED_SUCCESSFULLY = 'Transaction approved successfully.';
  public static CREDIT_CARD_STATEMENT_BULK_APPROVED_SUCCESSFULLY = 'Transaction(s) approved successfully.';
  public static CREDIT_CARD_STATEMENT_SKIPPED_SUCCESSFULLY = 'Transaction approval successfully skipped to next level.';
  public static CREDIT_CARD_STATEMENT_REJECT_SUCCESSFULLY = 'Transaction rejected successfully.';
  public static CREDIT_CARD_STATEMENT_BULK_REJECT_SUCCESSFULLY = 'Transaction(s) rejected successfully.';

  public static CREDIT_CARD_ASSIGNEE_CHANGED_SUCCESSFULLY = 'Employee changed successfully.';

  public static CREDIT_CARD_SUBMIT_TRANSACTION_SUCCESSFULLY = 'Transaction(s) submitted successfully.';
  public static CREDIT_CARD_SAVE_AS_APPROVED_TRANSACTION_SUCCESSFULLY = 'Transaction(s) successfully save as approved.';
  public static CREDIT_CARD_TRANSACTIONS_CREATED_SUCCESSFULLY = 'Credit card transaction(s) created successfully.';
  public static CREDIT_CARD_RECEIPT_DELETED_SUCCESSFULLY = 'Receipt deleted successfully.';

  public static CREDIT_CARD_TRANSACTION_SPLITTED_SUCCESSFULLY = 'Transaction has been split successfully.';
  public static CREDIT_CARD_TRANSACTION_REVOKED_SUCCESSFULLY = 'Split transaction has been removed successfully.';
  public static CREDIT_CARD_TRANSACTION_DELETED_SUCCESSFULLY = 'Transaction deleted successfully.';
  public static CREDIT_CARD_TRANSACTIONS_DELETED_SUCCESSFULLY = 'Transaction(s) deleted successfully.';
  public static CREDIT_CARD_STATEMENT_DELETED_SUCCESSFULLY = 'Statement deleted successfully.';

  // Opportunity Management
  public static OPPORTUNITY_SUBMITTED_SUCCESSFULLY = 'Opportunity successfully submitted for approval.';
  public static OPPORTUNITY_UPDATED_SUCCESSFULLY = 'Opportunity updated successfully.';
  public static OPPORTUNITY_REJECTED_SUCCESSFULLY = 'Opportunity rejected successfully.';
  public static OPPORTUNITY_APPROVED_SUCCESSFULLY = 'Opportunity approved successfully.';
  public static OPPORTUNITY_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Opportunity assignee changed successfully.';
  public static OPPORTUNITY_SKIP_APPROVAL_SUCCESSFULLY = 'Opportunity approval successfully skipped to next level.';

  // Project Management
  public static PROJECT_SUBMITTED_SUCCESSFULLY = 'Project successfully submitted for approval.';
  public static PROJECT_UPDATED_SUCCESSFULLY = 'Project updated successfully.';
  public static PROJECT_APPROVED_SUCCESSFULLY = 'Project approved successfully.';
  public static PROJECT_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Project assignee changed successfully.';
  public static PROJECT_APPROVAL_SKIP_SUCCESSFULLY = 'Project approval successfully skipped to next level.';
  public static PROJECT_RESUBMITTED_SUCCESSFULLY = 'Project resubmitted successfully.';
  public static PROJECT_REJECT_SUCCESSFULLY = 'Project rejected successfully.';


  public static PO_CREATED_SUCCESSFULLY = 'Purchase order successfully submitted for approval.';
  public static PO_UPDATED_SUCCESSFULLY = 'Purchase order updated successfully.';
  public static PO_REJECT_SUCCESSFULLY = 'Purchase order(s) reject successfully.';
  public static PO_APPROVED_SUCCESSFULLY = 'Purchase order approved successfully.';
  public static POS_APPROVED_SUCCESSFULLY = 'Purchase order(s) approved successfully.';
  public static PO_DELETED_SUCCESSFULLY = 'Purchase order(s) deleted successfully.';
  public static PO_STATUS_UPDATE_SUCCESSFULLY = 'Purchase order status update successfully.';
  public static PO_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Purchase order assignee changed successfully.';
  public static PO_SKIP_APPROVAL_SUCCESSFULLY = 'Purchase order approval successfully skipped to next level.';
  public static PO_RESUBMITTED_SUCCESSFULLY = 'Purchase order resubmitted successfully.';
  public static PO_SEND_TO_VENDOR_SUCCESSFULLY = 'Purchase order sent to vendor approval successfully.';
  public static POS_SEND_TO_VENDOR_SUCCESSFULLY = 'Purchase order(s) sent to vendor approval successfully.';
  public static PO_ATTACHMENT_SEND_SUCCESSFULLY = 'Purchase Order attachment sent successfully';
  public static PO_ATTACHMENTS_SEND_SUCCESSFULLY = 'Purchase Order attachment(s) sent successfully';
  public static PO_ITEM_ALREADY_RECEIVED = 'PO have already been assigned with maximum number of GRN(S).';
  public static PO_UNDO_APPROVAL_SUCCESSFULLY = 'Your previous action on this purchase order has been reversed successfully.';
  public static PO_CLOSED_SUCCESSFULLY = 'Purchase Order closed successfully.';
  public static PO_OPEN_SUCCESSFULLY = 'Purchase Order reopened successfully.';
  public static POS_CLOSED_SUCCESSFULLY = 'Purchase Order(s) closed successfully.';
  public static POS_OPEN_SUCCESSFULLY = 'Purchase Order(s) reopened successfully.';
  public static DRAFTED_PO_CANNOT_BE_DOWNLOAD = 'Drafted Purchase Order(s) cannot be downloaded.';
  public static DRAFTED_PO_CANNOT_BE_EXPORTED = 'Drafted Purchase Order(s) cannot be exported.';
  public static SELECTED_PO_EXPORTED_SUCCESSFULLY = 'Selected Purchase Order(s) exported successfully.';
  public static ALL_PO_EXPORTED_SUCCESSFULLY = 'All Purchase Orders exported successfully.';
  public static SINGLE_PO_EXPORTED_SUCCESSFULLY = 'Purchase Order exported successfully.'


  public static PO_RECEIPT_CREATED_SUCCESSFULLY = 'Receipt created successfully.';
  public static PO_RECEIPT_UPDATED_SUCCESSFULLY = 'Receipt updated successfully.';
  public static PO_RECEIPT_DELETED_SUCCESSFULLY = 'Receipt deleted successfully.';
  public static PO_RECEIPT_ATTACHMENT_DELETED_SUCCESSFULLY = 'Attachment deleted successfully.';
  public static PO_RECEIPT_CLOSED_SUCCESSFULLY = 'Receipt closed successfully.';
  public static PO_RECEIPT_OPEN_SUCCESSFULLY = 'Receipt Reopened successfully.';
  public static PO_RECEIPTS_CLOSED_SUCCESSFULLY = 'Receipt(s) closed successfully.';
  public static PO_RECEIPTS_OPEN_SUCCESSFULLY = 'Receipt(s) reopened successfully.';
  public static PO_RECEIPTS_DELETED_SUCCESSFULLY = 'Receipt(s) deleted successfully.';
  public static SELECTED_PO_RECEIPTS_EXPORTED_SUCCESSFULLY = 'Selected Receipt(s) exported successfully.';
  public static ALL_PO_RECEIPTS_EXPORTED_SUCCESSFULLY = 'All Receipts exported successfully.';
  public static SINGLE_RECEIPTS_EXPORTED_SUCCESSFULLY = 'Receipt exported successfully.'

  //common
  public static CLOSED_SELECTED_PO = 'Selected PO has been already closed.';
  public static NO_REMAINING_DETAILS_FOR_SELECTED_PO = 'The selected PO contains no Items and Accounts.';
  public static NO_ITEM_DETAILS = 'The selected PO contains no Items.';

  public static NO_ITEMS_REMAINING_TO_GENERATE_PO_RECEIPT = 'Unable to generate PO receipt. No items remaining.';


  public static TASK_CREATED_SUCCESSFULLY = 'Task created successfully.';

  // ADDITIONAL FIELD
  public static ADDITIONAL_FIELD_CREATED_SUCCESSFULLY = 'Additional field created successfully.';
  public static DROPDOWN_FIELD_CREATED_SUCCESSFULLY = 'Data source created successfully.';
  public static ADDITIONAL_FIELD_UPDATED_SUCCESSFULLY = 'Additional field updated successfully.';
  public static DOCUMENT_ATTACHED_TO_FIELD_SUCCESSFULLY = 'Action completed successfully.';
  public static ADDITIONAL_FIELD_DELETED_SUCCESSFULLY = 'Additional field deleted successfully.';
  public static BULK_FIELD_INACTIVATED_SUCCESSFULLY = 'Field(s) inactivated successfully.';
  public static BULK_FIELD_ACTIVATED_SUCCESSFULLY = 'Field(s) activated successfully.';
  public static FIELD_INACTIVATED_SUCCESSFULLY = 'Field inactivated successfully.';
  public static FIELD_ACTIVATED_SUCCESSFULLY = 'Field activated successfully.';
  public static DROPDOWN_OPTION_CREATED_SUCCESSFULLY = 'Dropdown option created successfully.';
  public static OPTION_USED = 'This option is already in use.';

  // INTEGRATION MANAGEMENT
  public static SYSTEM_AUTHENTICATION_SAVED_SUCCESSFULLY = 'System authentication saved successfully.';
  public static SYSTEM_ENDPOINT_INFORMATION_SAVED_SUCCESSFULLY = 'Endpoint information saved successfully.';
  public static INTEGRATION_SYSTEM_CREATED_SUCCESSFULLY = 'Integration system created successfully.';
  public static INTEGRATION_SYSTEM_UPDATED_SUCCESSFULLY = 'Integration system updated successfully.';
  public static INTEGRATION_CONFIG_CREATED_SUCCESSFULLY = 'Integration configuration created successfully.';
  public static INTEGRATION_CONFIG_UPDATED_SUCCESSFULLY = 'Integration configuration updated successfully.';
  public static INTEGRATION_SYSTEM_DELETED_SUCCESSFULLY = 'Integration system deleted successfully.';
  public static INTEGRATION_CONGIG_DELETED_SUCCESSFULLY = 'Integration configuration deleted successfully.';
  public static SYNC_PROPERTY_CHANGED_SUCCESSFULLY = 'Sync property changed successfully.';

  // PACKAGE CHANGE
  public static CONVERT_TO_PORTAL_SUCCESSFULLY_DONE = 'This account has been successfully converted to an agency portal, you will receive an email with the URL to access agency portal.';

  // VENDOR REQUEST
  public static VEN_REQUEST_SUCCESSFULLY_APPROVED = 'Request approved successfully.';
  public static VEN_REQUEST_SUCCESSFULLY_REJECTED = 'Request rejected successfully.';
  public static VEN_REQUEST_SUCCESSFULLY_DELETED = 'Request deleted successfully.';

  public static VEN_REQUESTS_SUCCESSFULLY_APPROVED = 'Selected requests approved successfully.';
  public static VEN_REQUESTS_SUCCESSFULLY_REJECTED = 'Selected requests rejected successfully.';
  public static VEN_REQUESTS_SUCCESSFULLY_DELETED = 'Selected requests deleted successfully.';

  public static CUSTOMER_REQUESTS_DELETED_SUCCESSFULLY = 'Selected request(s) deleted successfully.';
  public static CUSTOMER_REQUESTS_RESENT_SUCCESSFULLY = 'Selected request(s) resent successfully.';
  public static CUSTOMER_REQUEST_DELETED_SUCCESSFULLY = 'Request deleted successfully.';
  public static CUSTOMER_REQUEST_RESENT_SUCCESSFULLY = 'Request resent successfully.';
  public static CUSTOMER_REQUEST_SENT_SUCCESSFULLY = 'Customer request sent successfully.';

  // Virtual Card Management
  public static CARD_UPDATED_SUCCESSFULLY = 'Card updated successfully.';
  public static CARD_CANCELED_SUCCESSFULLY = 'Card canceled successfully.';
  public static CARD_ACTIVATED_SUCCESSFULLY = 'Digital Card activated successfully.';
  public static CARD_INACTIVATED_SUCCESSFULLY = 'Digital Card inactivated successfully.';
  public static DIGITAL_CARD_ADDED_SUCCESSFULLY = 'Digital Card added successfully.';
  public static CARD_TO_UP_SUCCESSFULLY = 'Card top-up has been completed successfully.';

  // Account Management
  public static ACCOUNT_UPDATED_SUCCESSFULLY = 'Account updated successfully.';
  public static ACCOUNT_SAVED_SUCCESSFULLY = 'Account saved successfully.';
  public static ACCOUNT_CREATED_SUCCESSFULLY = 'Account created successfully.';
  public static ACCOUNT_DELETED_SUCCESSFULLY = 'Account deleted successfully.';
  public static ACCOUNT_ACTIVATED_SUCCESSFULLY = 'Account activated successfully.';
  public static ACCOUNT_INACTIVATED_SUCCESSFULLY = 'Account inactivated successfully.';
  public static ACCOUNTS_ACTIVATED_SUCCESSFULLY = 'Selected account(s) activated successfully.';
  public static ACCOUNTS_INACTIVATED_SUCCESSFULLY = 'Selected account(s) inactivated successfully.';
  public static ACCOUNTS_DELETED_SUCCESSFULLY = 'Selected account(s) deleted successfully.';

  // Item Management
  public static ITEM_CREATED_SUCCESSFULLY = 'Item created successfully.';
  public static ITEM_UPDATED_SUCCESSFULLY = 'Item updated successfully.';
  public static ITEM_DELETED_SUCCESSFULLY = 'Item deleted successfully.';
  public static ITEM_ACTIVATED_SUCCESSFULLY = 'Item activated successfully.';
  public static ITEM_INACTIVATED_SUCCESSFULLY = 'Item inactivated successfully.';
  public static ITEMS_ACTIVATED_SUCCESSFULLY = 'Selected item(s) activated successfully.';
  public static ITEMS_INACTIVATED_SUCCESSFULLY = 'Selected item(s) inactivated successfully.';
  public static ITEMS_DELETED_SUCCESSFULLY = 'Selected item(s) deleted successfully.';
  public static VENDOR_ITEM_MAPPED_SUCCESSFULLY = 'Selected item updated successfully.';
  public static VENDOR_ITEM_SELECTION_IS_INVALID = 'Please make sure to select at least one item to update.';

  // OCR Template
  public static TEMPLATE_CREATED_SUCCESSFULLY = 'Template created successfully.';
  public static TEMPLATE_UPDATED_SUCCESSFULLY = 'Template updated successfully.';
  public static TEMPLATE_DELETED_SUCCESSFULLY = 'Template deleted successfully.';
  public static TEMPLATE_ACTIVATED_SUCCESSFULLY = 'Template activated successfully.';
  public static TEMPLATE_INACTIVATED_SUCCESSFULLY = 'Template inactivated successfully.';
  public static TEMPLATES_ACTIVATED_SUCCESSFULLY = 'Selected template(s) activated successfully.';
  public static TEMPLATES_INACTIVATED_SUCCESSFULLY = 'Selected template(s) inactivated successfully.';
  public static TEMPLATES_DELETED_SUCCESSFULLY = 'Selected template(s) deleted successfully.';

  // Invoice Approval Screen Go Back
  public static YOU_HAVE_NOT_INVOICE_TO_APPROVAL = 'Congratulations!! You have no pending invoices left.';

  // sync dashboard
  public static SELECTED_ITEM_SUCCESSFULLY_SENT_TO_PROCESSING_QUEUE = 'Selected item(s) successfully sent to processing queue.';
  public static ITEM_SUCCESSFULLY_SENT_TO_PROCESSING_QUEUE = 'Item successfully sent to processing queue.';

  // tag invoice with payment
  public static INVOICE_TAGGED_SUCCESSFULLY = 'Payment tagged to invoice successfully.';


  // SUB ACCOUNT MANAGEMENT
  public static SUB_ACCOUNT_CREATED_SUCCESSFULLY = 'Sub account created successfully.';

  // Department Management
  public static DEPARTMENT_CREATED_SUCCESSFULLY = 'Department created successfully.';
  public static DEPARTMENT_UPDATED_SUCCESSFULLY = 'Department updated successfully.';
  public static DEPARTMENT_DELETED_SUCCESSFULLY = 'Department deleted successfully.';
  public static DEPARTMENT_ACTIVATED_SUCCESSFULLY = 'Department activated successfully.';
  public static DEPARTMENT_INACTIVATED_SUCCESSFULLY = 'Department inactivated successfully.';
  public static DEPARTMENTS_ACTIVATED_SUCCESSFULLY = 'Selected department(s) activated successfully.';
  public static DEPARTMENTS_INACTIVATED_SUCCESSFULLY = 'Selected department(s) inactivated successfully.';
  public static DEPARTMENTS_DELETED_SUCCESSFULLY = 'Selected department(s) deleted successfully.';

  public static REMINDER_CREATED_SUCCESSFULLY = 'Reminder created successfully.';
  public static REMINDER_UPDATED_SUCCESSFULLY = 'Reminder updated successfully.';
  public static REMINDER_DELETED_SUCCESSFULLY = 'Reminder deleted successfully.';
  public static REMINDER_INACTIVATED_SUCCESSFULLY = 'Reminder inactivated successfully.';
  public static REMINDER_ACTIVATED_SUCCESSFULLY = 'Reminder activated successfully.';
  public static REMINDER_BULK_DELETED_SUCCESSFULLY = 'Reminder(s) deleted successfully.';
  public static REMINDER_BULK_INACTIVATED_SUCCESSFULLY = 'Reminder(s) inactivated successfully.';
  public static REMINDER_BULK_ACTIVATED_SUCCESSFULLY = 'Reminder(s) activated successfully.';

  public static UOM_CREATED_SUCCESSFULLY = 'UOM created successfully.';
  public static EXPENSE_TYPE_CREATED_SUCCESSFULLY = 'Expense type created successfully.';

  // Category Management

  public static CATEGORY_CREATED_SUCCESSFULLY = 'Category created successfully.';

  // Bill already deleted from notification
  public static BILL_DELETED_ALREADY = 'The requested bill cannot be found as it\'s already been deleted.';

  // Payment already deleted from notification
  public static PAYMENT_DELETED_ALREADY = 'The requested payment cannot be found as it\'s already been deleted.';

  // Bill already deleted from notification
  public static INVOICE_DELETED_ALREADY = 'The requested invoice cannot be found as it\'s already been deleted.';

  // PO already deleted from notification
  public static PO_DELETED_ALREADY = 'The requested purchase order cannot be found as it\'s already been deleted.';

  // Expense already deleted from notification
  public static EXPENSE_DELETED_ALREADY = 'The requested expense cannot be found as it\'s already been deleted.';

  // Expense already deleted from notification
  public static CREDIT_CARD_DELETED_ALREADY = 'The requested credit card cannot be found as it\'s already been' +
    ' deleted.';

  // Bill in submission from notification
  public static BILL_IN_SUBMISSION = 'The status of the bill you requested was reverted to Submission state.';

  // Bill already deleted from notification
  public static CREDIT_NOTE_DELETED_ALREADY = 'The requested credit note cannot be found as it\'s already been deleted.';


  // Bill
  public static BILL_DELETED_SUCCESSFULLY = 'Bill deleted successfully.';
  public static INVOICE_DELETED_SUCCESSFULLY = 'Invoice deleted successfully.';
  public static BILLS_DELETED_SUCCESSFULLY = 'Selected bill(s) deleted successfully.';
  public static INVOICES_DELETED_SUCCESSFULLY = 'Selected invoice(s) deleted successfully.';
  public static BILLS_REJECTED_SUCCESSFULLY = 'Selected bill(s) rejected successfully.';
  public static INVOICES_REJECTED_SUCCESSFULLY = 'Selected invoice(s) rejected successfully.';
  public static BILLS_APPROVED_SUCCESSFULLY = 'Selected bill(s) approved successfully.';
  public static BILLS_DOWNLODED_SUCCESSFULLY = 'Selected bill(s) downloaded successfully.';
  public static BILLS_DETAILED_REPORT_DOWNLOAD_SUCCESSFULLY = 'Downloaded successfully.';
  public static DRAFTED_BILL_CANNOT_BE_EXPORTED = 'Drafted Bill(s) cannot be exported.';
  public static DRAFTED_BILL_CANNOT_BE_DOWNLOADED = 'Drafted Bill(s) cannot be downloaded.';
  public static INVOICES_DOWNLODED_SUCCESSFULLY = 'Selected invoice(s) downloaded successfully.';
  public static ALL_BILLS_DOWNLODED_SUCCESSFULLY = 'All bills downloaded successfully.';
  public static ALL_INVOICES_DOWNLODED_SUCCESSFULLY = 'All invoices downloaded successfully.';
  public static BILL_SAVE_AS_APPROVED_SUCCESSFULLY = 'Bill successfully save as approved.';
  public static BILL_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Assignee changed successfully.';
  public static BILLS_EXPORTED_SUCCESSFULLY = 'Selected bill(s) exported successfully.';
  public static INVOICES_EXPORTED_SUCCESSFULLY = 'Selected invoice(s) exported successfully.';
  public static SINGEL_BILL_EXPORTED_SUCCESSFULLY = 'Bill exported successfully.';
  public static VENDOR_EXPORTED_SUCCESSFULLY = 'Vendor Details Exported Successfully.';
  public static SINGEL_INVOICE_EXPORTED_SUCCESSFULLY = 'Invoice exported successfully.';
  public static ALL_BILLS_EXPORTED_SUCCESSFULLY = 'All bills exported successfully.';
  public static ALL_INVOICES_EXPORTED_SUCCESSFULLY = 'All invoice(s) exported successfully.';
  public static BILLS_SKIPPED_SUCCESSFULLY = 'Bill approval successfully skipped to next level.';
  public static BILL_INACTIVATED_SUCCESSFULLY = 'Bill inactivated successfully.';
  public static BILLS_INACTIVATED_SUCCESSFULLY = 'Bill(s) inactivated successfully.';
  public static BILL_ACTIVATED_SUCCESSFULLY = 'Bill activated successfully.';
  public static BILLS_ACTIVATED_SUCCESSFULLY = 'Bill(s) activated successfully.';
  public static BILL_ATTACHMENT_DELETED_SUCCESSFULLY = 'Attachment deleted successfully.';
  public static BILL_DETAILS_EDIT_AND_RESUBMITTED_SUCCESSFULLY = 'Bill details edit and resubmitted successfully.';
  public static BILL_UNDO_APPROVAL_SUCCESSFULLY = 'Your previous action on this bill has been reversed successfully.';
  public static BILL_UNDO_REJECTION_SUCCESSFULLY = 'Your previous action on this bill has been reversed successfully.';
  public static ADD_TO_ITEM_FROM_PO = 'Please select at least one Item or Account.';
  public static BILLS_PAYMENT_PROCESS_SUCCESSFULLY = 'Selected bill(s) payment status updated successfully.';
  public static BILL_PAYMENT_PROCESS_SUCCESSFULLY = 'Payment status updated successfully.';

  // Template
  public static BILL_TEMPLATE_CREATED_SUCCESSFULLY = 'Bill template created successfully.';
  public static BILL_TEMPLATE_UPDATED_SUCCESSFULLY = 'Bill template updated successfully.';

  // Recurring Bill
  public static RECURRING_BILL_CREATED_SUCCESSFULLY = 'Recurring bill template created successfully.';
  public static RECURRING_BILL_UPDATED_SUCCESSFULLY = 'Recurring bill template updated successfully.';
  public static RECURRING_BILL_ACTIVATED_SUCCESSFULLY = 'Recurring bill template activated successfully.';
  public static RECURRING_BILL_INACTIVATED_SUCCESSFULLY = 'Recurring bill template inactivated successfully.';
  public static RECURRING_BILL_DELETED_SUCCESSFULLY = 'Recurring bill template deleted successfully.';
  public static RECURRING_BILLS_ACTIVATED_SUCCESSFULLY = 'Recurring bill template(s) activated successfully.';
  public static RECURRING_BILLS_INACTIVATED_SUCCESSFULLY = 'Recurring bill template(s) inactivated successfully.';
  public static RECURRING_BILLS_DELETED_SUCCESSFULLY = 'Recurring bill template(s) deleted successfully.';

  // Recurring INVOICE
  public static RECURRING_INVOICE_CREATED_SUCCESSFULLY = 'Recurring invoice template created successfully.';
  public static RECURRING_INVOICE_UPDATED_SUCCESSFULLY = 'Recurring invoice template updated successfully.';
  public static RECURRING_INVOICE_ACTIVATED_SUCCESSFULLY = 'Recurring invoice template activated successfully.';
  public static RECURRING_INVOICE_INACTIVATED_SUCCESSFULLY = 'Recurring invoice template inactivated successfully.'
  public static RECURRING_INVOICE_DELETED_SUCCESSFULLY = 'Recurring invoice template deleted successfully.';
  public static RECURRING_INVOICES_ACTIVATED_SUCCESSFULLY = 'Recurring invoice template(s) activated successfully.'
  public static RECURRING_INVOICES_INACTIVATED_SUCCESSFULLY = 'Recurring invoice template(s) inactivated successfully.'
  public static RECURRING_INVOICES_DELETED_SUCCESSFULLY = 'Recurring invoice template(s) deleted successfully.';

  // Automation
  public static AUTOMATION_UPDATED_SUCCESSFULLY = 'Automation updated successfully.';
  public static AUTOMATION_SAVED_SUCCESSFULLY = 'Automation saved successfully.';
  public static AUTOMATION_CREATED_SUCCESSFULLY = 'Automation created successfully.';
  public static AUTOMATION_DELETED_SUCCESSFULLY = 'Automation deleted successfully.';
  public static AUTOMATION_ACTIVATED_SUCCESSFULLY = 'Automation activated successfully.';
  public static AUTOMATION_INACTIVATED_SUCCESSFULLY = 'Automation inactivated successfully.';
  public static AUTOMATIONS_ACTIVATED_SUCCESSFULLY = 'Selected automation(s) activated successfully.';
  public static AUTOMATIONS_INACTIVATED_SUCCESSFULLY = 'Selected automation(s) inactivated successfully.';
  public static AUTOMATIONS_DELETED_SUCCESSFULLY = 'Selected automation(s) deleted successfully.';

  //Expense
  public static EXPENSE_DELETED_SUCCESSFULLY = 'Expense deleted successfully.';
  public static EXPENSE_CREATED_SUCCESSFULLY = 'Expense created successfully.';
  public static EXPENSES_DELETED_SUCCESSFULLY = 'Selected record(s) deleted successfully.';
  public static EXPENSES_REJECTED_SUCCESSFULLY = 'Selected expense(s) rejected successfully.';
  public static EXPENSES_APPROVED_SUCCESSFULLY = 'Selected expense(s) approved successfully.';
  public static EXPENSES_DOWNLODED_SUCCESSFULLY = 'Selected expense(s) downloaded successfully.';
  public static EXPENSE_ATTACHMENT_DELETED_SUCCESSFULLY = 'Attachment deleted successfully.';
  public static EXPENSE_SAVE_AS_APPROVED_SUCCESSFULLY = 'Expense successfully save as approved.';

  //Customer Invoice

  public static CUSTOMER_INVOICE_DELETED_SUCCESSFULLY = 'Invoice deleted successfully.';
  public static CUSTOMER_INVOICE_CREATED_SUCCESSFULLY = 'Invoice created successfully.';
  public static CUSTOMER_INVOICE_UPDATED_SUCCESSFULLY = 'Invoice updated successfully.';
  public static MARK_CUSTOMER_INVOICE_AS_PAID_SUCCESSFULLY = 'Invoice successfully mark as paid.';
  public static MARK_CUSTOMER_INVOICE_AS_UNPAID_SUCCESSFULLY = 'Invoice successfully mark as unpaid.';
  public static ALL_C_INVOICES_EXPORTED_SUCCESSFULLY = 'All invoices exported successfully.';
  public static SELECTED_C_INVOICES_EXPORTED_SUCCESSFULLY = 'Selected invoice(s) exported successfully.';
  public static SELECTED_C_INVOICES_DELETED_SUCCESSFULLY = 'Selected invoice(s) deleted successfully.';


  // public static EXPENSE_APPROVED_SUCCESSFULLY = 'Expense approved successfully';
  public static ALL_EXPENSES_DOWNLOADED_SUCCESSFULLY = 'All expenses downloaded successfully.';
  public static SINGEL_EXPENSE_EXPORTED_SUCCESSFULLY = 'Expense exported successfully.';
  public static SELECTED_EXPENSE_DOWNLOADED_SUCCESSFULLY = 'Selected expense(s) downloaded successfully.';
  public static ALL_EXPENSES_EXPORTED_SUCCESSFULLY = 'All expenses exported successfully.';
  public static DRAFTED_EXPENSE_CANNOT_BE_DOWNLOAD = 'Drafted Expense(s) cannot be downloaded.';
  public static DRAFTED_EXPENSE_CANNOT_BE_EXPORTED = 'Drafted Expense(s) cannot be exported.';
  public static SELECTED_EXPENSE_EXPORTED_SUCCESSFULLY = 'Selected expense(s) exported successfully.';
  public static EXPENSE_SKIPPED_SUCCESSFULLY = 'Expense approval successfully skipped to next level.';
  public static EXPENSE_UNDO_APPROVAL_SUCCESSFULLY = 'Your previous action on this expense has been reversed successfully.';

  //draft related messages
  public static DRAFT_SAVED_SUCCESSFULLY = 'Draft saved successfully.'
  public static DRAFT_UPDATED_SUCCESSFULLY = 'Draft updated successfully.'
  public static DRAFT_DISCARDED_SUCCESSFULLY = 'Draft deleted successfully.'


  //company profile
  public static COMPANY_PROFILE_UPDATED_SUCCESSFULLY = 'Company profile updated successfully.';

  //Bill Payments

  public static BILL_PAYMENTS_EXPORTED_SUCCESSFULLY = 'Selected transaction(s) exported successfully.';
  public static PAYMENTS_EXPORTED_SUCCESSFULLY = 'Transaction exported successfully.';
  public static ALL_BILL_PAYMENTS_EXPORTED_SUCCESSFULLY = 'All transactions exported successfully.';
  public static CONFIGURATIONS_UPDATED = 'Field configuration updated successfully.';


  // po number format configuration

  public static PO_NUMBER_FORMAT_SAVED_SUCCESSFULLY = 'Purchase order number format saved successfully.';
  public static PO_NUMBER_FORMAT_EDITED_SUCCESSFULLY = 'Purchase order number format updated successfully.';
  public static PO_NUMBER_FORMAT_DELETED_SUCCESSFULLY = 'Purchase order number format deleted successfully.';

  // Payment Type Configuration Support
  public static PAYMENT_TYPE_CREATED_SUCCESSFULLY = 'Payment type created successfully.';
  public static PAYMENT_TYPE_UPDATED_SUCCESSFULLY = 'Payment type details updates successfully.';
  public static PAYMENT_TYPE_ACTIVATED_SUCCESSFULLY = 'Payment type activated successfully.';
  public static PAYMENT_PROVIDER_ACTIVATED_SUCCESSFULLY = 'Payment provider activated successfully.';
  public static PAYMENT_TYPE_INACTIVATED_SUCCESSFULLY = 'Payment type inactivated successfully.';
  public static PAYMENT_PROVIDER_INACTIVATED_SUCCESSFULLY = 'Payment provider inactivated successfully.';
  public static PAYMENT_PROVIDER_UPDATED_SUCCESSFULLY = 'Payment provider details updates successfully.';
  public static PAYMENT_PROVIDER_CREATED_SUCCESSFULLY = 'Payment provider created successfully.';
  public static FORBIDDEN_MESSAGE = 'Your request has been blocked due to security reasons.';
  public static NO_INTERNET = 'Please check your internet connection and try again.';

  // payment provider configuration
  public static PAYMENT_PROVIDER_CONFIG_SUCCESSFULLY = 'Payment configuration saved successfully.';
  public static PAYMENT_TYPE_PROVIDER_CONFIG_SUCCESSFULLY = 'Payment Type Configured Successfully.';
  public static PAYMENT_SUBMIT_FOR_APPROVAL_SUCCESSFULLY = 'Payment submit for approval successfully.';
  public static PAYMENT_SAVE_AS_APPROVED_SUCCESSFULLY = 'We have submitted a request to your bank to transfer the necessary funds ' +
    'to your holding account to make these payments. The funds will be available in approximately 3 ' +
    'to 5 business days, at which time the payments will be automatically created.';
  public static PAYMENT_PROVIDER_CONFIGURATION_MESSAGE = 'Your request was successfully submitted. The support team will contact you soon.';
  public static PAYMENT_APPROVED_SUCCESSFULLY = 'Transaction approved successfully.';
  public static PAYMENT_REJECTED_SUCCESSFULLY = 'Transaction rejected successfully.';
  public static TRANSACTION_SCHEDULED_SUCCESSFULLY = 'Transaction successfully schedule.';

  //INBOX
  public static WANT_TO_DELETE_SELECTED_EMAIL = 'You want to delete the selected email(s).'
  public static WANT_TO_DELETE_SELECTED_ATTACHMENT = 'You want to delete the selected attachment.'
  public static ACTION_COMPLETED_SUCCESSFULLY = 'Action completed successfully.';
  public static ATTACHED_TO_DOCUMENT_SUCCESSFULLY = 'Document has been successfully attached.';
  public static CUSTOMER_EMAIL_ADDRESS_COPIED_SUCCESSFULLY = 'Copied!';
  public static ATTACHMENT_SEGREGATED_SUCCESSFULLY = 'Attachment segregated successfully.';
  public static SEND_REQUEST_TO_EDIT_EMAIL_SUCCESSFULLY = 'The change request sent successfully. The support team will contact you shortly.'

  //PO price variance

  public static PO_PRICE_VARIANCE_SAVED_SUCCESSFULLY = 'Allowance saved successfully.';
  public static PO_PRICE_VARIANCE_UPDATED_SUCCESSFULLY = 'Allowance updated successfully.';
  public static PO_PRICE_VARIANCE_DELETED_SUCCESSFULLY = 'Allowance deleted successfully.';

  public static OFFLINE_PAYMENT_MAX_SELECTED = 'Cannot make payments for more than 100 bills at once.';

  //mileage rate configuration
  public static MILEAGE_RATE_SAVED_SUCCESSFULLY = 'Mileage Rate saved successfully.'


  //Credit Note Notifications
  public static CREDIT_NOTE_CREATED_SUCCESSFULLY = 'Credit Note created successfully.';
  public static CREDIT_NOTE_UPDATED_SUCCESSFULLY = 'Credit Note updated successfully.';
  public static CREDIT_NOTE_DELETED_SUCCESSFULLY = 'Credit Note deleted successfully.';
  public static CREDIT_NOTE_CANCELED_SUCCESSFULLY = 'Credit Note canceled successfully.';
  public static CREDIT_AMOUNT_APPLIED_TO_BILL_SUCCESSFULLY = 'Credit Note applied to bill(s) successfully.';
  public static APPLIED_CREDIT_NOTE_SUCCESSFULLY = 'Selected Credit Note(s) applied successfully.';
  public static BILL_REMOVE_SUCCESSFULLY = 'Bill removed successfully.';
  public static NO_ATTACHED_BILL = 'There is no attached bill(s) for the selected credit note.';
  public static CREDIT_NOTE_SEND_TO_CUSTOMER_SUCCESSFULLY = 'Credit Note sent to customer successfully.';
  public static CREDIT_NOTE_SAVE_DRAFT_SUCCESSFULLY = 'Credit Note saved as draft successfully.';
  public static DRAFTED_CREDIT_NOTE_CANNOT_BE_EXPORTED = 'Drafted Credit Note(s) cannot be exported.';
  public static ALL_CREDIT_NOTE_EXPORTED_SUCCESSFULLY = 'All credit notes exported successfully.';
  public static SELECTED_CREDIT_NOTE_EXPORTED_SUCCESSFULLY = 'Selected credit note(s) exported successfully.';
  public static SINGLE_CREDIT_NOTE_EXPORTED_SUCCESSFULLY = 'Credit Note exported successfully.';

  public static SUPPORT_TICKET_CREATED_SUCCESSFULLY = 'Support ticket created successfully.';
  public static SUPPORT_TICKET_UPDATED_SUCCESSFULLY = 'Support ticket updated successfully.';
  public static SUPPORT_TICKET_DETAILS_UPDATED_SUCCESSFULLY = 'Updated successfully.';

  public static PLEASE_SELECT_AT_LEAST_ONE_SUPPORTED_PAYMENT_TYPE_TO_SAVE_YOUR_INFORMATION = 'Please select at least one supported payment type to save your information.'
  //Confirmation of addtional field module
  public static PO_REPORT_ORIENTATION_MODE_ACCORDING_TO_FIELD_COUNT = 'Additional fields for portrait mode cannot exceed 3. ' +
    '<br> Would you like to print the report in landscape mode instead?';

  // Funding account management
  public static FUNDING_ACCOUNT_CREATED_SUCCESSFULLY = 'Funding account created successfully.';
  public static FUNDING_ACCOUNT_UPDATED_SUCCESSFULLY = 'Funding account updated successfully.';
  public static FUNDING_ACCOUNT_DELETED_SUCCESSFULLY = 'Funding account deleted successfully.';
  public static FUNDING_ACCOUNT_ACTIVATED_SUCCESSFULLY = 'Funding account activated successfully.';
  public static FUNDING_ACCOUNT_INACTIVATED_SUCCESSFULLY = 'Funding account inactivated successfully.';
  public static FUNDING_ACCOUNT_MARK_AS_DEFAULT_SUCCESSFULLY = ' has been set as your default funding account.';

  constructor() {
  }

}
