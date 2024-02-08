import {defer} from 'rxjs';
import {Validators} from '@angular/forms';
import {AppConstant} from "../utility/app-constant";
import {PatternValidator} from "./pattern-validator";

export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export function okResponse() {
  return {body: {}, status: 200};
}

export function createResponse() {
  return {body: {}, status: 201};
}

export function falseResponse() {
  return {body: false, status: 200};
}

export function employeeResponse() {
  const employees = [
    {id: 'test@gmail.com', name: 'Testa'},
    {id: 'test2@gmail.com', name: 'Testa2'},
  ];
  return {body: employees, status: 200};
}

export function cardResponse() {
  const cards = [
    {id: '1234', name: 'XXXX-XXXX-XXXX-1234'},
  ];
  return {body: cards, status: 200};
}

export function vendorResponse() {
  const vendors = [
    {name: 'Testing Vendor Name', id: 1},
    {name: 'Dell Laptops', id: 2}
  ];
  return {body: vendors, status: 200};
}

export function termResponse() {
  const terms = [
    {name: 'Due to Bill', id: 1},
    {name: 'Other', id: 10}
  ];
  return {body: terms, status: 200};
}

export function itemNameResponse() {
  const terms = {
    id: 4,
    createdBy: 'test@gmail.com',
    createdOn: 1633360249000,
    updateBy: 'doheke6845@revutap.com',
    updateOn: 1648634804000,
    name: 'Item Name Chair',
    itemNumber: 'ITM-123456',
    taxable: false,
    partnerService: true,
    buyingPrice: 0.00,
    salesPrice: 0.00,
    status: 'A',
    expenseAccount: 6,
    uomId: 4,
    itemTypeId: {
      id: 1,
      name: 'Inventory',
      description: 'Product you buy and/or sell and that you track quantities of.',
      status: 'A',
      icon: 'fa fa-shopping-basket'
    },
    parentId: 3,
    subLevel: 1,
    vendorId: 4,
    inventoryAssetAccount: 1,
    updateImage: false
  };
  return {body: terms, status: 200};
}

export function cardDetailsResponse() {
  const cardDetails = {
    'id': 1,
    'vendorId': 1,
    'cardNo': '12345',
    'employee': {'id': 'test@gmail.com', 'name': 'Testa(emp1)'}
  };
  return {body: cardDetails, status: 200};
}

export function getUnSubmitReceiptListResponse(): any {
  const returnData = [
    {ocrRunningStatus: 'N', id: 1},
    {ocrRunningStatus: 'N', id: 2}
  ];
  return {body: returnData, status: 200};
}

export function getReceiptDetailResponse(): any {
  const receiptDetail = {
    id: 1, vendorId: 2, cardNo: '1234', transactionDateStr: '12/12/2022', amount: 150, merchant: 'Nike',
    description: 'Lorem Ipsum'
  };

  return {body: receiptDetail, status: 200};
}

export function fileResponse() {
  return {data: new Blob(), status: 200};
}

export function documentTypeResponse() {
  const documents = [

    {id: 1, name: "Bill"},
    {id: 9, name: "Credit Card"},
    {id: 4, name: "Expense Report"},
    {id: 11, name: "Inbox"},
    {id: 10, name: "Online Payment"},
    {id: 2, name: "Purchase Order"},
    {id: 6, name: "Vendor"}
  ]
  return {body: documents, status: 200}
}

export function eventTypeResponse() {
  const documents = [
    {id: 1, name: 'in pending'},
  ];
  return {body: documents, status: 200};
}

export function fieldListResponse() {
  const data = [
    {id: 2, name: 'Bill Amount'},
    {id: 3, name: 'Bill Date'},
  ];
  return {body: data, status: 200};
}

export function merchantSuggestions() {
  const data = ['Nike', 'Nike Shoes'];
  return {body: data, status: 200};
}

export function merchantWiseAccount() {
  const data = 10;
  return {body: data, status: 200};
}

