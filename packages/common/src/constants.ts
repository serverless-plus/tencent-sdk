export enum ServiceType {
  /** API 网关服务 (apigateway) */
  apigateway = 'apigateway',

  apigw = 'apigw',
  /** 云函数服务 (SCF) */
  faas = 'scf',
  /** 视频处理服务 (MPS) */
  mps = 'mps',
  /** 资源标签服务 (TAG) */
  tag = 'tag',
  /** 内容分发 (CDN) */
  cdn = 'cdn',
  /** 文件存储 (CFS) */
  cfs = 'cfs',
  /** 域名解析服务 (CNS) */
  cns = 'cns',
  /**  */
  domain = 'domain',
  /** MySQL 数据库 (CynosDB) */
  cynosdb = 'cynosdb',
  /** Postgres 数据库 (Postgres) */
  postgres = 'postgres',
  /** 私有网络 (VPC) */
  vpc = 'vpc',
  /* 访问管理 （CAM）  */
  cam = 'cam',

  // 负载均衡 （CLB）*/
  clb = 'clb',

  // 监控 */
  monitor = 'monitor',
}
