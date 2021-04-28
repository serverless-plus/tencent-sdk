export interface AnyObject {
  [prop: string]: any;
}

export interface FaasBaseConfig {
  name: string;
  namespace?: string;
  qualifier?: string;
}

export interface Credentials {
  secretId: string;
  secretKey: string;
  token?: string;
}

export interface Tag {
  Key: string;
  Value: string;
}

export interface FunctionInfo {
  FunctionName: string;
  Namespace: string;
  Timeout: number;
  MemorySize: number;
  Handler: string;
  Runtime: string;
  Status: string;
  LastVersion: string;
  StatusReasons: { ErrorMessage: string }[];
  Traffic?: number;
  ConfigTrafficVersion?: string;
  Tags: Tag[];
  ClsLogsetId: string;
  ClsTopicId: string;
}

export interface StatusSqlMap {
  success: string;
  fail: string;
  retry: string;
  interrupt: string;
  timeout: string;
  exceed: string;
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
  logsetId: string;
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
