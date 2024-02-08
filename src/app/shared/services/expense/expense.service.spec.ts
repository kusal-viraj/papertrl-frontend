import {ExpenseService} from "./expense.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ApiEndPoint} from "../../utility/api-end-point";
import {TestBed} from "@angular/core/testing";
import {AppConstant} from "../../utility/app-constant";
import {MessageService} from "primeng/api";
import {RouterTestingModule} from "@angular/router/testing";

describe('Expense Service', () => {

  let expenseService: ExpenseService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [ExpenseService, MessageService]
    });
    expenseService = TestBed.inject(ExpenseService);
    httpTestingController = TestBed.inject<HttpTestingController>(HttpTestingController);
  })


  it('should create a credit card', () => {
    const cardDetails = {vendorId: 1, cardNo: '1234', employee: 'test@gmail.com'}
    expenseService.addCard(cardDetails).subscribe(value => {
      expect(value.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS);
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_save_credit_card_for_employee`);
    expect(req.request.method).toEqual("POST");
    req.flush({})
  });

  it('should validate duplicate credit card', () => {
    const cardDetails = {vendorId: 1, cardNo: '1234', employee: 'test@gmail.com'}
    expenseService.addCard(cardDetails).subscribe((value: any) => {
      expect(value.status).toBe(AppConstant.HTTP_RESPONSE_STATUS_WARNING);
      expect(value.body.message).toBe('Credit card number already exists, please enter a new one');
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_save_credit_card_for_employee`);
    expect(req.request.method).toEqual("POST");
    req.flush({message: 'Credit card number already exists, please enter a new one'},
      {status: 207, statusText: 'Credit card number already exists, please enter a new one'})
  });

  it('should validate the card number is missing', () => {
    const cardDetails = {vendorId: 1, cardNo: null, employee: 'test@gmail.com'}
    expenseService.addCard(cardDetails).subscribe((value: any) => {
      expect(value.status).toBe(AppConstant.HTTP_RESPONSE_STATUS_WARNING);
      expect(value.body.message).toBe('Card number cannot be empty');
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_save_credit_card_for_employee`);
    expect(req.request.method).toEqual("POST");
    req.flush({message: 'Card number cannot be empty'}, {status: 207, statusText: 'Card number cannot be empty'})
  });

  it('should validate the employee is missing', () => {
    const cardDetails = {vendorId: 1, cardNo: '1234', employee: null}
    expenseService.addCard(cardDetails).subscribe((value: any) => {
      expect(value.status).toBe(AppConstant.HTTP_RESPONSE_STATUS_WARNING);
      expect(value.body.message).toBe('Employee cannot be empty');
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_save_credit_card_for_employee`);
    expect(req.request.method).toEqual("POST");
    req.flush({message: 'Employee cannot be empty'}, {status: 207, statusText: 'Employee cannot be empty'})
  });

  it('should get credit card by id', () => {
    const cardId = 1;
    expenseService.getCardDetail(cardId).subscribe((value: any) => {
      expect(value.status).toBe(AppConstant.HTTP_RESPONSE_STATUS_SUCCESS);
      expect(value.body.id).toBe(cardId);
      expect(value.body.cardNo).toBe('1234');
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_get_credit_card_for_employee?cardId=${cardId}`);
    expect(req.request.method).toEqual("GET");
    const obj = {
      cardNo: "1234",
      employee: {id: "test@gmail.com", name: "Testa(emp1)"},
      employeeId: "test@gmail.com",
      employeeName: "Testa(emp1)",
      id: 1,
      status: "A",
      vendorId: 1
    }
    req.flush(obj)
  });

  it('should update card details', () => {
    const cardDetails = {
      "id": 1,
      "vendorId": 1,
      "cardNo": "12345",
      "employee": {"id": "test@gmail.com", "name": "Testa(emp1)"}
    };
    expenseService.updateCard(cardDetails).subscribe((value: any) => {
      expect(value.status).toBe(AppConstant.HTTP_RESPONSE_STATUS_SUCCESS);
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_update_credit_card_for_employee`);
    expect(req.request.method).toEqual("POST");
    req.flush({})
  });

  it('should validate duplicate card in update', () => {
    const cardDetails = {
      "id": 1,
      "vendorId": 1,
      "cardNo": "12345",
      "employee": {"id": "test@gmail.com", "name": "Testa(emp1)"}
    };
    expenseService.updateCard(cardDetails).subscribe((value: any) => {
      expect(value.status).toBe(AppConstant.HTTP_RESPONSE_STATUS_WARNING);
      expect(value.body.message).toBe('Credit card number already exists, please enter a new one');
    });
    const req = httpTestingController.expectOne(`${ApiEndPoint.API_URL}/vendor_portal/sec_update_credit_card_for_employee`);
    expect(req.request.method).toEqual("POST");
    req.flush({message: 'Credit card number already exists, please enter a new one'},
      {status: 207, statusText: 'Credit card number already exists, please enter a new one'})
  });

  afterAll(() => {
    httpTestingController.verify();
  })
})
