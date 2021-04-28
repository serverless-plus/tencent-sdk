export interface AnyObject {
  [prop: string]: any;
}

export type GetFaasOptions = {
  // 是否需要获取函数代码，默认设置为 false，提高查询效率
  showCode?: boolean;
  // 是否需要获取函数触发器，默认设置为 false，提高查询效率
  showTriggers?: boolean;
} & FaasBaseConfig;

export interface FaasBaseConfig {
  // 函数名称
  name: string;
  // 命名空间
  namespace?: string;
  // 版本
  qualifier?: string;
}

export interface Credentials {
  // secret id
  secretId: string;
  // secret key
  secretKey: string;
  // 临时 token
  token?: string;
}

export type FaasOptions = {
  region?: string;
  debug?: boolean;
} & Credentials;

export interface Tag {
  // 键
  Key: string;
  // 值
  Value: string;
}

export interface FunctionInfo {
  // 函数名称
  FunctionName: string;
  // 命名空间
  Namespace: string;
  // 超时时间
  Timeout: number;
  // 内存
  MemorySize: number;
  // 执行方法
  Handler: string;
  // 运行环境
  Runtime: string;
  // 状态
  Status: string;
  // 最新版本
  LastVersion: string;
  // 异常原因
  StatusReasons: { ErrorMessage: string }[];
  // 流量
  Traffic?: number;
  // 配置流量版本
  ConfigTrafficVersion?: string;
  // 标签
  Tags: Tag[];
  // 日志集ID
  ClsLogsetId: string;
  // 日志主题ID
  ClsTopicId: string;
}

export interface StatusSqlMap {
  // 成功
  success: string;
  // 失败
  fail: string;
  // 重试
  retry: string;
  // 调用中断
  interrupt: string;
  // 超时超时
  timeout: string;
  // 调用超时
  exceed: string;
  // 代码异常
  codeError: string;
}

export interface GetLogOptions {
  // 函数名称
  name: string;
  // 命名空间
  namespace?: string;
  // 函数版本
  qualifier?: string;
  // 开始时间
  startTime?: number | string;
  // 结束时间
  endTime?: number | string;
  // 请求 ID
  reqId?: string;
  // 日志状态
  status?: keyof StatusSqlMap | '';
  // 时间间隔，单位秒，默认为 3600s
  interval?: number;
  // 获取条数
  limit?: number;
}

export interface ClsConfig {
  // 日志集 ID
  logsetId: string;
  // 日志主题 ID
  topicId: string;
}

export interface LogContent {
  // 函数名称
  SCF_FunctionName: string;
  // 命名空间
  SCF_Namespace: string;
  // 开始时间
  SCF_StartTime: string;
  // 请求 ID
  SCF_RequestId: string;
  // 运行时间
  SCF_Duration: string;
  // 别名
  SCF_Alias: string;
  // 版本
  SCF_Qualifier: string;
  // 日志时间
  SCF_LogTime: string;
  // 重试次数
  SCF_RetryNum: string;
  // 使用内存
  SCF_MemUsage: string;
  // 日志等级
  SCF_Level: string;
  // 日志信息
  SCF_Message: string;
  // 日志类型
  SCF_Type: string;
  // 状态吗
  SCF_StatusCode: string;
}

export type GetLogDetailOptions = {
  logsetId: string;
  topicId: string;
  reqId: string;
  // 开始时间
  startTime?: string;
  // 结束时间
  endTime?: string;
};

// 通过组装单条 request ID 的详情中 content 的 SCF_Messsage 的日志
export interface SearchLogItem {
  requestId: string;
  retryNum: number;
  startTime: string;
  memoryUsage: string;
  duration: string;
  message: string;
}

// 查询得到的日志详情日志
export interface SearchLogDetailItem {
  content: string;
  filename: string;
  pkg_id: string;
  pkg_logid: string;
  source: string;
  time: number;
  timestamp: string;
  topic_id: string;
  topic_name: string;
}

export enum LogType {
  none = 'None',
  tail = 'Tail',
}

export enum InvokeType {
  request = 'RequestResponse',
  event = 'Event',
}

export interface InvokeOptions {
  name: string;
  namespace: string;
  qualifier: string;
  event?: Record<string, any>;
  logType?: LogType;
  invokeType?: InvokeType;
}

export interface InvokeResult {
  // 计费时间
  billDuration: number;
  // 运行时间
  duration: number;
  // 错误信息
  errMsg: string;
  // 运行内存
  memUsage: number;
  // 请求 ID
  functionRequestId: string;
  // 没用字段
  invokeResult: number;
  // 函数运行日志
  log: string;
  // 函数返回结果
  retMsg: string;
}
