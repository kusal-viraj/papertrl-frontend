import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TrialRequestComponent } from './trial-request/trial-request.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { ForgotPasswordResetComponent } from './forgot-password-reset/forgot-password-reset.component';
import { TemporaryPasswordResetComponent } from './temporary-password-reset/temporary-password-reset.component';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PasswordModule} from 'primeng/password';
import {ReactiveFormsModule} from '@angular/forms';
import {MessageService, SharedModule} from 'primeng/api';
import {CardModule} from 'primeng/card';
import {CheckboxModule} from 'primeng/checkbox';
import {ToastModule} from 'primeng/toast';
import {FloatingLabelModule} from '@progress/kendo-angular-label';
import {InputsModule} from '@progress/kendo-angular-inputs';
import {SidebarModule} from 'primeng/sidebar';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {IconModule} from '@progress/kendo-angular-icons';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {BasicAuthHttpInterceptorServiceService} from '../../shared/services/basic-auth-htpp-interceptor-service.service';
import {MessageModule} from 'primeng/message';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {VendorEmailVerificationComponent} from './vendor-email-verification/vendor-email-verification.component';
import {RadioButtonModule} from "primeng/radiobutton";
import {MultiSelectModule} from "primeng/multiselect";
import { RegisterSuccessComponent } from './register-success/register-success.component';
import { AppDownloadComponent } from './app-download/app-download.component';
import {CommonImplModule} from "../common/common-impl.module";

@NgModule({
  declarations: [LoginComponent, RegisterComponent, TrialRequestComponent, EmailVerificationComponent,
    ForgotPasswordResetComponent, TemporaryPasswordResetComponent, VendorEmailVerificationComponent, RegisterSuccessComponent, AppDownloadComponent],
    imports: [
        CommonModule,
        PasswordModule,
        InputTextModule,
        ButtonModule,
        ReactiveFormsModule,
        SharedModule,
        CardModule,
        CheckboxModule,
        ToastModule,
        FloatingLabelModule,
        InputsModule,
        SidebarModule,
        NgCircleProgressModule,
        IconModule,
        MessageModule,
        DropdownModule,
        InputTextareaModule,
        RadioButtonModule,
        MultiSelectModule,
        CommonImplModule
    ],
  providers: [MessageService, {provide: HTTP_INTERCEPTORS, useClass: BasicAuthHttpInterceptorServiceService, multi: true}],

})
export class AuthModule {}
