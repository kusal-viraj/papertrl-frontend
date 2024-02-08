export enum AppHttpResponseMessage {
  VENDOR_REGISTERED_SUCCESSFULLY = 'Your request successfully submitted, You will be Notified further via an email upon the approval or rejection.',
  SESSION_EXPIRED = 'Your access token has expired, Please login to continue',

  VENDOR_CREATED_SUCCESSFULLY = 'Vendor created successfully',
  W9_FORM_NOT_FOUND = 'There is no W9 form attached to this vendor',
  VENDOR_APPROVED_SUCCESSFULLY = 'Vendor approved successfully',
  VENDOR_UPDATED_SUCCESSFULLY = 'Vendor updated successfully',
  VENDOR_REJECTED_SUCCESSFULLY = 'Vendor rejected successfully',
  USER_CREATED_SUCCESSFULLY = 'User created successfully',
  TENANT_CREATED_SUCCESSFULLY = 'Tenant created successfully',
  TENANT_UPDATED_SUCCESSFULLY = 'Tenant updated successfully',
  CAN_NOT_UPDATE_WORKFLOW_PENDING_INVOICES_EXIST = 'Can not change the invoice approval workflow, There are pending or rejected invoices ',

  EMPLOYEE_CREATED_SUCCESSFULLY = 'Employee created successfully',

  PACKAGE_CREATED_SUCCESSFULLY = 'Package created successfully',
  PACKAGE_CHANGE_APPROVED_SUCCESSFULLY = 'Package approved successfully',
  PACKAGE_CHANGE_REJECTED_SUCCESSFULLY = 'Package change request rejected',
  PACKAGE_CHANGE_REQUEST_SEND_SUCCESSFULLY = 'Request sent successfully, You will be notified upon the acceptance or rejection',
  PACKAGE_CHANGE_REQUEST_DELETED_SUCCESSFULLY = 'Request deleted successfully',
  CLIENT_CREATED_SUCCESSFULLY = 'Client created successfully',
  ATTACHMENT_DELETED_SUCCESSFULLY = 'Attachment deleted successfully',

  TRIAL_REQUEST_APPROVED_SUCCESSFULLY = 'Trial Request approved successfully',
  TRIAL_REQUEST_REJECTED_SUCCESSFULLY = 'Trial Request request rejected',
  TRIAL_REQUEST_REJECTION_COMMENT_IS_REQUIRED = 'Rejection comment is required',

  RECORD_UPDATED_SUCCESSFULLY = 'Record updated successfully',
  RECORD_DELETED_SUCCESSFULLY = 'Record deleted successfully',
  RECORD_INACTIVATED_SUCCESSFULLY = 'Record inactivated successfully',
  RECORD_ACTIVATED_SUCCESSFULLY = 'Record activated successfully',

  FILE_UPLOADED_SUCCESSFULLY = 'File(s) uploaded successfully',
  FAILED_TO_DOWNLOAD_FILE = 'File download failed',
  FILE_DOWNLOADED_SUCCESSFULLY = 'File downloaded successfully',

  SUBMITTED_SUCCESSFULLY = 'Successfully submitted for approval',
  INVOICE_APPROVED_SUCCESSFULLY = 'Invoice approved successfully',
  INVOICE_REJECTED_SUCCESSFULLY = 'Invoice rejected successfully',
  INVOICE_REASSIGN_SUCCESSFULLY = 'Invoice re-assigned successfully',
  UNDO_SUCCESSFULLY = 'Your previous action on this Invoice has been reversed successfully',
  ADMIN_UNDO_SUCCESSFULLY = 'User action reversed successfully',
  INVOICE_APPROVAL_SKIP_SUCCESSFULLY = 'Invoice approval successfully skipped to next level',
  NO_APPSROVED_INVOICEES = 'No Approved Invoices to be displayed',


  WORKFLOW_SAVED_SUCCESSFULLY = 'Workflow details saved successfully',
  WORKFLOW_UPDATED_SUCCESSFULLY = 'Workflow details updated successfully',
  WORKFLOW_DELETED_SUCCSSFULLY = 'Workflow deleted successfully',


// User Specific
  PROFILE_UPDATED_SUCCESSFULLY = 'Your profile information updated successfully',
  PASSWORD_CHANGED_SUCCESSFULLY = 'Password changed successfully',
  PASSWORD_RESET_LINK_SEND_SUCCESSFULLY = 'Password Reset link successfully sent to your PaperTrl registered email address',
  CURRENT_PASSWORD_MUST_BE_DIFFERENT = 'Current password and new password can not be identical',

// User Role------
  ROLE_CREATED_SUCCESSFULLY = 'User role created successfully',
  PLEASE_SELECT_ATLEAST_ONE_PRIVILEGE = 'Please assign at least one privilege ',
  CAN_NOT_DELETE_ROLE_USERS_EXIST = 'Can not delete the role, There are users already assigned to it',
  CAN_NOT_INACTIVATE_ROLE_USERS_EXIST = 'Can not inactivate the role, There are users already assigned to it',

// Date Format Error
  INVALID_DATE_FORMAT_ERROR = 'Invalid Date Format, Please Select Correct Date Format',

  INTERNET_CONNECTION_ERROR = 'Your internet connection has been interrupted, to continue please refresh the page',

  SYNC_SUCCESSFULLY = 'Sync process completed successfully',
  AUTO_SYNC_STATUS_CHANGED = 'Auto sync status changed successfully',

// Payment Management
  PAYMENT_SAVED_SUCCESSFULLY = 'Payment details saved successfully',
  CHECK_MAILED_SUCCESSFULLY = 'Check number successfully mark as mailed',
  CHECK_UPDATED_SUCCESSFULLY = 'Payment details updated successfully',
  PAYMENT_ROVOKE_SUCCESSFULLY = 'Payment void successfully',
  FILE_UPLOADED_WITH_ERRORS = 'File uploaded with errors',

// Vendor Management
  VENDOR_INVITATION_SENT_SUCCESSFULLY = 'Vendor invitation sent successfully',

// Approval Level Management
  APPROVAL_GROUP_CREATED_SUCCESSFULLY = 'Approval Group created successfully',

// Code Management
  CODE_SAVED_SUCCESSFULLY = 'Code details saved successfully',
  CODE_ALREADY_EXIST = 'Code details AlReady Exist',

// Proposal Management
  PROPOSAL_SUBMITTED_SUCCESSFULLY = 'Proposal successfully submitted for approval',
  PROPOSAL_UPDATED_SUCCESSFULLY = 'Proposal updated successfully',
  PROPOSAL_REJECT_SUCCESSFULLY = 'Proposal rejected successfully',
  PROPOSAL_APPROVED_SUCCESSFULLY = 'Proposal approved successfully',
  PROPOSAL_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Proposal assignee changed successfully',
  PROPOSAL_APPROVAL_SKIP_SUCCESSFULLY = 'Proposal approval is successful , skipped to the next level.',

// Expense Management
  EXPENSES_SUBMITTED_SUCCESSFULLY = 'Expense report successfully submitted for approval',
  EXPENSE_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Assignee changed successfully',
  EXPENSE_UPDATED_SUCCESSFULLY = 'Expense updated successfully',
  SKIP_APPROVAL_SUCCESSFULLY = 'Expense approval successfully skipped to next level',
  EXPENSE_REJECTED_SUCCESSFULLY = 'Expense rejected successfully',
  EXPENSE_TYPE_SAVED_SUCCESSFULLY = 'Expense type saved successfully',

// Opportunity Management
  OPPORTUNITY_SUBMITTED_SUCCESSFULLY = 'Opportunity successfully submitted for approval',
  OPPORTUNITY_UPDATED_SUCCESSFULLY = 'Opportunity updated successfully',
  OPPORTUNITY_REJECTED_SUCCESSFULLY = 'Opportunity rejected successfully',
  OPPORTUNITY_APPROVED_SUCCESSFULLY = 'Opportunity approved successfully',
  OPPORTUNITY_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Opportunity assignee changed successfully',
  OPPORTUNITY_SKIP_APPROVAL_SUCCESSFULLY = 'Opportunity approval successfully skipped to next level',

// Project Management
  PROJECT_SUBMITTED_SUCCESSFULLY = 'Project successfully submitted for approval',
  PROJECT_UPDATED_SUCCESSFULLY = 'Project updated successfully',
  PROJECT_APPROVED_SUCCESSFULLY = 'Project approved successfully',
  PROJECT_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Project assignee changed successfully',
  PROJECT_APPROVAL_SKIP_SUCCESSFULLY = 'Project approval successfully skipped to next level',
  PROJECT_RESUBMITTED_SUCCESSFULLY = 'Project resubmitted successfully',
  PROJECT_REJECT_SUCCESSFULLY = 'Project rejected successfully',


  PO_CREATED_SUCCESSFULLY = 'Purchase Order successfully submitted for approval',
  PO_SAVE_AS_APPROVED_SUCCESSFULLY = 'Purchase Order successfully save as approved',
  PO_UPDATED_SUCCESSFULLY = 'Purchase Order updated successfully',
  PO_MARKED_AS_IN_DISCUSSION_SUCCESSFULLY = 'Purchase Order marked as under discussion',
  PO_REJECT_SUCCESSFULLY = 'Purchase Order rejected successfully',
  PO_ORDER_DELETED_SUCCESSFULLY = 'Purchase Order deleted successfully',
  PO_APPROVED_SUCCESSFULLY = 'Purchase Order approved successfully',
  PO_STATUS_UPDATE_SUCCESSFULLY = 'Purchase Order status update successfully',
  PO_CHANGE_ASSIGNEE_SUCCESSFULLY = 'Assignee changed successfully',
  PO_SKIP_APPROVAL_SUCCESSFULLY = 'Purchase Order approval successfully skipped to next level',
  PO_RESUBMITTED_SUCCESSFULLY = 'Purchase Order resubmitted successfully',
  PO_SEND_TO_VENDOR_SUCCESSFULLY = 'Purchase Order sent to vendor approval successfully',
  PO_ITEM_ALREADY_RECEIVED = 'PO have already been assigned with maximum number of GRN(S)',
  PO_ATTACHMENT_DOWNLOAD_SUCCESSFULLY = 'Purchase Order attachment  downloaded successfully',
  PO_INSERT_THE_APPROVER_SUCCESSFULLY = 'Purchase Order successfully submitted for approval.',


  GRN_CREATED_SUCCESSFULLY = 'GRN created successfully',
  GRN_UPDATED_SUCCESSFULLY = 'GRN updated successfully',
  GRN_DELETED_SUCCESSFULLY = 'GRN deleted successfully',
  GRN_CLOSED_SUCCESSFULLY = 'GRN closed successfully',
  GRN_OPEN_SUCCESSFULLY = 'GRN opened successfully',

  TASK_CREATED_SUCCESSFULLY = 'Task created successfully',

// ADDITIONAL FIELD
  ADDITIONAL_FIELD_CREATED_SUCCESSFULLY = 'Additional field created successfully',
  ADDITIONAL_FIELD_UPDATED_SUCCESSFULLY = 'Additional field updated successfully',
  ADDITIONAL_FIELD_DELETED_SUCCESSFULLY = 'Additional field deleted successfully',
  DROPDOWN_OPTION_CREATED_SUCCESSFULLY = 'Dropdown option created successfully',

// INTEGRATION MANAGEMENT
  SYSTEM_AUTHENTICATION_SAVED_SUCCESSFULLY = 'System authentication saved successfully',
  SYSTEM_ENDPOINT_INFORMATION_SAVED_SUCCESSFULLY = 'Endpoint information saved successfully',
  INTEGRATION_SYSTEM_CREATED_SUCCESSFULLY = 'Integration system created successfully',
  SYNC_PROPERTY_CHANGED_SUCCESSFULLY = 'Sync property changed successfully',

// PACKAGE CHANGE
  CONVERT_TO_PORTAL_SUCCESSFULLY_DONE = 'This account has been successfully converted to an Agency Portal, you will receive an email with the URL to access Agency Portal.',

// VENDOR REQUEST
  VEN_REQUEST_SUCCESSFULLY_APPROVED = 'Request Approved Successfully',
  VEN_REQUEST_SUCCESSFULLY_REJECTED = 'Request Rejected Successfully',


// Account Management
  ACCOUNT_UPDATED_SUCCESSFULLY = 'Account updated successfully',
  ACCOUNT_SAVED_SUCCESSFULLY = 'Account saved successfully',
  ACCOUNT_CREATED_SUCCESSFULLY = 'Account created successfully',
  ACCOUNT_DELETED_SUCCESSFULLY = 'Account deleted successfully',

// Item Management
  ITEM_CREATED_SUCCESSFULLY = 'Item created successfully',
  ITEM_UPDATED_SUCCESSFULLY = 'Item Updated successfully',
  ITEM_DELETED_SUCCESSFULLY = 'Item deleted successfully',

// Invoice Approval Screen Go Back
  YOU_HAVE_NOT_INVOICE_TO_APPROVAL = 'Congratulations!! You have no pending invoices left',
  YOU_HAVE_NOT_PO_TO_APPROVAL = 'Congratulations!! You have no pending purchase orders left',


// sync dashboard
  SELECTED_ITEM_SUCCESSFULLY_SENT_TO_PROCESSING_QUEUE = 'Selected item(s) successfully sent to processing queue',
  ITEM_SUCCESSFULLY_SENT_TO_PROCESSING_QUEUE = 'Item successfully sent to processing queue',

// tag invoice with payment
  INVOICE_TAGGED_SUCCESSFULLY = 'Payment tagged  to invoice successfully',

// Automation
  AUTOMATION_UPDATED_SUCCESSFULLY = 'Automation updated successfully',
  AUTOMATION_SAVED_SUCCESSFULLY = 'Automation saved successfully',
  AUTOMATION_CREATED_SUCCESSFULLY = 'Automation created successfully',
  AUTOMATION_DELETED_SUCCESSFULLY = 'Automation deleted successfully',


  // Bill
  BILL_REJECT_SUCCESSFULLY = 'Bill  rejected successfully',
  BILL_APPROVED_SUCCESSFULLY = 'Bill approved successfully',
  BILL_INSERT_THE_APPROVER_SUCCESSFULLY = 'Bill successfully submitted for approval.',

  //PAYMENT

  BATCH_REJECT_SUCCESSFULLY = 'Batch  rejected successfully',
  BATCH_APPROVED_SUCCESSFULLY = 'Batch approved successfully',

  SELECT_AT_LEAST_ONE_TRANSACTION = 'Please select at least one transaction.'
}
