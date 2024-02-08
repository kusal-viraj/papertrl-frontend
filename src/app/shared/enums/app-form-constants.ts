export enum AppFormConstants {
  BILL_NO = 'billNo',
  BILL_DATE = 'billDate',
  BILL_AMOUNT = 'billAmount',
  BILL_DATE_STR = 'billDateStr',
  BILL_DATE_FORMAT = 'billDateFormat',
  INVOICE_DATE_FORMAT = 'invoiceDateFormat',
  BILL_ATTACHMENT_ID = 'billAttachmentId',
  BILL_ITEM_COST_DISTRIBUTION = 'billItemCostDistributions',
  BILL_EXPENSE_COST_DISTRIBUTION = 'billExpenseCostDistributions',
  DUE_DATE_STR = 'dueDateStr',
  DUE_DATE = 'dueDate',
  NET_DAYS_DUE = 'netDaysDue',
  DISCOUNT_DAYS_DUE = 'discountDaysDue',
  TEMPLATE_ID = 'templateId',
  ADDITIONAL_NOTES = 'additionalNotes',

  PO_ID = 'poId',
  PO_RECEIPT_ID = 'receiptId',
  PO_RECEIPT = 'poReceipt',
  PO_NUMBER = 'poNumber',
  PROJECT_CODE_ID = 'projectCodeId',

  FIELD_VALUE = 'fieldValue',
  FIELD_ID = 'fieldId',
  FIELD_NAME = 'fieldName',
  DISPLAY_ORDER = 'displayOrder',
  SECTION_ID = 'sectionId',
  MULTIPLE = 'multiple',
  FIELD_TYPE_ID = 'fieldTypeId',
  ADDITIONAL_DATA = 'additionalData',
  CREATE_DETAILS = 'createDetails',
  BILL_ITEM_DETAILS = 'billItemDetails',
  ATTACHMENT = 'attachment',
  ATTACHMENT_NAME = 'attachmentName',

  ID = 'id',
  DISCOUNT_PERCENTAGE = 'discountPercentage',
  TERM = 'term',
  TAX = 'tax',
  TAX_AMOUNT = 'taxAmount',
  AD_HOCK_WORKFLOW_DETAILS = 'adHocWorkflowDetails',
  APPROVAL_USER = 'approvalUser',
  APPROVAL_ORDER = 'approvalOrder',
  REMAINING_CELING = 'remainingCeling',
  REMAINING_PO_CEILING = 'remainingPoCeiling',
  TERM_NAME = 'termName',
  TENANT_ID = 'tenantId',
  EVENT = 'event',
  DISTRIBUTION_COST_TOTAL = 'distributionCostTotal',
  GROSS_AMOUNT = 'grossAmount',
  RECEIPT_ID = 'receiptId',
  VENDOR_ID = 'vendorId',
  TEMPLATE_NAME = 'templateName',
  DEPARTMENT_ID = 'departmentId',
  ACCOUNT_PERIOD_MONTH = 'accountPeriodMonth',
  ACCOUNT_PERIOD_YEAR = 'accountPeriodYear',
  SCHEDULE_TEMPLATE_ID = 'scheduleTemplateId',
  VENDOR_SCHEDULE_TEMPLATE_ID = 'vendorScheduleTemplateId',

  SYNC_USER_PASSWORD = 'sync_user_password',
  SYNC_USER_ID = 'sync_user_id',
  THIRD_PARTY_USER_NAME = 'thirdPartyUsername',
  THIRD_PARTY_PASSWORD = 'thirdPartyPassword',
  THIRD_PARTY_TENANT_ID = 'thirdPartyTenantId',
  THIRD_PARTY_COMPANY_NAME = 'thirdPartyCompanyName',
  THIRD_PARTY_COMPANY_ID = 'thirdPartyCompanyId',

  INTERVAL_VALUE = 'intervalValue',
  CUSTOM_INTERVAL_VALUE = 'customIntervalValue',
  RECURRING_OCCURRENCE = 'recurringOccurrence',
  OCCURRENCE_FREQUENT_STATUS = 'occurrenceFrequentStatus',
  GENERATION_FREQUENT_STATUS = 'generationFrequentStatus',
  RECURRING_DAY = 'recurringDay',
  RECURRING_END_DAY = 'recurringEndDate',
  RECURRING_DAY_OF_WEEK = 'recurringDayOfWeek',
  RECURRING_MONTH = 'recurringMonth',
  GENERATION_FREQUENT = 'generationFrequent',
  OCCURRENCE_FREQUENT = 'occurrenceFrequent',
  RECURRING_START_DATE = 'recurringStartDate',


  PREFIXES = 'prefixes',
  SEPARATOR_SYMBOL_ID = 'separatorSymbolId',
  RUNNING_NO = 'runningNo',
  SUFFIXES = 'suffixes',
  GROUP_CARD_LIST = 'groupedCardList',
  HEADER_ROW = 'headerRow',
  DATE_FORMAT = 'dateFormat',
  EMPLOYEE_ID = 'employeeId',
  EMPLOYEE = 'employee',
  FOUR_DIGITS_COLUMN = 'fourDigitsColumn',
  AMOUNT_COLUMN = 'amountColumn',
  DESCRIPTION_COLUMN = 'descriptionColumn',
  MERCHANT_COLUMN = 'merchantColumn',
  POSTING_DATE_COLUMN = 'postingDateColumn',
  TRANSACTION_DATE_COLUMN = 'transactionDateColumn',
  STATEMENT_ID = 'statementId',
  CARD_NO = 'cardNo',
  ACCOUNT_CHANGED = 'accountChanged',
  ACCOUNT_ID = 'accountId',
  PRODUCT_ID = 'productId',
  ITEM_ID = 'itemId',
  UOM_ID = 'uomId',
  ITEM_NAME = 'itemName',
  ITEM_NUMBER = 'itemNumber',
  VENDOR_ITEM_NUMBER = 'vendorItemNumber',
  ACCOUNT_NAME = 'accountName',
  ACCOUNT_NUMBER = 'accountNumber',

  // Purchase Order Header Fields
  PO_HEADER_SUBMIT_DATE = 'poDate',
  PO_HEADER_DELIVERY_DATE = 'deliveryDate',
  PO_HEADER_CONTACT_NUMBER = 'pocPhone',
  PO_HEADER_CONTACT_PERSON = 'pocName',
  PO_HEADER_BILLING_ADDRESS = 'billingAddress',
  PO_HEADER_SHIPPING_ADDRESS = 'shippingAddress',
  NOTES = 'notes',

  // Purchase Order Line Fields
  DESCRIPTION = 'description',
  BILLABLE = 'billable',
  TAXABLE = 'taxable',
  PO_LINE_DISCOUNT = 'discountAmount',

  // Expense Header Fields
  EXPENSE_HEADER_BUSINESS_PURPOSE = 'businessPurpose',
  EXPENSE_HEADER_FROM = 'startFrom',
  EXPENSE_HEADER_TO = 'endDate',
  EXPENSE_HEADER_REPORT_NAME = 'reportName',

  // EXPENSE_LINE_ITEM
  EXPENSE_LINE_RECEIPT = 'receiptController',
  EXPENSE_LINE_DATE = 'expenseDate',
  EXPENSE_LINE_MERCHANT = 'merchant',
  EXPENSE_LINE_EXPENSE_TYPE = 'expenseType',
  EXPENSE_LINE_NO_OF_MILES = 'mileage',
  EXPENSE_LINE_MILEAGE_RATE = 'mileageRate',

  // Bill Line Fields
  PROJECT_CODE = 'projectId',
  BILL_LINE_PO_RECEIPT = 'poReceiptIdList',
  AMOUNT = 'amount',
  FOCUS_LISTENER= 'focusListener',
  PATCH_SET_FIELD_FULL_OBJECT = 'patchSetFieldFullObject',
  QTY = 'Qty',
  RATE = 'rate',


  HASH_NUMBER = 'hash',
  TABLE_ACTION = 'tableAction',

}
