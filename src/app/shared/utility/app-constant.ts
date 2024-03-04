import {VirtualScroller} from 'primeng/virtualscroller';

export class AppConstant {
  constructor() {
  }

  public static EMPTY_STRING = '';
  public static FORWARD_SLASH_STRING = '/';
  public static COLON_STRING = ':';
  public static AUTH_TYPE = 'Basic ';
  public static COMMA_STRING = ',';
  public static STAR_STRING = '*';
  public static NULL_VALUE = null;
  public static UNDEFINED_VALUE = undefined;
  public static ARROW_DOWN = 'ArrowDown';
  public static ARROW_UP = 'ArrowUp';
  public static US_DATE_FORMAT = 'MM/dd/yyyy';
  /**
   * Session Attributes ------->
   */
  public static BASIC_AUTH_ATTR = 'basicauth';
  public static SESSION_USER_ATTR = 'user';
  public static ACCESS_TOKEN = 'access_token';
  public static REFRESH_TOKEN = 'refresh_token';
  public static ACCESS_TOKEN_EXPIRES_AT = 'access_token_valid_period';
  public static REFRESH_TOKEN_EXPIRES_AT = 'refresh_token_valid_period';
  public static SESSION_ID = 'X-Auth-Token';
  public static CSRF_TOKEN = 'X-CSRF-TOKEN';
  public static NAV_ITEMS = 'NAV_ITEMS';
  public static MENU_PRIVILEGE = 'MENU_PREV';
  public static DISMISS_TASK = 'DISMISS_TASK';
  public static REMEMBER_ME = 'remember_me';
  public static STRING_TRUE = 'true';
  /**
   * Session Attributes ------->
   */
  public static SUB_CLIENT_ID = 'SUB-CLIENT-ID';
  public static NON_PORTAL_PRIVILEGE_USER = 'NON-PORTAL-PRIVILEGE-USER';
  public static PORTAL_URLS = ['/home/sub-accounts', '/home/portal-dashboard', '/home/admin'];
  public static PORTAL_SHORT_URLS = ['sub-accounts', 'portal-dashboard', 'admin'];

  /**
   * Integration sysytem auth type Ids ------->
   */
  public static OAUTH_AUTH_TYPE_ID = 1;
  public static CONNECTOR_AUTH_TYPE_ID = 2;

  /**
   * Integration sysytem grant type Ids ------->
   */
  public static AUTH_CODE_GRANT_TYPE_ID = 1;
  public static PASSWORD_GRANT_TYPE_ID = 2;

  /**
   * Integration system auth type Ids ------->
   */

  public static BASIC_AUTH_TYPE_ID = 3;
  public readonly PAYMENT_TYPE_VIRTUAL_CARD = 3;

  /**
   * Integration systems Ids ------->
   */
  public static QB_ONLINE_ID = 2;

  /**
   * TENANT MENU IDS---------->
   */
  public static MENU_DASHBOARD = 14;
  public static MENU_ADMIN_PORTAL = 2;
  public static MENU_USER_MANAGEMENT = 3;
  public static MENU_ROLE_MANAGEMENT = 4;
  public static MENU_VENDOR_PORTAL = 5;
  public static MENU_VENDOR_MANAGEMENT = 6;
  public static MENU_VENDOR_APPROVAL = 7;
  public static MENU_INVOICE_APPROVAL_FLOW = 8;
  public static MENU_UPLOAD_INVOICE = 9;
  public static MENU_REVIEW_INVOICE = 10;
  public static MENU_INVOICE_STATUS_BOX = 11;
  public static MENU_CODE_MANAGEMENT = 12;
  public static MENU_VENDOR_INVOICE_SEARCH = 13;
  public static MENU_TENANT_MANAGEMENT = 16;
  public static MENU_EINVOICE = 20;
  public static MENU_PAYMENT_MANAGEMENT = 21;
  public static MENU_SYNC_DASHBOARD = 22;
  public static MENU_APPROVAL_LEVEL_MANAGEMENT = 23;
  public static MENU_CLIENT_MANAGEMENT = 30;
  public static MENU_EMPLOYEE_MANAGEMENT = 32;
  public static MENU_OPPORTUNITY_MANAGEMENT = 33;
  public static MENU_PROPOSAL_MANAGEMENT = 34;
  public static MENU_PROJECT_MANAGEMENT = 35;
  public static MENU_PROPOSAL_APPROVAL = 36;
  public static MENU_EXPENSE_MANAGEMENT = 37;
  public static MENU_EXPENSE_APPROVAL = 38;
  public static MENU_OPPORTUNITY_APPROVAL = 40;
  public static MENU_PROJECT_APPROVAL = 41;
  public static MENU_PO_MANAGEMENT = 42;
  public static MENU_PO_APPROVAL = 43;
  public static MENU_PAYMENT_RECEIVED = 44;
  public static MENU_GRN_MANAGEMENT = 45;
  public static MENU_TASK_SETTINGS_MANAGEMENT = 30;
  public static MENU_ITEM_MANAGEMENT = 51;
  public static MENU_ACCOUNT_MANAGEMENT = 52;


  /**
   * SUPPORT MENU IDS---------->
   */

  public static APPROVE_PACKAGE_CHANGES = 27;
  public static PACKAGE_MANAGEMENT = 29;
  public static MENU_TRIAL_REQUEST_MANAGEMENT = 31;

  public static DOT_STRING = '.';
  public static FORWARD_SLASH = '/';
  public static EMPTY_SPACE = ' ';
  public static ID_ATTR = 'id';
  public static SQUARE_BRACKED_OPEN = '[';
  public static SQUARE_BRACKED_CLOSE = ']';
  public static APPROVAL_GROUP_ATTR = 'approvalGroupId';
  public static PERMENANT_ADDRESS = 'permenantAddress';
  public static REMIT_ADDRESS = 'remitAddress';
  public static COUNTRY = 'country';
  public static ZIPCODE = 'zipcode';
  public static UNDEFINED_STRING = 'undefined';

  public static ENTER_KEY = 'Enter';

  public static EXTERNAL_USER = 'E';
  public static STATUS_YES = 'Y';
  public static STATUS_DELETE = 'Y';
  public static STATUS_APPROVED = 'A';
  public static STATUS_PENDING = 'P';
  public static STATUS_NO = 'N';
  public static STATUS_VERIFIED = 'V';
  public static STATUS_REJECTED = 'R';
  public static STATUS_UNDER_DISCUSSION = 'U';
  public static STATUS_CANCEL = 'C';
  public readonly STATUS_CANCEL = 'C';
  public static STATUS_SUCCESS = 'S';
  public static STATUS_ACTIVE = 'A';
  public static STATUS_INACTIVE = 'I';

  public static COUNTRY_US = 'United States';
  public static TIMEZONE_EASTERN = 'US/Eastern';
  public static MAX_PROPIC_SIZE = 1;
  public static MAX_W9_SIZE = 10;
  public static MAX_INVOICE_SIZE = 5;

