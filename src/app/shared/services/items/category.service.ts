import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CategoryMstDto} from '../../dto/item/category-mst-dto';
import {ApiEndPoint} from '../../utility/api-end-point';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) { }

  createCategory(categoryRequestDto: CategoryMstDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_create_category',
      categoryRequestDto, {observe: 'response', withCredentials: true});
  }

  public getCategoryIsExist(categoryName: string) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_category_availability',
      {params: {category: categoryName}, observe: 'response', withCredentials: true});
  }

}
