import {async, TestBed} from '@angular/core/testing';
import {BillsService} from "./bills.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {PrivilegeService} from "../privilege.service";
import {LoginLogoutService} from "../auth/login-logout.service";
import {RouterTestingModule} from "@angular/router/testing";
import {NotificationService} from "../notification/notification.service";
import {MessageService} from "primeng/api";

describe('BillsService', () => {
  let billService: BillsService;
  let httpTestController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [BillsService, PrivilegeService, LoginLogoutService, NotificationService, MessageService]
    })
      .compileComponents();
    billService = TestBed.inject(BillsService);
    httpTestController = TestBed.inject(HttpTestingController);
  }));
});