export function dueDate() {
  const cards = [
    {dueDate: '10/16/2022'}
  ];
  return {body: cards, status: 200};
}

export const pendingInvoiceList = [
  {
    attachmentId: 8418,
    id: 12331,
    name: 'Invoice-template-doc-top.pdf',
    ocrRunningStatus: 'N',
    status: 'N'
  }
];

export const projectTaskList = [
  {id: 10, name: 'ABC (ABC Description)', otherName: 'ABC', inactive: true},
  {id: 11, name: 'ABCD (ABCD description)', otherName: 'ABCD', inactive: true}
];

export const accountList = [
  {id: 5, name: '123 -N/A', otherName: 'N/A', inactive: false},
  {id: 1, name: '123456789 -Account', otherName: 'Account', inactive: false},
  {id: 6, name: '123456789123456 -N/A', otherName: 'N/A', inactive: false}
];

export const receiptList = [
  {id: 49, name: '3-way-receipt-01'}
];

export function remainingPoCeiling() {
  const data = {poStatus: 'A', priceVariance: 200, remainingPoCeiling: 1500, remainingVariance: 200};
  return {body: data, status: 200};
}

export const poDropDownData = [
  {id: 1, name: 'PO-001'},
  {id: 2, name: 'PO-002'},
];

export const expenseMockObject = {
  reportName: 'report001',
  id: null,
  businessPurpose: null,
  notes: null,
  totalAmount: 1000,
  startFrom: null,
  endDate: null,
  uuid: null,
  receiptController: null,
  attachmentId: null,
  event: 1,
  vendorId: null,
  expenseAdditionalAttachmentIds: null,
  expenseDetails: [{
    expenseDate: null,
    merchant: null,
    projectCodeId: null,
    receiptAttachment: null,
    expenseType: null,
    accountId: null,
    amount: 1000,
    receipt: null,
    receiptController: null,
    attachmentId: null,
    billable: false,
    taxable: false,
    id: null
  }],
  additionalData: [],
  expenseAttachments: [],
  adHocWorkflowDetails: [{
    id: null,
    approvalOrder: 1,
    approvalGroup: null,
    approvalUser: 'doheke6845@revutap.com',
    completed: false,
    additionalData: [],
  }
  ],
};

export const mockBillObj = {
  vendorId: 4,
  templateId: null,
  poId: null,
  receiptId: null,
  billNo: 'Bill123',
  billDateFormat: 'dd/MM/yyyy',
  billDateStr: '5/5/2021',
  billDate: new Date('5/5/2021'),
  billAmount: 2000,
  term: 5,
  dueDate: '07/04/2021',
  remark: null,
  netDaysDue: null,
  discountPercentage: null,
  discountDaysDue: null,
  id: 12331,
  departmentId: 9,
  billAttachmentId: 8418,
  remainingCeling: 0,
  remainingPoCeiling: null,
  remainingVariance: null,
  poPriceVariance: null,
  dueDateStr: '07/04/2021',
  closePo: false,
  billExpenseCostDistributions: [{
    accountId: 6,
    accountNumber: 123456789123456,
    departmentId: null,
    description: null,
    amount: 1000,
    projectId: null,
    poReceiptId: null,
    billable: false,
    taxable: false
  }],
  billItemCostDistributions: [{
    itemId: 41,
    vendorItemNumber: 'MM',
    description: null,
    qty: 10,
    rate: 100,
    amount: 1000,
    departmentId: null,
    projectId: null,
    itemNumber: 'ITEM01',
    poReceiptId: null,
    billable: false,
    taxable: false
  }],
  adHocWorkflowDetails: [{
    id: null,
    approvalGroup: null,
    approvalUser: 'nevipi1772@lankew.com',
    approvalOrder: 1,
    completed: false,
  }],
  event: 1,
  billAttachmentName: null,
  attachment: null,
  distributionCostTotal: 2000,
  additionalData: [],
  existingAttachments: [],
  existingAdditionalFieldAttachments: [],
};

