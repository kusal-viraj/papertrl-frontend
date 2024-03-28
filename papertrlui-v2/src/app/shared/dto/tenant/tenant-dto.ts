export class TenantDto {

  // Package Detail
  public packageId: number;
  // Owner Specific Details
  public id: number;
  public ownerName: string;
  public firstName: string;
  public lastName: string;
  public ownerEmail: string;
  public tenantId: string;
  public businessAddress: string;
  // Database Connection Details
  public dbServerId: number;
  public dbCachePrepStmts: string;
  public dbPrepStmtCacheSize: number;
  public dbPrepStmtCacheSqlLimit: number;
  public dbConnectionTimeOut: number;
  public dbDriverClassName: string;
  public dbIdleTimeOut: number;
  public dbInitFailTimeout: number;
  public dbLeakDetectionThreadshold: number;
  public dbPoolSize: number;
  public dbMaxLife: number;
  public dbMinIdle: number;
  public dbDefaultAutoCommit: boolean;
  public dbValidationQuery: string;
  public dbHost: string;
  public userAuthType: string;
  // Sftp Details
  public sftpServerId: number;
  public sftpHost: string;
  // AD Configuration Details
  public adProviderUrl: string;
  public adOuDcParam: string;
  public adSampleSyncUser: string;
  public adSampleSyncUserPassword: string;
  public adSecurityAuth: number;
  // Validation
  public isTenantIdAvailable = true;
  public parentId: string;


  public tenantPrivileges: Array<number> = [];


}
