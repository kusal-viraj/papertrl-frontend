import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {BillUtility} from "../../bill-utility";
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
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {CreditNoteDetailViewComponent} from "./credit-note-detail-view.component";
import {DialogService, DynamicDialogConfig} from "primeng/dynamicdialog";
import {DetailViewService} from "../../../../shared/helpers/detail-view.service";
import {AdditionalFieldService} from "../../../../shared/services/additional-field-service/additional-field-service.";

describe('CreditNoteDetailViewComponent', () => {
  let component: CreditNoteDetailViewComponent;
  let fixture: ComponentFixture<CreditNoteDetailViewComponent>;
  let creditNoteService: CreditNoteService;
  let additionalFieldService: AdditionalFieldService;

  beforeEach(async () => {
    let creditNoteServiceSpy = jasmine.createSpyObj('CreditNoteService',
      ['createCreditNote', 'getDepartment', 'vendorRelevantItemList', 'getCreditNoteDetail'], ['BillUtility']);

    let additionalFieldServiceSpy = jasmine.createSpyObj('AdditionalFieldService',['getAdditionalField']);

    await TestBed.configureTestingModule({
      declarations: [CreditNoteDetailViewComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule,
        InputMaskModule, DropdownModule, ButtonModule, ConfirmDialogModule, TabViewModule, TableModule, NgxDropzoneModule,
        ToastModule],
      providers: [MessageService, ConfirmationService, DynamicDialogConfig, DetailViewService, DialogService,
        {provide: CreditNoteService, useValue: creditNoteServiceSpy},
        {provide: AdditionalFieldService, useValue: additionalFieldServiceSpy},
      ],
    }).compileComponents().then(async () => {
      fixture = TestBed.createComponent(CreditNoteDetailViewComponent);
      creditNoteService = TestBed.inject(CreditNoteService);
      additionalFieldService = TestBed.inject(AdditionalFieldService);
      component = fixture.componentInstance;
      await component.initializeFormGroup();
    });
  });

  it('01 Credit note id null', () => {
    spyOn<CreditNoteDetailViewComponent, any>(component, 'getCreditNoteData');
    component.getCreditNoteData(null);
    expect(creditNoteService.getCreditNoteDetail).toHaveBeenCalledTimes(0);
  });

  it('02 Credit note id undefined', () => {
    spyOn<CreditNoteDetailViewComponent, any>(component, 'getCreditNoteData');
    component.getCreditNoteData(undefined);
    expect(creditNoteService.getCreditNoteDetail).toHaveBeenCalledTimes(0);
  });

  it('03 Module id null check for get additional fields', () => {
    spyOn<CreditNoteDetailViewComponent, any>(component, 'getModuleReheatedAdditionalField');
    component.getModuleReheatedAdditionalField(null, false);
    expect(additionalFieldService.getAdditionalField).toHaveBeenCalledTimes(0);
  });

  it('04 Module id null check for get additional fields', () => {
    spyOn<CreditNoteDetailViewComponent, any>(component, 'getModuleReheatedAdditionalField');
    component.getModuleReheatedAdditionalField(undefined, false);
    expect(additionalFieldService.getAdditionalField).toHaveBeenCalledTimes(0);
  });

});
