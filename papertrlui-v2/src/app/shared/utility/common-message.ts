import {AppConstant} from './app-constant';

export class CommonMessage {

  public static FILE_ATTACHED_SUCCESSFULLY = 'File attached successfully';
  public static INVALID_IMAGE_TYPE = 'Invalid file type, Only image files are suppotred in here';
  public static INVALID_PRO_PIC_TYPE = 'Invalid image format, PNG, JPG and JPEG are the formats supports at here';
  public static INVALID_PDF_TYPE = 'Invalid file type, Only pdf files are suppotred in here';
  public static INVALID_IMAGE_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_PROPIC_SIZE + 'MB';
  public static INVALID_PDF_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_INVOICE_SIZE + 'MB';
  public static INVALID_W9_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_W9_SIZE + 'MB';

  public static INVALID_REP_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_REP_SIZE + 'MB';
  public static INVALID_FINAL_PROPOSAL_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_FINAL_PROPOSAL_SIZE + 'MB';
  public static INVALID_AMENDMENTS_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_AMENDMENTS_SIZE + 'MB';
  public static INVALID_PROTEST_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_PROTEST_SIZE + 'MB';
  public static INVALID_OTHER_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_OTHER_SIZE + 'MB';
  public static INVALID_LOGO_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.MAX_LOGO_SIZE + 'MB';

  public static EMPTY_DATE_FORMAT_ERROR = 'Please select Date & Time before scheduling the bill payment';

  public static INVALID_FILE_SIZE = 'Invalid file size, Your file size must be equal or less than ' + AppConstant.COMMON_FILE_SIZE + 'MB';
  public static INVALID_FILE_TYPE = 'Invalid file format';
  public static ADDITIONAL_FIELD_INVALID_FILE_TYPE = 'Invalid file type';

  public static INVALID_JSON_FILE_TYPE = 'Invalid file type, Only JSON files are supported in here';

}
