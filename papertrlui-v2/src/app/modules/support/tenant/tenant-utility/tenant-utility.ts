import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {TenantService} from '../../../../shared/services/support/tenant.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';

export class TenantUtility {

  public driverClassList: DropdownDto = new DropdownDto();
  public cachePrepStmtsList: DropdownDto = new DropdownDto();
  public authTypeList: DropdownDto = new DropdownDto();
  public dbDefaultAutoCommitList: DropdownDto = new DropdownDto();
  public supportSftpServers: DropdownDto = new DropdownDto();
  public supportDBServers: DropdownDto = new DropdownDto();
  public packageNameList: DropdownDto = new DropdownDto();
  public dbCachePrepStmts;
  public dbPrepStmtCacheSize;
  public dbPrepStmtCacheSqlLimit;
  public dbConnectionTimeOut;
  public dbIdleTimeOut;
  public dbInitFailTimeout;
  public dbLeakDetectionThreadshold;
  public dbPoolSize;
  public dbMaxLife;
  public dbMinIdle;
  public dbDefaultAutoCommit;

  constructor(public tenantService: TenantService, public notificationService: NotificationService) {
    this.authTypeList.data = [{id: 'AD', name: 'AD Authentication'}, {
      id: 'DB',
      name: 'DB Authentication'
    }];

    this.dbDefaultAutoCommitList.data = [{id: true, name: 'True'}, {
      id: false, name: 'False'
    }];

    this.driverClassList.data = [
      {id: 'com.mysql.jdbc.Driver', name: 'MySQL'},
      {id: 'org.postgresql.Driver', name: 'PostgreSQL'},
      {id: 'oracle.jdbc.OracleDriver', name: 'Oracle'},
      {id: 'org.mariadb.jdbc.Driver', name: 'MariaDB'},
      {id: 'com.microsoft.sqlserver.jdbc.SQLServerDriver', name: 'SQL Server (Microsoft driver)'}
    ];

    this.cachePrepStmtsList.data = [
      {id: 'true', name: 'True'},
      {id: 'false', name: 'False'}];

    this.dbCachePrepStmts = 'true';
    this.dbPrepStmtCacheSize = 250;
    this.dbPrepStmtCacheSqlLimit = 2048;
    this.dbConnectionTimeOut = 1000;
    this.dbIdleTimeOut = 60000;
    this.dbInitFailTimeout = 15000;
    this.dbLeakDetectionThreadshold = 62000;
    this.dbPoolSize = 30;
    this.dbMaxLife = 60000;
    this.dbMinIdle = 2;
    this.dbDefaultAutoCommit = true;
  }



}
