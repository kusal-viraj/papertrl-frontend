import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonSystemTaskRoutingService {
  public commonRouting: BehaviorSubject <any> = new BehaviorSubject('')
  constructor() { }
}
