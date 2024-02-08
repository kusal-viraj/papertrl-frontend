import {CityDto} from './city-dto';

export class ZipCodeDto {
  public id: number;
  public name: string = '';
  public cityId: CityDto = new CityDto();

  constructor() {
  }
}
