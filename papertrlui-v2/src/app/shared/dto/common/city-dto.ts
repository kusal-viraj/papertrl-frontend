import {StateDto} from './state-dto';


export class CityDto {
  public id: bigint;
  public name: string;
  public stateId: StateDto = new StateDto();

  constructor() {
  }
}