  public static HTTP_RESPONSE_STATUS_SUCCESS = 200;
  public static HTTP_RESPONSE_STATUS_WARNING = 207;
  public static HTTP_RESPONSE_STATUS_CREATED = 201;
  public static UN_AUTHORIZED = 401;
  public static FORBIDDEN = 403;
  public static BAD_REQUEST = 400;
  public static NOT_ACCEPTABLE = 406;
  public static UNDO_INTERVAL = 25000;
  public static TABLE_ADJUST_TIMEOUT = 2000;

  public static SUPPORTING_PRO_PIC_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
  public static SUPPORTING_W9_TYPES = ['application/pdf'];
  public static SUPPORTING_TEMPLATE_TYPE = ['application/json'];
  public static SYSTEM_APPROVAL_LEVELS = [1, 2];

  public static DISCOUNT_TERM_OTHER = 10;
  public TERM_ID = 10;

  public static SYSTEM_ADMIN = 1;

  public static MAX_REP_SIZE = 10;
  public static MAX_FINAL_PROPOSAL_SIZE = 10;
  public static MAX_AMENDMENTS_SIZE = 10;
  public static MAX_PROTEST_SIZE = 10;
  public static MAX_OTHER_SIZE = 10;
  public static MAX_LOGO_SIZE = 1;

  public static SUPPORTING_REP_TYPES = ['application/pdf'];
  public static SUPPORTING_FINAL_PROPOSAL_TYPES = ['application/pdf'];
  public static SUPPORTING_AMENDMENTS_TYPES = ['application/pdf'];
  public static SUPPORTING_PROTEST_TYPES = ['application/pdf'];
  public static SUPPORTING_OTHER_TYPES = ['application/pdf'];


  public static COMMON_FILE_SIZE = 10;

  public static DEFAULT_WORKFLOW = 'Default Workflow';

  public static UPLOAD_FILE = 'Upload file';


  public static COL_MD_10 = 'col-md-10';
  public static COL_MD_6 = 'col-md-6';
  public static COL_MD_2 = 'col-md-2';

  public static COL_3 = 'col-3';
  public static COL_4 = 'col-4';
  public static COL_5 = 'col-5';

  public static JOB_TITLE = 'PAPERTRL_USER';
  public static readonly PAPERTRL_THANKS_PAGE_URL = 'https://papertrl.com/thankyoutrial/';


  /**
   * SYSTEM MODULE IDs
   */

  public static PO_SUBMISSION_MODEL_ID = 1;
  public static EXPENSE_SUBMISSION_MODEL_ID = 2;
  public static INVOICE_SUBMISSION_MODEL_ID = 3;
  public static GRN_SUBMISSION_MODEL_ID = 4;
  public static OPPORTUNITY_SUBMISSION_MODEL_ID = 5;
  public static PROPOSAL_SUBMISSION_MODEL_ID = 6;
  public static PROJECT_SUBMISSION_MODEL_ID = 7;
  public static PAYMENT_SUBMISSION_MODEL_ID = 8;
  public static E_INVOICE_SUBMISSION_MODEL_ID = 9;


  /**
   * Data source
   */
  public static DATA_SOURCE_TYPE_PREDEFINED = 1;
  public static DATA_SOURCE_TYPE_CUSTOME = 2;

  /**
   * Data source
   */
  public ADDITIONAL_FIELD_DROP_DOWN_PROPERTY_MULTIPLE = 1;
  public ADDITIONAL_FIELD_DROP_DOWN_PROPERTY_ADD_NEW = 2;


  /**
   * Field Length
   */

  public static REMARKS_MAXLENGTH = 300;
  public static ITEM_CODE_MAXLENGTH = 20;

  public static TEXTBOX = 1;
  public static DATE_FIELD = 2;
  public static DROP_DOWN_FIELD = 3;
  public static TEXT_AREA = 4;
  public static LABLE = 5;
  public static FILE_INPUT = 6;
  public static REDIO_BUTTON = 7;

  public static readonly PLEASE_SELECT_SELECTION_ID = undefined;
  public static readonly CREATE_NEW_SELECTION_ID = 0;

  /**
   * Chart of account types
   */
  public static readonly ACCOUNTS_RECEIVABLE = 1;
  public static readonly OTHER_CURRENT_ASSETSE = 2;
  public static readonly BANK = 3;
  public static readonly FIXED_ASSETS = 4;
  public static readonly OTHER_ASSETS = 5;
  public static readonly ACCOUNTS_PAYABLE = 6;
  public static readonly CREDIT_CARD = 7;
  public static readonly OTHER_CURRENT_LIABILITIES = 8;
  public static readonly LONG_TERM_LIABILITIES = 9;
  public static readonly EQUITY = 10;
  public static readonly INCOME = 11;
  public static readonly OTHER_INCOME = 12;
  public static readonly COST_OF_GOODS_SOLD = 13;
  public static readonly EXPENSES = 14;
  public static readonly OTHER_EXPENSE = 15;

