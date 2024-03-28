import {async, TestBed} from '@angular/core/testing';
import {BillsService} from "./bills.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {PrivilegeService} from "../privilege.service";
import {LoginLogoutService} from "../auth/login-logout.service";
import {RouterTestingModule} from "@angular/router/testing";
import {NotificationService} from "../notification/notification.service";
import {MessageService} from "primeng/api";
import {BillSubmitService} from "./bill-submit.service";

describe('BillSubmitService', () => {
  let billSubmitService: BillSubmitService;
  let httpTestController: HttpTestingController;

  const mockBillObj:any = {
    vendorId: 4,
    templateId: null,
    poId: null,
    receiptId: null,
    billNo: 'Bill123',
    billDateFormat: 'dd/MM/yyyy',
    billDateStr: '5/5/2021',
    billAmount: 2000,
    term: 5,
    dueDate: new Date(3434343),
    remark: null,
    netDaysDue: null,
    discountPercentage: null,
    discountDaysDue: null,
    id: 12331,
    departmentId: 9,
    billAttachmentId: '8418',
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
      workflowId: null,
    }],
    event: 1,
    billAttachmentName: null,
    attachment: null,
    distributionCostTotal: 2000,
    additionalData: [],
    existingAttachments: [],
    existingAdditionalFieldAttachments: [],
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [PrivilegeService, LoginLogoutService, NotificationService, MessageService, BillSubmitService]
    })
      .compileComponents();
    billSubmitService = TestBed.inject(BillSubmitService);
    httpTestController = TestBed.inject(HttpTestingController);
  }));

});
