export class TemporaryPasswordRequestDto {

  public userName: string;
  public oldPassword: string;
  public password: string;
  public confirmPassword: string;

  constructor() {
  }
}