  /**
   * Table Name List
   */
  public readonly GRID_NAME_ROLE_LIST = 'ROLE_LIST';
  public readonly GRID_NAME_Bill_LIST = 'BILL_LIST';
  public readonly GRID_NAME_RECURRING_Bill_LIST = 'RECURRING_BILL_TEMPLATE_LIST';
  public readonly GRID_NAME_DASHBOARD_Bill_LIST = 'TGRID_BILL_LIST';
  public readonly GRID_NAME_EXPENSE_LIST = 'EXPENSE_LIST';
  public readonly GRID_NAME_ADD_CARD_LIST = 'CREDIT_CARD_STATEMENT_CREDIT_CARD_LIST';
  public readonly GRID_NAME_REMINDER_LIST = 'REMINDER_CONFIGURATION';
  public readonly GRID_NAME_RECEIPT_CARD_LIST = 'CREDIT_CARD_RECEIPT';
  public readonly GRID_NAME_TRANSACTION_LIST = 'CREDIT_CARD_TRANSACTION_LIST';
  public readonly GRID_NAME_APPROVED_TRANSACTION_LIST = 'CREDIT_CARD_APPROVED_LIST';
  public readonly GRID_NAME_UPLOAD_CARD_LIST = 'CREDIT_CARD_STATEMENT_UPLOAD_LIST';
  public readonly GRID_NAME_PROCESS_CARD_LIST = 'CREDIT_CARD_PROCESS_LIST';
  public readonly GRID_NAME_RECEIPT_POPUP_LIST = 'CREDIT_CARD_RECEIPT_POPUP';
  public readonly GRID_NAME_DASHBOARD_EXPENSE_LIST = 'TGRID_EXP_LIST';
  public readonly GRID_NAME_APPROVAL_GROUP = 'APPROVAL_GROUP_LIST';
  public readonly GRID_NAME_DEPARTMENT = 'DEPARTMENT_LIST';
  public readonly GRID_NAME_USER_LIST = 'USER_LIST';
  public readonly GRID_ACCOUNT_LIST = 'ACCOUNT_LIST';
  public readonly GRID_VCARD_LIST = 'V_CARD';
  public readonly GRID_TICKET_LIST = 'SUPPORT_TICKET';
  public readonly GRID_ADDITIONAL_FIELD_LIST = 'ADDITIONAL_FIELD_LIST';
  public readonly GRID_PO_NUMBER_LIST = 'PO_NUMBER_CONFIGURATION_LIST';
  public readonly GRID_EXPENSE_MILEAGE_RATE = 'EXPENSE_MILEAGE_RATE';
  public readonly GRID_PO_PRICE_VARIANCE_LIST = 'PO_PRICE_VARIANCE_LIST';
  public readonly GRID_ITEM_LIST = 'ITEM_LIST';
  public readonly GRID_VENDOR_ITEM_LIST = 'VENDOR_ITEMS';
  public readonly GRID_CUSTOMER_INVOICE_LIST = 'CUSTOMER_INVOICE_LIST';
  public readonly GRID_CREDIT_NOTE_LIST = 'CREDIT_NOTE_LIST';
  public readonly GRID_PROJECT_CODE_BILLS = 'PROJECT_CODE_BILLS';
  public readonly GRID_BILL_PAYMENT_LIST = 'TRANSACTION_LIST';
  public readonly GRID_PROCESS_PAYMENT_REQUEST_LIST = 'PROCESS_PAYMENT_REQUEST_LIST';
  public readonly GRID_PAYMENT_CREATE = 'APPROVED_DOCUMENT_LIST';
  public readonly GRID_OCR_TEMPLATE_LIST = 'OCR_BILL_TEMPLATE';
  public readonly GRID_PO_LIST = 'PO_LIST';
  public readonly GRID_DASHBOARD_PO_LIST = 'TGRID_PO_LIST';
  public readonly GRID_PO_RECEIPT_LIST = 'PO_RECEIPT_LIST';
  public readonly GRID_AUTOMATION_LIST = 'AUTOMATION_LIST';
  public readonly GRID_ACCOUNT_SYNC_PENDING_LIST = 'SYNC_ACCOUNT_PENDING_LIST';
  public readonly GRID_ACCOUNT_SYNC_PROCESSING_LIST = 'SYNC_ACCOUNT_PROCESSING_LIST';
  public readonly GRID_ACCOUNT_SYNC_COMPLETED_LIST = 'SYNC_ACCOUNT_COMPLETED';
  public readonly GRID_ACCOUNT_SYNC_COMPLETED_PULL_LIST = 'SYNC_ACCOUNT_COMPLETED_PULL';
  public readonly GRID_ACCOUNT_SYNC_FAILED_LIST = 'SYNC_ACCOUNT_FAILED_LIST';
  public readonly GRID_ACCOUNT_SYNC_FAILED_PULL_LIST = 'SYNC_ACCOUNT_FAILED_PULL_LIST';
  public readonly GRID_DASHBOARD_DISCOUNT_LIST = 'DISCOUNT_APPLICABLE_LIST';
  public readonly GRID_VENDOR_INVITATION_LIST = 'VENDOR_INVITATION_LIST';
  public readonly GRID_VENDOR_VENDOR_GROUP_LIST = 'VENDOR_GROUP_LIST';
  public readonly GRID_VENDOR_REQUEST_LIST = 'VENDOR_REQUEST_LIST';
  public readonly GRID_COMMUNITY_VENDOR_LIST = 'COMMUNITY_VENDOR_LIST';
  public readonly GRID_VENDOR_BILL_LIST = 'VENDOR_BILL_LIST';
  public readonly GRID_VENDOR_BILL_PAYMENT_LIST = 'VENDOR_TRANSACTION_LIST';
  public readonly GRID_VENDOR_PURCHASE_ORDER_LIST = 'VENDOR_PURCHASE_ORDER_LIST';
  public readonly GRID_VENDOR_PO_RECEIPTS = 'VENDOR_PO_RECEIPTS';
  public readonly GRID_PROJECT_CODE_LIST = 'PROJECT_CODE_LIST';
  public readonly GRID_SUB_ACCOUNT_LIST = 'SUB_ACCOUNT_LIST';
  public readonly GRID_VENDOR_INVOICE_TEMPLATE = 'VENDOR_INVOICE_TEMPLATE';
  public readonly VENDOR_CREDIT_NOTE_LIST = 'VENDOR_CREDIT_NOTE_LIST';
  public readonly GRID_NAME_RECURRING_INVOICE_LIST = 'VENDOR_RECURRING_INVOICE_TEMPLATE';
  public static readonly GRID_PORTAL_BILL_DASHBOARD = 'PORTAL_DASHBOARD_BILL_TABLE';
  public static readonly GRID_PORTAL_BILL_PAYMENT_DASHBOARD = 'PORTAL_DASHBOARD_BILL_PAYMENT_TABLE';
  public static readonly GRID_PORTAL_PURCHASE_ORDER_DASHBOARD = 'GRID_PORTAL_PURCHASE_ORDER_DASHBOARD';
  public static readonly GRID_PORTAL_EXPENSE_DASHBOARD = 'GRID_PORTAL_EXPENSE_DASHBOARD';
  public static readonly GRID_VENDOR_PAYMENT_APPROVED_BILL = 'VENDOR_PAYMENT_APPROVED_BILL';
  public static readonly GRID_VENDOR_PAYMENT_UNDER_APPROVED_BILL = 'VENDOR_PAYMENT_UNDER_APPROVED_BILL';
  public readonly GRID_CUSTOMER_INVITATION_LIST = 'CUSTOMER_REQUEST';
  public readonly GRID_VENDOR_COMMUNITY_PO_LIST = 'PURCHASE_ORDER_LIST';
  public readonly GRID_VENDOR_COMMUNITY_D_CARDS_LIST = 'VENDOR_DIGITAL_CARD_LIST';
  public readonly GRID_VENDOR_COMMUNITY_PAYMENT_LIST = 'VENDOR_PAYMENT_UNDER_APPROVED_BILL';
  public static readonly GRID_NAME_TASK_LIST = 'SUPPORT_TASK_LIST';
  public readonly GRID_NAME_TENANT_LIST = 'SUPPORT_TENANT_LIST';
  public static readonly GRID_NAME_ACTIVITY_LIST = '';
  public readonly GRID_NAME_EMAIL_LIST = 'SUPPORT_EMAIL_LIST';
  public readonly GRID_VENDOR_COMMUNITY_INVOICE_LIST = 'INVOICE_LIST';
  public readonly GRID_VENDOR_COMMUNITY_INVOICE_SUMMARY_LIST = 'VENDOR_DASHBOARD_BILL_LIST';
  public readonly VENDOR_DASHBOARD_PO_LIST = 'VENDOR_DASHBOARD_PO_LIST';
  public readonly GRID_NAME_PAYMENT_TYPE_LIST = 'PAYMENT_TYPE_LIST';
  public readonly GRID_NAME_PAYMENT_PROVIDER_LIST = 'PAYMENT_PROVIDER_LIST';
  public readonly GRID_NAME_CONFIG_LIST = 'INTEGRATION_SYSTEM_CONFIGURATION_LIST';
  public readonly GRID_NAME_SYSTEM_LIST = 'INTEGRATION_SYSTEM_LIST';
  public readonly GRID_ACTIVE_CURRENT_LOGIN_LIST = 'ACTIVE_CURRENT_LOGIN_LIST';
  public readonly GRID_BILL_EXPENSE_COST_LINE_ITEM_LIST = 'BILL_EXPENSE_COST_LINE_ITEM_LIST';
  public readonly GRID_BILL_ITEM_COST_LINE_ITEM_LIST = 'BILL_ITEM_COST_LINE_ITEM_LIST';
  public readonly GRID_RECURRING_BILL_EXPENSE_COST_LINE_ITEM_LIST = 'RECURRING_BILL_EXPENSE_COST_LINE_ITEM_LIST';
  public readonly GRID_RECURRING_BILL_ITEM_COST_LINE_ITEM_LIST = 'RECURRING_BILL_ITEM_COST_LINE_ITEM_LIST';