export const mockPoObj: any = {
  vendorId: 4,
  poNumber: 'PO01',
  netAmount: 1000.00,
  noOfLevels: 1,
  workflowLevel: 1,
  purchaseOrderAccountDetails: [{
    accountId: 6,
    accountNumber: 123456789123456,
    departmentId: null,
    description: null,
    amount: 1000,
    projectId: null,
    poReceiptId: null,
    billable: false,
    taxable: false
  }],
  purchaseOrderDetails: [{
    itemId: 41,
    vendorItemNumber: 'MM',
    description: null,
    qty: 10,
    rate: 100,
    amount: 1000,
    departmentId: null,
    projectId: null,
    itemNumber: 'ITEM01',
    poReceiptId: null,
    billable: false,
    taxable: false
  }],
  adHocWorkflowDetails: [{
    id: null,
    approvalGroup: null,
    approvalUser: 'nevipi1772@lankew.com',
    approvalOrder: 1,
    completed: false,
  }],
  event: 1,
  billAttachmentName: null,
  attachment: null,
  additionalData: [],
  existingAttachments: [],
  existingAdditionalFieldAttachments: [],
};

export const mockPoReceiptObj: any = {
  vendorId: 4,
  receiptNumber: 'PO01',
  poId: 1,
  totalAmount: 1000.00,
  noOfLevels: 1,
  workflowLevel: 1,
  poDate: '',
  notes: 'Sample Notes',
  attachmentId: 1,
  receivedBy: 'James',
  purchaseOrderReceiptAccountDetails: [
    {
      accountId: 1,
      accountName: '',
      accountNumber: '',
      description: '',
      amount: 1000,
      projectId: 1,
      additionalData: [],
      isSelectAccount: true,
      accountDetailId: 2,
    },
    {
      accountId: 1,
      accountName: '',
      accountNumber: '',
      description: '',
      amount: 1000,
      projectId: 1,
      additionalData: [],
      isSelectAccount: true,
      accountDetailId: 2,
    }
  ],
  poReceiptDetails: [
    {
      itemNumber: '',
      itemName: '',
      uom: '',
      receivedQty: 2,
      vendorItemNumber: 3,
      remainingQty: 2,
      unitPrice: 1000,
      description: '',
      amount: 3000,
      discountAmount: 50,
      poDetailId: 2,
      productId: 1,
      additionalData: [],
    },
    {
      itemNumber: '',
      itemName: '',
      uom: '',
      receivedQty: 2,
      vendorItemNumber: 3,
      remainingQty: 2,
      unitPrice: 1000,
      description: '',
      amount: 3000,
      discountAmount: 50,
      poDetailId: 2,
      productId: 1,
      additionalData: [],
    }
  ],
};

export const poRelatedDetails =
  {
    purchaseOrderReceiptAccountDetails: [
      {
        accountId: 1,
        accountName: '',
        accountNumber: '',
        description: '',
        amount: 1000,
        projectId: 1,
        additionalData: [],
        isSelectAccount: true,
        accountDetailId: 2,
      },
      {
        accountId: 1,
        accountName: '',
        accountNumber: '',
        description: '',
        amount: 1000,
        projectId: 1,
        additionalData: [],
        isSelectAccount: true,
        accountDetailId: 2,
      }
    ],
    poReceiptDetails: [
      {
        itemNumber: '',
        itemName: '',
        uom: '',
        receivedQty: 2,
        vendorItemNumber: 3,
        remainingQty: 2,
        unitPrice: 1000,
        description: '',
        amount: 3000,
        discountAmount: 50,
        poDetailId: 2,
        productId: 1,
        additionalData: [],
      },
      {
        itemNumber: '',
        itemName: '',
        uom: '',
        receivedQty: 2,
        vendorItemNumber: 3,
        remainingQty: 2,
        unitPrice: 1000,
        description: '',
        amount: 3000,
        discountAmount: 50,
        poDetailId: 2,
        productId: 1,
        additionalData: [],
      }
    ],
  };

