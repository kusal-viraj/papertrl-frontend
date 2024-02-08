import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {InputMaskModule} from "primeng/inputmask";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TabViewModule} from "primeng/tabview";
import {TableModule} from "primeng/table";
import {NgxDropzoneModule} from "ngx-dropzone";
import {SplitterModule} from "@progress/kendo-angular-layout";
import {ConfirmationService, MessageService} from "primeng/api";
import {PoService} from "../../../shared/services/po/po.service";
import {PoApprovalInvoiceViewComponent} from "./po-approval-invoice-view.component";
import {ToastModule} from "primeng/toast";

describe('PoApprovalInvoiceViewComponent', () => {

  let component: PoApprovalInvoiceViewComponent;
  let fixture: ComponentFixture<PoApprovalInvoiceViewComponent>;
  let poService: PoService;

  beforeEach(async () => {

    let poServiceSpy = jasmine.createSpyObj('PoService', ['createPurchaseOrder', 'getUom',
      'savePOAsDraft', 'getVendors', 'saveDraft', 'getPoAttachment'], ['PoUtility']);

    TestBed.configureTestingModule({
      declarations: [PoApprovalInvoiceViewComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        SplitterModule, ToastModule],
      providers: [MessageService, ConfirmationService,
        {provide: poService, useValue: poServiceSpy}
      ]
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(PoApprovalInvoiceViewComponent);
      poService = TestBed.inject(PoService);
      component = fixture.componentInstance;
    });
  });
});