  /**
   * Dropdown option
   */
  public static readonly OPTION_PLEASE_SELECT = 'SELECT';
  public static readonly OPTION_CREATE_NEW = 'CREATE_NEW';
  public readonly EMPTY_STRING_WITH_SPACE = ' ';
  public readonly EMPTY_STRING = '';

  public readonly SUPPORTING_FILE_UPLOAD_TYPES = ['image/*', 'application/pdf', 'application/vnd.ms-excel',
    'application/msword', 'text/csv'];
  public SYSTEM_ADMIN = 1;
  public VENDOR = 2;
  public NO_APPROVAL_GROUP = 3;
  public SUPPORT_ADMIN = 101;
  public SUPPORT_USER = 102;
  public SYSTEM_ADMIN_ROLE = 6;

  public readonly PROJECT_EXPENSE_CAT_ID = 2;
  public readonly PRIVILEGE_CREATE = 1;
  public readonly PRIVILEGE_SEARCH = 2;
  public readonly PRIVILEGE_DETAIL_VIEW = 3;
  public readonly PRIVILEGE_EDIT = 4;
  public readonly PRIVILEGE_DELETE = 5;
  public readonly PRIVILEGE_APPROVE = 6;
  public readonly PRIVILEGE_REJECT = 7;
  public readonly PRIVILEGE_UPLOAD = 8;
  public readonly PRIVILEGE_VIEW_AUDIT_TRAIL = 10;
  public readonly PRIVILEGE_SUBMIT = 11;
  public readonly PRIVILEGE_RE_SUBMIT = 12;
  public readonly PRIVILEGE_INACTIVE = 13;
  public readonly PRIVILEGE_ACTIVATE = 14;
  public readonly PRIVILEGE_RESET_PASSWORD = 15;
  public readonly PRIVILEGE_ASSIGNEE_CHANGE = 16;
  public readonly PRIVILEGE_UNDO_APPROVAL = 17;
  public readonly PRIVILEGE_UNDO_REJECTION = 18;
  public readonly PRIVILEGE_SYSTEM_SHORTCUTS = 22;
  public readonly PRIVILEGE_SHOW_INVOICE_SUMMARY_CHART = 23;
  public readonly PRIVILEGE_SHOW_ACCUMLATED_INVOICE_CHART = 24;
  public readonly PRIVILEGE_SHOW_INVOICE_STATUS_BOX = 25;
  public readonly PRIVILEGE_CHANGE_INVOICE = 26;
  public readonly PRIVILEGE_MARK_AS_MAILED = 27;
  public readonly PRIVILEGE_PAYMENT_REVOKED = 28;
  public readonly PRIVILEGE_CHECK_SYNC = 29;
  public readonly PRIVILEGE_VENDOR_SYNC = 30;
  public readonly PRIVILEGE_CHANGE_AUTO_SYNC_STATUS = 31;
  public readonly PRIVILEGE_VIEW_CHECK__SYNC_HISTORY = 32;
  public readonly PRIVILEGE_VIEW_VENDOR_SYNC_HISTORY = 33;
  public readonly PRIVILEGE_VIEW_DISCOUNT_INVOICES = 34;
  public readonly PRIVILEGE_VIEW_INVOICES = 35;
  public readonly PRIVILEGE_VIEW_USER_LOGS = 36;
  public readonly PRIVILEGE_CHANGE_PACKAGE = 37;
  public readonly PRIVILEGE_SKIP_APPROVAL = 38;
  public readonly PRIVILEGE_DOWNLOAD_RECEIPT = 39;
  public readonly PRIVILEGE_OVERRIDE_APPROVAL = 40;
  public readonly PRIVILEGE_CLOSE = 41;
  public readonly PRIVILEGE_GENERATE_INVOICE = 42;
  public readonly PRIVILEGE_EDIT_CODE_DESCRIPTION = 43;
  public readonly PRIVILEGE_GENERATE_DETAIL_REPORT = 44;
  public readonly PRIVILEGE_OPEN = 45;
  public readonly PRIVILEGE_DOWNLOAD_INVOICE = 46;
  public readonly PRIVILEGE_CSV_EXPORT = 47;
  public readonly PRIVILEGE_CSV_IMPORT = 48;
  public readonly APPROVE_PERMISSION_REQUEST = 50;
  public readonly REJECT_PERMISSION_REQUEST = 51;
  public readonly TAG_INVOICE = 52;


  static SYSTEM_BUISNESS_CENTRAL_V15 = 4;
  static SYSTEM_BUISNESS_CENTRAL_CLOUD = 6;
  static SYSTEM_BLACKBAUD = 5;
  static SYSTEM_DNO = 7;
  static SYSTEM_QUCIK_BOOKS_DESKTOP = 1;
  static SYSTEM_QUCIK_BOOKS_ONLINE = 2;

  // #############################TRANSACTION STATUSES#####################################
  public readonly TRANSACTION_PENDING = 'O';
  public readonly TRANSACTION_SUBMITTED = 'U';
  public readonly TRANSACTION_SUCCESS = 'S';
  public readonly TRANSACTION_FAILED = 'F';
  public readonly TRANSACTION_UNPROCESSED = 'N';
  public readonly TRANSACTION_CANCELED = 'C';
  public readonly TRANSACTION_CREATED = 'K';
  public readonly TRANSACTION_IN_PROGRESS = 'J';
  public readonly TRANSACTION_ON_HOLD = 'H';

  /**
   * AUTH TYPE
   */
  public readonly AUTH_TYPE_BASIC = 'BS';
  public readonly AUTH_TYPE_TOKEN = 'BT';


  /**
   * ADDITIONAL FIELDS VALIDATION IDS
   */

