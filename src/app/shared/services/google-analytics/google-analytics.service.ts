import {Injectable} from '@angular/core';
import {AppAnalyticsConstants} from "../../enums/app-analytics-constants";

declare var gtag: any; // Declare gtag as a global variable

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor() {
  }


  /**
   * This is a generic method for tracking events in the application.
   * @param eventCategory
   * @param eventAction
   * @param eventLabel
   * @param screenName
   */
  trackEvents(eventCategory: string, eventAction: string, eventLabel: string, screenName?: string) {
    let labelName = AppAnalyticsConstants.CREATE_SCREEN;
    if (screenName) {
      labelName = screenName;
    }
    gtag('event', eventAction, {
      [labelName]: eventLabel,
      event_label: eventCategory,
    });
  }


  /**
   * It simplifies tracking events related to screen buttons
   * @param eventCategory
   * @param eventAction
   * @param eventLabel
   * @param screenName
   */
  trackScreenButtonEvent(eventCategory: string, eventAction: string, eventLabel: string, screenName?: string) {
    this.trackEvents(eventCategory, eventAction, eventLabel, screenName);
  }

  /**
   * This method is used to track events related to actions performed on table headers.
   * @param moduleName
   * @param eventName
   */
  trackTableHeaderActions(moduleName: string, eventName: string) {
    this.trackEvents(moduleName, moduleName, eventName, AppAnalyticsConstants.TABLE_HEADER_ACTIONS);
  }

  /**
   * This method is used to track events related to actions performed within nested tables.
   *
   * @param eventCategory
   * @param eventAction
   * @param eventLabel
   */
  trackNestedTableEvent(eventCategory: string, eventAction: string, eventLabel: string) {
    this.trackEvents(eventCategory, eventAction, eventLabel, AppAnalyticsConstants.TABLE_ACTIONS);
  }

}