export const itemDetails = [
  {
    id: 1,
    productId: 2,
    vendorItemNumber: 'VEND001',
    itemName: 'Sample01',
    qty: 2,
    itemNumber: 'ITEM0002',
    uomId: {},
    unitPrice: 200,
    departmentId: 2,
    description: 'Sample Description',
    discountAmount: '',
    amount: null,
    departmentName: 'PM',
    uomName: 'DAmith',
    poDetailId: 2,
    additionalData: [],
  },
  {
    id: 2,
    productId: 2,
    vendorItemNumber: 'VEND001',
    itemName: 'Sample01',
    qty: 3,
    itemNumber: 'ITEM0002',
    uomId: {},
    unitPrice: 300,
    departmentId: 2,
    description: 'Sample Description',
    discountAmount: '',
    amount: null,
    departmentName: 'PM',
    uomName: 'DAmith',
    poDetailId: 2,
    additionalData: [],
  },
  {
    id: 3,
    productId: 2,
    vendorItemNumber: 'VEND001',
    itemName: 'Sample01',
    qty: 3,
    itemNumber: 'ITEM0002',
    uomId: {},
    unitPrice: 200,
    departmentId: 2,
    description: 'Sample Description',
    discountAmount: '',
    amount: null,
    departmentName: 'PM',
    uomName: 'DAmith',
    poDetailId: 2,
    additionalData: [],
  },
  {
    id: 4,
    productId: 2,
    vendorItemNumber: 'VEND001',
    itemName: 'Sample01',
    qty: 4,
    itemNumber: 'ITEM0002',
    uomId: {},
    unitPrice: 300,
    departmentId: 2,
    description: 'Sample Description',
    discountAmount: '',
    amount: null,
    departmentName: 'PM',
    uomName: 'DAmith',
    poDetailId: 2,
    additionalData: [],
  },
];

export const mockCreditNoteObj: any = {
  id: 1,
  creditNoteNo: 'CDF01',
  creditNoteDate: new Date(),
  vendorId: 1,
  vendorEmail: 'sampole@gmail.com',
  comment: 'Comment01',
  itemGrossAmount: 1000,
  totalCredit: 100,
  taxAmount: 10,
  total: 100000,
  attachments: [],
  poId: 1,
  subTotal: 100000,
  additionalData: [],
  creditNoteItemDetails: [
    {
      id: 1,
      productId: 2,
      vendorItemNumber: 'VEND001',
      itemName: 'Sample01',
      qty: 2,
      itemNumber: 'ITEM0002',
      uomId: {},
      unitPrice: 200,
      departmentId: 2,
      description: 'Sample Description',
      discountAmount: '',
      amount: null,
      departmentName: 'PM',
      uomName: 'DAmith',
      poDetailId: 2,
      additionalData: [],
    }]
};

export const mockAccountObj: any = {
  accountType: 1,
  accountDetailType: 2,
  number: '100032',
  name: 'ACC',
  parentAccount: 6,
  description: 'DESC',
  isPurchaseAccount: true,
};

export const mockItemObject: any = {
  itemTypeId: 'ItemType100',
  itemNumber: '1000DC',
  name: 'Name',
  uomId: 1,
  taxable: true,
  parentId: 1,
  itemCategoryId: 2,
  buyingPrice: 1000,
  purchaseDescription: 'dcdcdcc',
  expenseAccount: 2,
  salesPrice: 20000,
  salesDescription: 'ccrfrrfff',
  incomeAccount: 2,
  inventoryAssetAccount: 500,
  vendorId: 1,
  id: 2,
  itemImage: new Blob(),
  img: '',
  updateImage: true,
  partnerService: true,
  commonItemDetails: [],
};

export const createUser: any = {
  email: 'abc@gmail.com',
  name: 'ABC',
  nicPassportNo: '515151',
  profilePic: '',
  approvalGroups: [],
  approvalGroupNames: 1,
  roleId: 6,
  status: 'A',
  password: '21354848488448@123',
  confirmPassword: '21354848488448',
  id: '123',
  file: [],
  appGroups: [],
  departments: []
};
