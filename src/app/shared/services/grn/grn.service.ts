import { Injectable } from '@angular/core';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrnService {

  constructor(private http: HttpClient) { }

}
