
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor(private http: HttpClient) { }

  getMenuList() {
    return this.http.get<any>('../assets/demo/data/menu.json', {observe: 'response'});
  }

  getSupportMenuList() {
    return this.http.get<any>('../assets/demo/data/support-menu.json', {observe: 'response'});
  }
}
