// import {ExpenseCreateComponent} from "../../expense/expense-create/expense-create.component";
// import {async, ComponentFixture, TestBed} from "@angular/core/testing";
// import {RouterTestingModule} from "@angular/router/testing";
// import {LoginComponent} from "../../auth/login/login.component";
// import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {HttpClientModule} from "@angular/common/http";
// import {HttpClientTestingModule} from "@angular/common/http/testing";
// import {InputMaskModule} from "primeng/inputmask";
// import {DropdownModule} from "primeng/dropdown";
// import {ButtonModule} from "primeng/button";
// import {TabViewModule} from "primeng/tabview";
// import {ConfirmDialogModule} from "primeng/confirmdialog";
// import {OverlayPanelModule} from "primeng/overlaypanel";
// import {RouterModule} from "@angular/router";
// import {CalendarModule} from "primeng/calendar";
// import {ConfirmationService, MessageService} from "primeng/api";
// import {ExpenseService} from "../../../shared/services/expense/expense.service";
// import {PrivilegeService} from "../../../shared/services/privilege.service";
// import {LoginLogoutService} from "../../../shared/services/auth/login-logout.service";
// import {BillSocketService} from "../../../shared/services/bills/bill-socket.service";
// import {BillsService} from "../../../shared/services/bills/bills.service";
// import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
// import {ReportMainFormComponent} from "./report-main-form.component";
//
// describe('ReportMainFormComponent', () => {
//   let component: ReportMainFormComponent;
//   let fixture: ComponentFixture<ReportMainFormComponent>;
//
//   const fieldIds = [1, 2, 3, 4, 5, 6, 7, 8];
//
//
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//
//       declarations: [ReportMainFormComponent],
//
//       imports: [RouterTestingModule.withRoutes(
//         [{path: 'login', component: LoginComponent}]), ReactiveFormsModule, HttpClientModule,
//         HttpClientTestingModule, SplitterModule, FormsModule, RouterTestingModule, InputMaskModule,
//         DropdownModule, ButtonModule, TabViewModule, ConfirmDialogModule, OverlayPanelModule, RouterModule,CalendarModule],
//
//       providers: [MessageService, ExpenseService, PrivilegeService, ConfirmationService,
//         LoginLogoutService, BillSocketService, BillsService, BillSubmitService],
//     })
//       .compileComponents().then(() => {
//         fixture = TestBed.createComponent(ReportMainFormComponent);
//         component = fixture.componentInstance;
//         component.ngOnInit();
//         fixture.detectChanges();
//       });
//   });
//
//   it('should create a component', function () {
//     expect(ReportMainFormComponent).toBeTruthy();
//   });
//
// });
