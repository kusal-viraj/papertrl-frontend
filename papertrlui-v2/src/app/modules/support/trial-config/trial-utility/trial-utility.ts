import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';


export class TrialUtility {

  public driverClassList: DropdownDto = new DropdownDto();
  public cachePrepStmtsList: DropdownDto = new DropdownDto();
  public authTypeList: DropdownDto = new DropdownDto();
  public dbDefaultAutoCommitList: DropdownDto = new DropdownDto();


  constructor() {

    this.authTypeList.data = [{id: 'AD', name: 'AD Authentication'}, {
      id: 'DB',
      name: 'DB Authentication'
    }];

    this.dbDefaultAutoCommitList.data = [ {id: true, name: 'True'}, {
      id: false, name: 'False'}];

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
  }

}