  public readonly VALIDATION_NAME = 1;
  public readonly VALIDATION_DISPLAY_ORDER = 2;
  public readonly VALIDATION_REQUIRED = 3;
  public readonly VALIDATION_MAX_LENGTH = 4;
  public readonly VALIDATION_DATA_TYPE = 5;
  public readonly VALIDATION_CREATE_NEW = 6;
  public readonly VALIDATION_MULTIPLE = 7;
  public readonly VALIDATIONS_ACCEPT = 8;
  public readonly VALIDATIONS_ROWS = 9;
  public readonly VALIDATIONS_VALUE = 10;
  public readonly VALIDATION_OPTION = 11;


  //Recurring Bill
  public readonly DAILY = 'DAILY';
  public readonly MONTHLY = 'MONTHLY';
  public readonly YEARLY = 'YEARLY';
  public readonly CUSTOM = 'CUSTOM';
  public readonly WEEKLY = 'WEEKLY';
  public readonly NO_OF_OCC = 'NO_OF_OCC';
  public readonly SPEC_DATE = 'SPEC_DATE';
  public readonly DAY = 'DAY';
  public readonly DAYS = 'DAYS';
  public readonly WEEKS = 'WEEKS';
  public readonly MONTHS = 'MONTHS';
  public readonly YEARS = 'YEARS';


  /**
   * FIELD TYPE IDS
   */

  public readonly TEXTBOX = 1;
  public readonly DATE_FIELD = 2;
  public readonly DROP_DOWN_FIELD = 3;
  public readonly TEXT_AREA = 4;
  public readonly LABLE = 5;
  public readonly FILE_INPUT = 6;
  public readonly REDIO_BUTTON = 7;

  /**
   * DATA TYPES IDS AND VALUES
   */

  public readonly DATA_TYPE_PATTERN_MAP = new Map([
    ['.*', 'Any'],
    ['^[0-9]*$', 'Numeric'],
    ['^[0-9*]+$', 'Numeric'], // Specific for account number and routing number fields of Payment configuration screen
    ['^[0-9]+$', 'Numeric'], // Specific for virtual card account id and digital card account id fields of Payment configuration screen
    ['[a-zA-Z\\s]*', 'Alphabetical'],
    ['[a-zA-Z0-9\\s]*', 'Alphanumeric'],
    ['^[a-zA-Z0-9]+$', 'Alphanumeric'],
    ['[-0-9$&+,:;=?@#|\'<>.^*()%!]*', 'Numeric + Special'],
    ['[-a-zA-Z$&+,:;=?@#|\'<>.^*()%!]*', 'Alphabetical + Special']
  ]);

  public readonly MIME_TYPE_MAP = new Map([
    ['image/*', 'Image files'],
    ['application/pdf', 'PDF files'],
    ['application/vnd.ms-excel', 'MS Excel(93-2003) files'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'MS Excel files'],
    ['application/msword', 'MS Word files(93-2003)'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'MS Word files']
  ]);

  public readonly PREVIOUSLY_APPROVES_ICON = new Map([
    [1, 'Image files'],
    [2, 'Image files'],
    [3, 'Image files'],
    [4, 'Image files'],
    [5, 'Image files'],
  ]);


  public static readonly SUPPORT_SYSTEM = 'support';
  public static readonly PORTAL_SYSTEM = 'portal';
  public static readonly VENDOR_SYSTEM = 'vendors';

  /**
   * Ng Select Overlay Option
   */
  public readonly APPEND_TO_BODY = 'body';

  /**
   * Project Code Management
   */

  public static readonly PROJECT_CODE_CATEGORY_ID = 2;

  /**
   * access level names
   */

  public static readonly NO_APPROVAL_GROUP_NAME = 'No Approval Group';


  /**
   * dropdown constants
   */

  MULTIPLE = 'multiple';
  CREATE_NEW = 'createNew';
  ACTIVE = 'A';
  INACTIVE = 'I';
  OPTION_VALUE = 'optionValue';

  /**
   * PO number configuration Form Controls
   */

  public static readonly SEPARATOR_SYMBOL = 'separatorSymbol';
  public static readonly SEPARATOR_SYMBOL_ID = 'separatorSymbolId';
  public static readonly PREFIXES = 'prefixes';
  public static readonly PO_NUMBER = 'poNumber';
  public static readonly SUFFIXES = 'suffixes';
  public static readonly APPROVAL_GROUP_ID = 'approvalGroupId';
  public static readonly YES = 'Y';
  public static readonly NO = 'N';
  public static readonly DATA_PATCH_TIME_OUT = 100;
  public static readonly PREFIX_LENGTH = 50;
  public static readonly SUFFIX_LENGTH = 50;


  /**
   * COMMON ADDITIONAL FIELD FORM GROUP PROPERTIES
   */
  public static readonly FIELD_ID = 'fieldId';
  public static readonly FIELD_NAME = 'fieldName';
  public static readonly DISPLAY_ORDER = 'displayOrder';
  public static readonly SECTION_ID = 'sectionId';
  public static readonly DOCUMENT_RELATION_ID = 'docId';
  public static readonly FIELD_TYPE_ID = 'fieldTypeId';
  public static readonly FIELD_STATUS = 'docStatus';
  public static readonly FIELD_REQUIRED = 'required';
  public static readonly MULTIPLE = 'multiple';
  public static readonly FIELD_VALUE = 'fieldValue';
  public static readonly ATTACHMENT = 'attachment';
  public static readonly DOWNLOAD_ATTACHMENT_ID = 'downloadAttachment';
  public static readonly DELETE_ATTACHMENT_ID = 'deleteAttachment';
  public static readonly VENDOR_ATTACHMENT_DELETE_KEY = 'vendorAttachment';


  /**
   * COMMON POINTER EVENTS
   */

  public static readonly POINTER_EVENT_AUTO = 'auto';
  public static readonly POINTER_EVENT_NONE = 'none';

  /**
   * VENDOR SECTION SORT NAMES
   */
  public static readonly SECTION_BASIC = 'basic';
  public static readonly SECTION_POSTAL_ADDRESS = 'postal';
  public static readonly SECTION_REMIT_ADDRESS = 'remit';
  public static readonly SECTION_W9_INFO = 'w9Info';
  public static readonly SECTION_PAYMENT_INFO = 'payment';


  /**
   * VENDOR FORM ARRAY
   */

  public static readonly VENDOR_BASIC_INFO = 'additionalDataBasicInfo';
  public static readonly VENDOR_POSTAL_ADDRESS = 'additionalDataPostalAddress';
  public static readonly VENDOR_REMIT_ADDRESS = 'additionalDataRemitAddress';
  public static readonly VENDOR_W9_INFO = 'additionalDataW9Info';
  public static readonly VENDOR_PAYMENT_INFO = 'additionalDataPaymentInfo';

