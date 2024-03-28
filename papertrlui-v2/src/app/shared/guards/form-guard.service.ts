import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class FormGuardService implements CanDeactivate<any> {

  canDeactivate(component: any): boolean {
    if (component) {
      if (component?.hasUnSavedData()) {
        return confirm('You have unsaved changes! If you leave, your changes will be lost.');
      }
      return true;
    } else {
      return true;
    }
  }

}
