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

export interface GetVersionsOptions extends FaasBaseConfig {
  limit?: number;
  page?: number;
  order?: string;
  orderBy?: string;
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

export type MonitorOptions = {
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
  // 函数类型
  Type: string;
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
  // 开始时间，支持格式化的时间和时间戳
  startTime?: number | string;
  // 结束时间，支持格式化的时间和时间戳
  endTime?: number | string;
  // 请求 ID
  reqId?: string;
  // 日志状态
  status?: keyof StatusSqlMap | '';
  // 时间间隔，单位秒，默认为 600s
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
  // 函数名称
  name: string;
  // 命名空间
  namespace?: string;
  // 版本号
  qualifier?: string;
  // 触发器事件
  event?: Record<string, any>;
  // 日志类型
  logType?: LogType;
  // 执行类型
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
export interface GetMonitorDataOptions {
  // 指标名称，参考云函数监控指标文档：https://cloud.tencent.com/document/product/248/45130
  metric: string;
  // 函数名称
  name: string;
  // 命名空间
  namespace?: string;
  // 别名，默认流量，$LATEST
  alias?: string;
  // 时间间隔，单位秒，默认为 900s
  interval?: number;
  // 统计周期，单位秒，默认为 60s
  period?: number;
  // 开始时间, 格式：2018-09-22T19:51:23+08:00
  startTime?: string;
  // 结束时间, 格式：2018-09-22T19:51:23+08:00
  endTime?: string;

  // 是否需要获取接口源数据，默认为 false，返回格式化后的数据
  isRaw?: boolean;
}

export interface DataPoint {
  Timestamps: number[];
  Values: any[];
  Dimensions: any[];
}
export interface MonitorData {
  StartTime: string;
  EndTime: string;
  Period: number;
  MetricName: string;
  DataPoints: DataPoint[];
  RequestId: string;
}

export interface FormatedMonitorData {
  time: string;
  value: any;
  timestamp: number;
}

export interface GetTriggersOptions {
  name: string;
  namespace?: string;
  page?: number;
}

export interface TriggerData {
  Type: string;
  TriggerDesc?: string;
  TriggerName?: string;
  Qualifier?: string;
}