  public readonly VENDOR_W9_FORM_STRING_NAME = 'W9 Form';
  public readonly CLASSIFICATION_FIELD_NAME = 'Diversity Certification';
  public readonly VENDOR_W9_FORM_VENDOR = 'W9 Form';
  public readonly RECEIPT = 'Receipt';


  public static readonly BILL_PO_LIST_MODAL = 'BILL_PO_LIST_MODAL';
  public static readonly EXPENSE_DRAFT_LIST_MODAL = 'EXPENSE_DRAFT_LIST_MODAL';
  public static readonly PO_DRAFT_LIST_MODAL = 'PO_DRAFT_LIST_MODAL';
  public static readonly PO_RECEIPT_DRAFT_LIST_MODAL = 'PO_RECEIPT_DRAFT_LIST_MODAL';
  public static readonly BILL_DRAFT_LIST_MODAL = 'CREATE_BILL_DRAFT_LIST_MODAL';
  public static readonly CREDIT_NOTE_DRAFT_LIST_MODAL = 'CREDIT_NOTE_DRAFT_LIST_MODAL';

  /**
   * DROPDOWN
   */

  public static readonly ADD_NEW = 'Add New';

  /**
   * PAYMENT PROVIDER CONFIGURATION
   */
  public static readonly PROVIDER_CONNECTED = 'C';
  public static readonly PROVIDER_NOT_CONNECTED = 'N';
  public readonly PROVIDER_CONNECTED = 'A';
  public readonly PROVIDER_NOT_CONNECTED = 'N';
  public readonly LABEL_PROVIDER_CONNECTED = 'Connected';
  public readonly LABEL_PROVIDER_NOT_CONNECTED = 'Not Connected';

  /**
   *PAYMENT MODULE FIELD
   */

  public static readonly PAYMENTAMOUNT = 'paymentAmount';
  public static readonly COMMENT = 'comment';
  public static readonly PAYMENT_TYPE = 'paymentType';
  public static readonly REFERENCE_NUMBER = 'referenceNumber';
  public static readonly APLICABLE_DISCOUNT_AMOUNT_JSON_PROPERTY = 'bill.applicableDiscountAmount';

  public static readonly DATE = 'date';
  public static readonly HOURS = 'hours';
  public static readonly MIN = 'mins';
  public static readonly AMPM = 'AMPM';


  public static readonly PAYMENTAMOUNT_CHILD_RECOARD = 'txn.paymentAmount';
  public static readonly COMMENT_CHILD_RECOARD = 'txn.comment';
  public static readonly PAYMENT_TYPE_CHILD_RECOARD = 'txn.paymentType';
  public static readonly REFERENCE_NUMBER_CHILD_RECOARD = 'txn.referenceNumber';
  public static readonly APLICABLE_DISCOUNT_AMOUNT_JSON_PROPERTY_CHILD_RECOARD = 'txn.applicableDiscountAmount';

  //report ids

  public readonly BILLABLE_TRANSACTION = 15;

  /**
   * INBOX RELATED CONSTANT
   */

  public static readonly TO_PROCESSED_LIST = 'N';
  public static readonly PROCESSES_LIST = 'P';
  public static readonly DELETED_LIST = 'D';
  public static readonly TO_PROCESS_TAB_INDEX = 0;
  public static readonly PROCESS_TAB_INDEX = 1;
  public static readonly DELETED_TAB_INDEX = 2;
  public static readonly CLIP_BORD_COPY_OVERLAY_CLOSED_TIME_OUT = 1000;
  public readonly MENU_INBOX = 'Inbox';
  public static readonly INBOX_ATTACHMENT = 'attachment';
  public static readonly ATTACHMENT_ID = 'attachmentIdList';
  public static readonly DOCUMENT_TYPE = 'documentType';
  public static readonly VENDOR_ID = 'vendorId';
  public static readonly DOCUMENT_ID = 'documentId';
  public static readonly ATTACHMENT_TYPE_ID_FOR_VENDOR = 'vendorAttachmentTypeId';
  public static readonly FILE = 'file';
  public static readonly EXPENSE_SECTION_ID = 4;
  public readonly EXPENSE_SECTION_ID = 4;
  public static readonly VENDOR_SECTION_ID = 6;
  public readonly VENDOR_SECTION_ID = 6;
  public static readonly ZERO = 0;
  public static readonly INITIAL_ITEM_DETAIL_COUNT = 10;
  public static readonly ONE = 1;
  public static readonly TWO = 2;
  public readonly ZERO = 0;
  public readonly ONE = 1;
  public readonly TWO = 2;
  public static readonly TAB_INDEX_TO_PROCESS = 0;
  public static readonly TAB_INDEX_PROCESSED = 1;
  public static readonly TAB_INDEX_DELETED = 2;
  public readonly TAB_INDEX_TO_PROCESS = 0;
  public readonly TAB_INDEX_PROCESSED = 1;
  public readonly TAB_INDEX_DELETED = 2;
  public static readonly COMPONENT_TO_PROCESS = 'toProcessListComponent';
  public static readonly COMPONENT_PROCESSED = 'processedListComponent';
  public static readonly COMPONENT_DELETED = 'deletedListComponent';
  public static readonly PAPERTRL_DOMAIN = '@papertrl.com';
  public readonly NOT_CONFIG_EMAIL = 'Email Not Configured.';
  public static readonly PAYMENT_TYPE_CHECK = 2;
  public static readonly PAYMENT_TYPE_ACH = 1;
  public static readonly PAYMENT_TYPE_VIRTUAL_CARD = 3;
  public static readonly PDF = 'application/pdf';
  public readonly PDF = 'application/pdf';
  public static readonly VIRTUAL_SCROLLER_TO_PROCESS_LIST = 'toProcessed';
  public static readonly VIRTUAL_SCROLLER_PROCESS_LIST = 'processedList';
  public static readonly VIRTUAL_SCROLLER_DELETED_LIST = 'deletedListRef';
  public static readonly KEY_DELETED_LIST = 'deletedList';
  public static readonly CHECK_BOX_REFERENCE = 'checkbox';

  /*
  Bill VALIDATION MESSAGE----->
   */
  public static INVALID_DATE_FORMAT_MSG = 'Invalid bill date, date should be match the selected format.';
  public static INVALID_FILE_FORMAT_MSG = 'Invalid file format. Please upload only PDF, JPG, JPEG, or PNG files.';
  public static PENDING_FILE_UPLOADS = 'You have pending file uploads. Closing the page now will cancel the upload process.';
  public static UPLOAD_TEMPLATE_FILE = 'Please Upload the template file.';


  /*
  Feature Constants
   */
  public static CONFIDENTIAL_DOC_LABEL = 'Enable access to confidential documents';

  /*
    Item management constant
   */
  public static ITEM_TYPE_ID_INVENTORY = 1;
  public static ASSET_ACCOUNT_CONTROLLER = 'inventoryAssetAccount';
  public static EXPENSE_ACCOUNT_CONTROLLER = 'expenseAccount';

