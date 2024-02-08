import {Component, Input, OnInit} from '@angular/core';
import {CommonUtility} from "../../../shared/utility/common-utility";
import {ItemService} from "../../../shared/services/items/item.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";

@Component({
  selector: 'app-table-item-overlay',
  templateUrl: './table-item-overlay.component.html',
  styleUrls: ['./table-item-overlay.component.scss']
})
export class TableItemOverlayComponent implements OnInit {

  public commonUtil = new CommonUtility();
  public itemDto: any;

  @Input() productId: number;

  constructor(public itemService: ItemService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    if (!this.productId) {
      return;
    } else {
      this.itemService.getItemPopupData(this.productId).subscribe((res) => {
        this.itemDto = res.body;
      });
    }
  }
}
