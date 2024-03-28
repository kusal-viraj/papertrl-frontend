import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-register-success',
  templateUrl: './register-success.component.html',
  styleUrls: ['./register-success.component.scss']
})
export class RegisterSuccessComponent implements OnInit {
  public queryParams;
  constructor(public formBuilder: UntypedFormBuilder, public router: Router, public notificationService: NotificationService,
              public vendorService: VendorService, public messageService: MessageService, public activatedRoute: ActivatedRoute) {
    const queryParams = this.activatedRoute.snapshot.queryParams;

  }

  ngOnInit(): void {
    this.queryParams = this.activatedRoute.snapshot.queryParams;
  }


}
