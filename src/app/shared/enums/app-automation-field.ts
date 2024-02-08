export enum AppAutomationField {

  // VpVendorInvoice
  BILLS_BILL_NUMBER = 'invoiceNo',
  BILLS_BILL_AMOUNT = 'invoiceAmount',
  BILLS_VENDOR = 'vendorId',
  BILLS_TEMPLATE = 'templateId',
  BILLS_PO_NUMBER = 'poId',
  BILLS_PO_RECEIPT_NUMBER = 'grnMstId',
  BILLS_DATE_FORMAT = 'invoiceDateFormat',
  BILLS_BILL_DATE = 'invoiceDate',
  BILLS_PAYMENT_TERMS = 'term',
  BILLS_DUE_DATE = 'dueDate',
  BILLS_COMMENT = 'additionalNotes',
  BILLS_ITEM_CODE = 'itemId',
  BILLS_ITEM_NAME = 'description',
  BILLS_UNITS = 'qty',
  BILLS_UNIT_PRICE = 'rate',
  BILLS_TAX_AMOUNT = 'tax',


  // VpGrnMst
  PO_RECEIPTS_PO_RECEIPT_NUMBER = 'grnNumber',
  PO_RECEIPTS_PO_RECEIPT_DATE = 'grnDate',
  PO_RECEIPTS_VENDOR = 'vendorId',
  PO_RECEIPTS_PO_NUMBER = 'poId',
  PO_RECEIPTS_PO_DATE = 'poDate',
  PO_RECEIPTS_RECEIVED_BY = 'transporterName',
  PO_RECEIPTS_ITEM_NUMBER = 'itemNumber',
  PO_RECEIPTS_ITEM_NAME = 'description',
  PO_RECEIPTS_UOM = 'uomId',
  PO_RECEIPTS_REMAINING_QTY = 'remainingQty',
  PO_RECEIPTS_RECEIVED_QTY = 'receivedQty',
  PO_RECEIPTS_UNIT_PRICE = 'unitPrice',
  PO_RECEIPTS_AMOUNT = 'amount',
  PO_RECEIPTS_TOTAL_AMOUNT = 'totalAmount',
  PO_RECEIPTS_NOTES = 'note',


  // VpPurchaseOrderMst
  PO_PO_NUMBER = 'poNumber',
  PO_SUBMIT_DATE = 'createdOn',
  PO_VENDOR = 'vendorId',
  PO_PROJECT_TASK = 'projectCodeId',
  PO_DATE_OF_DELIVERY = 'deliveryDate',
  PO_CONTACT_NUMBER = 'pocPhone',
  PO_CONTACT_PERSON = 'pocName',
  PO_NOTES = 'notes',
  PO_SHIPPING_ADDRESS = 'shippingAddress',
  PO_BILLING_ADDRESS = 'billingAddress',
  PO_SELECT_ITEM = 'productId',
  PO_ITEM_NAME = 'description',
  PO_UOM = 'uomId',
  PO_QTY = 'qty',
  PO_PRICE = 'grossAmount',
  PO_DISCOUNT = 'discountAmount',
  PO_AMOUNT = 'amount',
  PO_TAX_AMOUNT = 'taxAmount',
  PO_DISCOUNT_AMOUNT = 'discountAmount',
  PO_NET_AMOUNT = 'netAmount',
  PO_STATUS = 'status',

  // VpExpenseMst
  EXPENSE_REPORT_NAME = 'reportName',
  EXPENSE_BUSINESS_PURPOSE = 'businessPurpose',
  EXPENSE_RECEIPT = 'receipt',
  EXPENSE_DATE = 'created_on',
  EXPENSE_MERCHANT = 'merchant',
  EXPENSE_PROJECT_TASK = 'projectAccountCode',
  EXPENSE_EXPENSE_TYPE = 'expenseType',
  EXPENSE_AMOUNT = 'total_amount',
  EXPENSE_NET_AMOUNT = 'amount',
  EXPENSE_NOTES = 'notes',
  EXPENSE_DESCRIPTION = 'description',

  // VpInvoicePayment
  BILL_PAYMENT_VENDOR = 'vendor',
  BILL_PAYMENT_INVOICE_NUMBER = 'invoiceNo',
  BILL_PAYMENT_PAYMENT_METHOD = 'paymentType',
  BILL_PAYMENT_PAYMENT_REFERENCE = 'paymentReferanceNo',
  BILL_PAYMENT_INVOICE_DATE = 'invoiceDate',
  BILL_PAYMENT_PAYMENT_DATE = 'paymentDate',
  BILL_PAYMENT_BALANCE_TO_BE_PAID = 'balanceToBePaid',
  BILL_PAYMENT_PAYMENT_AMOUNT = 'amount',
  BILL_PAYMENT_DISCOUNT_AMOUNT = 'discountAmount',
  BILL_PAYMENT_RECEIPT = 'receipt',


  // Field Option
  BILL_APPROVED_OPTION_ID = 74,


}
