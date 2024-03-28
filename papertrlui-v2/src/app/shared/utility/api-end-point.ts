import {environment} from '../../../environments/environment';


const HELP_URL = environment.helpUrl;
const API = environment.apiUrl;
const DOMAIN_NAME = environment.domainName;
const VENDOR_COMMUNITY = environment.vendorCommunityUrl;
const EXUS_PARTNER = environment.exusPartner;
const DEMO_ENV = environment.demoEnv;
const GOOGLE_ANALYTICS_TRACK_ID = environment.gtag;
const ENVIRONMENT = environment.env;


export class ApiEndPoint {

  constructor() {
  }

  public static HELP_URL = HELP_URL;
  public static API_URL = API;
  public static DOMAIN_NAME = DOMAIN_NAME;
  public static VENDOR_COMMUNITY_URL = VENDOR_COMMUNITY;
  public static EXUS_PARTNER = EXUS_PARTNER;
  public static DEMO_ENV = DEMO_ENV;
  public static GOOGLE_ANALYTICS_TRACK_ID = GOOGLE_ANALYTICS_TRACK_ID;
  public static ENVIRONMENT = ENVIRONMENT;
  // public static API_URL = 'http://' + window.location.hostname + ':8082/proxy';
}