  /*  Status Icon IDs
  * */
  public static APPROVE_ICON = 5;
  public static REJECT_ICON = 4;
  public static REASSING = 3;


  /*
    AUTOMATION CONFIGURATION
   */
  public static EVENT_ITEM_LINE_DESCRIPTION_ID = 16;
  public static EVENT_EXPENSE_LINE_DESCRIPTION_ID = 15;
  public static EVENT_TYPE_ID_ASSIGN_TO = 7;
  public static EVENT_TYPE_ID_SUBMIT = 1;
  public static EVENT_TYPE_ID_FINAL_APPROVE = 8;
  public static FIELD_ID_DESCRIPTION = 102;
  public static FORM_CONTROL_ID = 'id';
  public static EXPENSE_COST_DISTRIBUTION_STR = 'expenseCostDistribution';
  public static ITEM_COST_DISTRIBUTION_STR = 'itemCostDistribution';
  public readonly EXPENSE_COST_DISTRIBUTION_STR = 'expenseCostDistribution';
  public readonly ITEM_COST_DISTRIBUTION_STR = 'itemCostDistribution';
  public static DESCRIPTION_CONTROLLER = 'description';

  /*
  PO Price Variance
   */
  public static PO_PRICE_VARIANCE_CONTROLLER = 'priceVariance';
  public static FIXED_AMOUNT_STR = 'Fixed Amount';
  public static PERCENTAGE_STR = 'Percentage';
  public static VENDOR_ID_CONTROLLER = 'vendorId';
  public readonly PO_PRICE_VARIANCE_KEY_FOR_CHECK_EXIST = 'poPriceVarianceKey';
  public static PO_PRICE_VARIANCE_KEY_FOR_CHECK_EXIST = 'poPriceVarianceKey';
  public readonly PO_PRICE_VARIANCE_KEY_FOR_DELETE = 'poPriceVarianceKeyForDelete';
  public static PO_PRICE_VARIANCE_KEY_FOR_DELETE = 'poPriceVarianceKeyForDelete';
  public readonly EXCEED_BIlL_AMOUNT = 'Bill amount already exceeds the remaining ceiling of the selected PO.';


  public static OBJECT_TYPE_ACCOUNT = 'OBJECT_TYPE_ACCOUNT';
  public static OBJECT_TYPE_ITEM = 'OBJECT_TYPE_ITEM';
  public static OBJECT_TYPE_ITEM_INVENTORY = 'OBJECT_TYPE_ITEM_INVENTORY';
  public static OBJECT_TYPE_ITEM_NON_INVENTORY = 'OBJECT_TYPE_ITEM_NON_INVENTORY';
  public static OBJECT_TYPE_ITEM_SERVICE = 'OBJECT_TYPE_ITEM_SERVICE';
  public static OBJECT_TYPE_ITEM_OTHER = 'OBJECT_TYPE_ITEM_OTHER';
  public static CHECK_PAYMENT_OBJECT = 'CHECK_PAYMENT_OBJECT';
  public static CARD_PAYMENT_OBJECT = 'CARD_PAYMENT_OBJECT';
  public static OBJECT_TYPE_UOM = 'OBJECT_TYPE_UOM';
  public static OBJECT_TYPE_PO_RECEIPT = 'OBJECT_TYPE_PO_RECEIPT';
  public static OBJECT_TYPE_PO = 'OBJECT_TYPE_PO';
  public static OBJECT_TYPE_EXPENSE = 'OBJECT_TYPE_EXPENSE';
  public static OBJECT_TYPE_VENDOR = 'OBJECT_TYPE_VENDOR';
  public static OBJECT_TYPE_PROJECT = 'OBJECT_TYPE_PROJECT';
  public static OBJECT_TYPE_BILL = 'OBJECT_TYPE_BILL';
  public static OBJECT_TYPE_BILL_PAYMENT = 'OBJECT_TYPE_BILL_PAYMENT';
  public static OBJECT_TYPE_PAYMENT = 'OBJECT_TYPE_PAYMENT';
  public static OBJECT_TYPE_CARD_PAYMENT = 'OBJECT_TYPE_CARD_PAYMENT';
  public static OBJECT_TYPE_CHECK_PAYMENT = 'OBJECT_TYPE_CHECK_PAYMENT';
  public static OBJECT_TYPE_TERM = 'OBJECT_TYPE_TERM';
  public static OBJECT_TYPE_ATTACHMENT = 'OBJECT_TYPE_ATTACHMENT';
  public static OBJECT_TYPE_ITEM_CATEGORY = 'OBJECT_TYPE_ITEM_CATEGORY';
  public static OBJECT_TYPE_DEPARTMENT = 'OBJECT_TYPE_DEPARTMENT';
  public static OBJECT_TYPE_ADDITIONAL_FIELD = 'OBJECT_TYPE_ADDITIONAL_FIELD';
  public static OBJECT_TYPE_ADDITIONAL_FIELD_OPTION = 'OBJECT_TYPE_ADDITIONAL_FIELD_OPTION';

  public static OBJECT_NAME_TYPE_ACCOUNT = 'Account';
  public static OBJECT_NAME_TYPE_ITEM = 'Item';
  public static OBJECT_NAME_TYPE_ITEM_INVENTORY = 'Item Inventory';
  public static OBJECT_NAME_TYPE_ITEM_NON_INVENTORY = 'Item Non Inventory';
  public static OBJECT_NAME_TYPE_ITEM_SERVICE = 'Item Service';
  public static OBJECT_NAME_TYPE_ITEM_OTHER = 'Item Other';
  public static CHECK_NAME_PAYMENT_OBJECT = 'Check Payment';
  public static CARD_NAME_PAYMENT_OBJECT = 'Card Payment';
  public static OBJECT_NAME_TYPE_UOM = 'UOM';
  public static OBJECT_NAME_TYPE_PO_RECEIPT = 'Purchase Order Receipt';
  public static OBJECT_NAME_TYPE_PO = 'Purchase Order';
  public static OBJECT_NAME_TYPE_EXPENSE = 'Expense';
  public static OBJECT_NAME_TYPE_VENDOR = 'Vendor ';
  public static OBJECT_NAME_TYPE_PROJECT = 'Project';
  public static OBJECT_NAME_TYPE_BILL = 'Bill';
  public static OBJECT_NAME_TYPE_BILL_PAYMENT = 'Bill Payment';
  public static OBJECT_NAME_TYPE_PAYMENT = 'Payment';
  public static OBJECT_NAME_TYPE_TERM = 'Term';
  public static OBJECT_NAME_TYPE_ATTACHMENT = 'Attachment';
  public static OBJECT_NAME_TYPE_ITEM_CATEGORY = 'Item Category';
  public static OBJECT_NAME_TYPE_DEPARTMENT = 'Department';
  public static OBJECT_NAME_TYPE_ADDITIONAL_FIELD = 'Additional Field';
  public static OBJECT_NAME_TYPE_ADDITIONAL_FIELD_OPTION = 'Additional Field Option';

  //transaction type
  public static TRANSACTION_TYPE_PO = 'PO_AWAITING_APPROVAL';
  public static TRANSACTION_TYPE_EXPENSE = 'EXPENSE_AWAITING_APPROVAL';
  public static TRANSACTION_TYPE_BILL = 'BILLS_AWAITING_APPROVAL';

  public readonly TRANSACTION_TYPE_PO = 'PO_AWAITING_APPROVAL';
  public readonly TRANSACTION_TYPE_EXPENSE = 'EXPENSE_AWAITING_APPROVAL';
  public readonly TRANSACTION_TYPE_BILL = 'BILLS_AWAITING_APPROVAL';


  public static FIELD_ID_ITEM_LIST = [113, 115];
  public static FIELD_ID_ACCOUNT_NAME_LIST = [112, 114, 116];
  public static FIELD_ID_PROJECT_CODE_LIST = [130];

  //Common Date Format
  public static LOCAL_PRAM_US_ENGLISH = 'en-US';
  public static LOCAL_PRAM_BRITISH_ENGLISH = 'en-GB';
  public static LOCAL_PRAM_SWEDEN = 'sv-SE';

  public static PAYMENT_RECIPIENT_TYPES = [
    {name: 'Individual', id: 'Individual'},
    {name: 'Business', id: 'Business'}
  ];

  public static PAYMENT_ACCOUNT_TYPES = [
    {name: 'Checking', id: 'Checking'},
    {name: 'Savings', id: 'Savings'}
  ];

  public readonly MONTH_LIST_NUMERIC = [
    {name: '1 Month', id: 1},
    {name: '2 Months', id: 2},
    {name: '3 Months', id: 3},
    {name: '4 Months', id: 4},
    {name: '5 Months', id: 5},
    {name: '6 Months', id: 6},
    {name: '7 Months', id: 7},
    {name: '8 Months', id: 8},
    {name: '9 Months', id: 9},
    {name: '10 Months', id: 10},
    {name: '11 Months', id: 11},
    {name: '12 Months', id: 12},
  ];


  public static PHONE_NO_REQUIRED_CONTROLS = ['pocPhone', 'mobileNumber', 'contactNumber', 'telephoneNo'];
  public static YES_NO_DROPDOWN = [{label: 'Yes', value: 'y'}, {label: 'No', value: 'n'}];

  /* These constants belong to setting screen*/
  public static COMPANY_PROFILE = 'CompanyProfile';
  public static DEPARTMENTS = 'Department';
  public static GENERAL_SETTINGS = 'Field';
  public static FIELDS_CONFIGURATION = 'General';
  public static ONLINE_PAYMENTS = 'Payment';
  public static FEATURE_SETTINGS = 'Feature';
  public static REMINDERS = 'Reminder';
  public static FUNDING_ACCOUNTS = 'Funding';

  public static TAB_INDEX_OF_COMPANY_PROFILE = 0;
  public static TAB_INDEX_OF_DEPARTMENTS = 1;
  public static TAB_INDEX_OF_GENERAL_SETTINGS = 2;
  public static TAB_INDEX_OF_FIELDS_CONFIGURATION = 3;
  public static TAB_INDEX_OF_ONLINE_PAYMENTS = 4;
  public static TAB_INDEX_OF_FEATURE_SETTINGS = 5;
  public static TAB_INDEX_OF_FUNDING_ACCOUNTS = 6;
  public static TAB_INDEX_OF_REMINDERS = 7;


  // Confirmation massage

  public readonly DEPARTMENT_CODES_CONFIRMATION_MASSAGE_YES = 'Click \'Yes\' to use this department code on all line items, overwriting any existing department codes';
  public readonly DEPARTMENT_CODES_CONFIRMATION_MASSAGE_NO = 'Click \'No\' to only use this department code on lines where the department code is blank';

  public readonly PROJECT_CODES_CONFIRMATION_MASSAGE_NO = 'Click  \'No\' to only use this project code on lines where the project code is blank';
  public readonly PROJECT_CODES_CONFIRMATION_MASSAGE_YES = 'Click \'Yes\' to use this project code on all line items, overwriting any existing project codes';

  /* These constants belong to funding account create/edit screen*/
  public static ACH_PAYMENT_TYPE = 1;
  public readonly ACH_PAYMENT_TYPE = 1;
  public static CHECK_PAYMENT_TYPE = 2;
  public static VIRTUAL_CARD_PAYMENT_TYPE = 3;
  public static DIGITAL_CARD_PAYMENT_TYPE = 10;

  public static ID_FUNDING_ACCOUNT_EDIT = 1;
  public static ID_FUNDING_ACCOUNT_MARK_AS_DEFAULT = 2;
  public static ID_FUNDING_ACCOUNT_DELETE = 3;
  public static ID_FUNDING_ACCOUNT_ACTIVATE = 4;
  public static ID_FUNDING_ACCOUNT_INACTIVATE = 5;

  public static BANK_PAYMENT_TYPES = 'bankPaymentTypes';
  public static SEQUENCE_NUMBER = 'checkSequenceNumber';
  public static VIRTUAL_CARD_ID = 'virtualCardAccountId';
  public static DIGITAL_CARD_ID = 'digitalCardAccountId';
  public static FILE_URL = 'fileUrl';
  public static COMPANY_ID = 'companyId';
  public static COMPANY_NAME = 'companyName';
  public static BANK_ID = 'bankId';
  public static ACCOUNT_NICK_NAME = 'accountNicName';
  public static ACCOUNT_NUMBER = 'accountNo';
  public static BANK_ROUTING_NUMBER = 'bankRoutingNo';
  public static TRANSIT_NUMBER = 'transitNo';

  public static US_BANK = 1;

  // inbox

  public static FILTER_VALUE_INBOX_CREATED_BY = 'inbox.emailUserName';
  public static FILTER_VALUE_INBOX_CREATED_ON = 'inbox.createdOn';
  public static UPLOADED_FILE_SUCCESS_STATUS = 'success';
  public static UPLOADED_FILE_FAIL_STATUS = 'fail';
  public static FAIL_STATUS = 'fail';
  public static SUCCESS_STATUS = 'N';
  public static FAIL = 'D';


  public static FLITER_VALUE_SORT_BY = 'Sort by';
  public static FLITER_VALUE_SORT_ORDER = 'Sort order';
  public static FLITER_LABEL_NEWEST_ON_TOP = 'Newest on top';
  public static FLITER_LABEL_OLDEST_ON_TOP = 'Oldest on top';
  public static FLITER_LABEL_SUBMITED_BY = 'Submited by';
  public static FLITER_LABEL_DATE = 'Date';
  public static FILTER_LABEL_A_TO_Z = 'A to Z';
  public static FILTER_LABEL_Z_TO_A = 'Z to A';

  public static PAPERTRL_SYSTEM_USERS = 1;
  public static INTEGRATED_PAYABLE_USERS = 2;
  public static HYBRID_USERS = 3;


}
