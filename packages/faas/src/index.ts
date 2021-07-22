import got from 'got';
import { camelCaseProps } from '@tencent-sdk/common';
import { Capi, ServiceType, CommonError } from '@tencent-sdk/capi';
import { Cls } from '@tencent-sdk/cls';
import { dtz, dayjs, formatDate, Dayjs, TIME_FORMAT } from './dayjs';
import { initializeApis, ApiMap, ActionType } from './apis';
import { getSearchSql, formatFaasLog } from './utils';
import { Monitor } from './monitor';
import {
  Credentials,
  FaasOptions,
  FaasBaseConfig,
  FunctionInfo,
  GetFaasOptions,
  GetVersionsOptions,
  GetLogOptions,
  GetLogDetailOptions,
  ClsConfig,
  SearchLogItem,
  SearchLogDetailItem,
  InvokeOptions,
  InvokeType,
  LogType,
  InvokeResult,
  GetMonitorDataOptions,
  MonitorData,
  FormatedMonitorData,
  GetTriggersOptions,
  TriggerData,
} from './typings';
import { ERRORS } from './constants';

export * from './typings';
export * from './monitor';

export class FaaS {
  credentials: Credentials;
  region: string;
  debug: boolean;
  capi: Capi;
  cls: Cls;
  monitor: Monitor;
  apis: ApiMap;
  clsConfigCache: { [prop: string]: { logsetId: string; topicId: string } };

  constructor({
    secretId,
    secretKey,
    token,
    region = 'ap-guangzhou',
    debug = false,
  }: FaasOptions) {
    this.credentials = {
      secretId,
      secretKey,
      token,
    };
    this.debug = debug;
    this.region = region;
    this.capi = new Capi({
      debug,
      region: region,
      serviceType: ServiceType.faas,
      secretId: secretId,
      secretKey: secretKey,
      token: token,
    });

    this.cls = new Cls({
      debug,
      region: this.region,
      secretId: secretId,
      secretKey: secretKey,
      token: token,
    });

    this.monitor = new Monitor({
      debug,
      region: this.region,
      secretId: secretId,
      secretKey: secretKey,
      token: token,
    });

    // 函数 CLS 配置缓存
    this.clsConfigCache = {};

    this.apis = initializeApis({
      debug,
    });
  }

  /**
   * 设置当前地域
   * @param {string} region 地区
   */
  setRegion(region: string): void {
    this.region = region;
    this.cls.options.region = region;
  }

  /**
   * 获取当前地域
   * @returns {string} 地域
   */
  getRegion() {
    return this.region;
  }

  async request({
    Action,
    ...data
  }: {
    Action: ActionType;
    [key: string]: any;
  }) {
    const result = await this.apis[Action](this.capi, data);
    return result;
  }

  async getTriggers({
    name,
    namespace = 'default',
    page = 0,
  }: GetTriggersOptions): Promise<TriggerData[]> {
    const limit = 100;
    const { Triggers = [], TotalCount } = await this.request({
      Action: 'ListTriggers',
      FunctionName: name,
      Namespace: namespace,
      Limit: limit,
      Offset: page * limit,
    });
    if (TotalCount > 100) {
      const res = await this.getTriggers({
        name,
        namespace,
        page: page + 1,
      });
      return Triggers.concat(res);
    }

    return Triggers;
  }

  /**
   * 获取 faas 命名空间列表
   */
  async getNamespaces(options: { page?: number; limit?: number } = {}) {
    const { page = 0, limit = 20 } = options;
    let { Namespaces = [] } = await this.request({
      Action: 'ListNamespaces',
      Offset: page * limit,
      Limit: limit,
    });
    if (Namespaces.length >= limit) {
      const res = await this.getNamespaces({
        page: page + 1,
        limit,
      });
      Namespaces = Namespaces.concat(res);
    }

    return Namespaces;
  }

  /**
   * 获取 faas 版本列表
   * @param {getVersionsOptions} options 参数
   * @returns {Promise<string[]>} 函数版本列表，字符串数组
   */
  async getVersions({
    name,
    namespace = 'default',
    page = 0,
    limit = 20,
    order = 'DESC',
    orderBy = 'AddTime',
  }: GetVersionsOptions) {
    let { FunctionVersion = [] } = await this.request({
      Action: 'ListVersionByFunction',
      Namespace: namespace,
      FunctionName: name,
      Offset: page * limit,
      Limit: limit,
      Order: order,
      OrderBy: orderBy,
    });
    if (FunctionVersion.length >= limit) {
      const res = await this.getVersions({
        name,
        namespace,
        page: page + 1,
        limit,
        order,
        orderBy,
      });
      FunctionVersion = FunctionVersion.concat(res);
    }
    return FunctionVersion;
  }

  /**
   *  获取 faas 详情
   * @param {GetFaasOptions} options 参数
   * @returns {Promise<FunctionInfo | null>} 函数详情，如果不存在则返回 null
   */
  async get({
    name,
    namespace = 'default',
    qualifier = '$LATEST',
    showCode = false,
    showTriggers = false,
  }: GetFaasOptions): Promise<FunctionInfo | null> {
    try {
      // 判断 namespace 是否存在
      const namespacesList = await this.getNamespaces();
      const namespaces = namespacesList.map(
        (item: { Name: string }) => item.Name,
      );
      if (namespaces.indexOf(namespace) === -1) {
        throw new CommonError(ERRORS.NAMESPACE_NOT_EXIST_ERROR);
      }
      // 非 $LATEST 版本，需要先查找对应的版本是否存在
      if (qualifier !== '$LATEST') {
        const versions = await this.getVersions({
          name,
          namespace,
        });
        if (versions.indexOf(qualifier) === -1) {
          throw new CommonError(ERRORS.QUALIFIER_NOT_EXIST_ERROR);
        }
      }
    } catch (e) {
      // 可能是其他参数导致的，比如 region 不存在，直接返回 null，排除函数不存在异常
      if (
        e.code !== ERRORS.NAMESPACE_NOT_EXIST_ERROR.code &&
        e.code !== ERRORS.QUALIFIER_NOT_EXIST_ERROR.code
      ) {
        return null;
      }
      throw e;
    }
    try {
      const Response = await this.request({
        Action: 'GetFunction',
        FunctionName: name,
        Namespace: namespace,
        Qualifier: qualifier,
        ShowCode: showCode ? 'TRUE' : 'FALSE',
        ShowTriggers: showTriggers ? 'TRUE' : 'FALSE',
      });
      return Response;
    } catch (e) {
      if (e.code === 'ResourceNotFound.Namespace') {
        throw new CommonError(ERRORS.NAMESPACE_NOT_EXIST_ERROR);
      }
      if (
        e.code === 'ResourceNotFound.FunctionName' ||
        e.code === 'ResourceNotFound.Function'
      ) {
        return null;
      }

      // 除以上错误码的其他信息
      throw new CommonError({
        ...ERRORS.OTHER_GET_FAAS_ERROR,
        ...{ message: e.message, reqId: e.reqId },
      });
    }
  }

  async invokeHTTPFaas({
    name,
    namespace = 'default',
    event = {},
  }: InvokeOptions): Promise<string> {
    const triggers = await this.getTriggers({
      name,
      namespace,
    });
    if (triggers.length === 0) {
      throw new CommonError(ERRORS.WEB_FAAS_NO_TRIGGERS);
    }
    const { TriggerDesc } = triggers[0];
    const { service } = JSON.parse(TriggerDesc as string);
    const baseUrl = service.subDomain;
    const { method = 'GET', path = '/', data } = event;
    const urlObj = new URL(`${baseUrl}/${path}`);
    const realPath = urlObj.pathname.replace(/\/+/g, '/');
    const url = `${urlObj.origin}${realPath}`;
    const { body } = await got({
      url,
      method,
      form: data,
    });
    return body;
  }

  /**
   * 调用函数
   * @param {InvokeOptions} options 参数
   * @returns {Promise<InvokeResult>} 函数执行结果
   */
  async invoke({
    name,
    namespace = 'default',
    qualifier = '$LATEST',
    event = {},
    logType = LogType.tail,
    invokeType = InvokeType.request,
  }: InvokeOptions): Promise<InvokeResult | string> {
    // invoke 之前检查函数是否存在
    const detail = await this.get({
      name,
      namespace,
      qualifier,
    });
    if (!detail) {
      throw new CommonError(ERRORS.GET_FAAS_ERROR);
    }
    if (detail.Type === 'HTTP') {
      return this.invokeHTTPFaas({
        name,
        namespace,
        event,
        qualifier,
      });
    }
    const { Result } = await this.request({
      Action: 'Invoke',
      FunctionName: name,
      Namespace: namespace,
      Qualifier: qualifier,
      ClientContext: JSON.stringify(event),
      LogType: logType,
      InvocationType: invokeType,
    });

    return camelCaseProps(Result);
  }

  /**
   * 获取 faas 的 CLS 配置
   * @param {FaasBaseConfig} options 参数
   * @returns {Promise<ClsConfig>} 函数 CLS 配置
   */
  async getClsConfig({
    name,
    namespace = 'default',
    qualifier = '$LATEST',
  }: FaasBaseConfig): Promise<ClsConfig> {
    const cacheKey = `${name}-${namespace}-${qualifier}`;
    if (this.clsConfigCache[cacheKey]) {
      return this.clsConfigCache[cacheKey];
    }
    const detail = await this.get({
      name,
      namespace,
      qualifier,
    });

    if (!detail) {
      throw new CommonError(ERRORS.GET_FAAS_ERROR);
    }

    const clsConfig = {
      logsetId: detail!.ClsLogsetId,
      topicId: detail!.ClsTopicId,
    };
    this.clsConfigCache[cacheKey] = clsConfig;
    return clsConfig;
  }

  /**
   * 获取函数日志列表，默认 近1个小时
   * 注意如果同时定义了 startTime 和 endTime，interval 参数将不起作用
   * @param {GetLogOptions} options 参数
   * @returns {Promise<SearchLogItem[]>} 日志列表
   */
  async getLogList({
    name,
    namespace,
    qualifier,
    status,
    endTime = Date.now(),
    interval = 600,
    limit = 10,
    startTime,
  }: GetLogOptions): Promise<SearchLogItem[]> {
    const { logsetId, topicId } = await this.getClsConfig({
      name,
      namespace,
      qualifier,
    });

    if (!logsetId || !topicId) {
      throw new CommonError(ERRORS.GET_CLS_CONFIG_ERROR);
    }

    let startDate: Dayjs;
    let endDate: Dayjs;

    // 默认获取从当前到一个小时前时间段的日志
    if (!endTime) {
      endDate = dtz();
    } else {
      endDate = dtz(endTime);
    }
    if (!startTime) {
      startDate = dtz(endDate.valueOf() - Number(interval) * 1000);
    } else {
      startDate = dtz(startTime);
    }

    const sql = getSearchSql({
      name,
      namespace,
      qualifier,
      status,
      startTime: startDate.valueOf(),
      endTime: endDate.valueOf(),
    });

    const searchParameters = {
      logset_id: logsetId,
      topic_ids: topicId,
      start_time: startDate.format(TIME_FORMAT),
      end_time: endDate.format(TIME_FORMAT),
      query_string: sql,
      limit: limit || 10,
      sort: 'desc',
    };
    const { results = [] } = await this.cls.searchLog(searchParameters);
    const logs = [];
    for (let i = 0, len = results.length; i < len; i++) {
      const curReq = results[i];
      curReq.isCompleted = false;
      curReq.startTime = formatDate(curReq.startTime);

      const detailLog = await this.getLogDetail({
        logsetId: logsetId,
        topicId: topicId,
        reqId: curReq.requestId,
        startTime: startDate.format(TIME_FORMAT),
        endTime: endDate.format(TIME_FORMAT),
      });
      const formatedInfo = formatFaasLog(detailLog || []);
      curReq.message = formatedInfo.message;
      curReq.memoryUsage = formatedInfo.memoryUsage;
      curReq.isCompleted = formatedInfo.isCompleted;
      curReq.duration = formatedInfo.duration;

      logs.push(curReq);
    }
    return logs;
  }

  /**
   * 获取请求 ID日志详情，包含多条日志（流式日志），需要自定义拼接
   * @param {GetLogDetailOptions} options 参数
   * @returns {Promise<SearchLogDetailItem[]>} 日志详情列表
   */
  async getLogDetail({
    startTime,
    logsetId,
    topicId,
    reqId,
    endTime = formatDate(Date.now()),
  }: GetLogDetailOptions): Promise<SearchLogDetailItem[]> {
    startTime =
      startTime ||
      dtz(endTime)
        .add(-1, 'hour')
        .format(TIME_FORMAT);

    const sql = `SCF_RequestId:${reqId} AND SCF_RetryNum:0`;
    const searchParameters = {
      logset_id: logsetId,
      topic_ids: topicId,
      start_time: startTime as string,
      end_time: endTime,
      query_string: sql,
      limit: 100,
      sort: 'asc',
    };
    const { results = [] } = await this.cls.searchLog(searchParameters);

    return results;
  }

  /**
   * 通过请求 ID 获取日志详情
   * @param {GetLogOptions} options 参数
   * @returns {Promise<SearchLogItem>} 单条日志详情
   */
  async getLogByReqId({
    name,
    namespace,
    qualifier,
    endTime = Date.now(),
    reqId,
  }: GetLogOptions): Promise<SearchLogItem> {
    const { logsetId, topicId } = await this.getClsConfig({
      name,
      namespace,
      qualifier,
    });

    if (!logsetId || !topicId) {
      throw new CommonError(ERRORS.GET_CLS_CONFIG_ERROR);
    }

    if (!reqId) {
      throw new CommonError(ERRORS.REQUEST_ID_INVALID);
    }
    const endDate = dayjs(endTime);

    if (this.debug) {
      console.log(`[FAAS] 通过请求 ID 获取日志: ${reqId}`);
    }

    const detailLog = await this.getLogDetail({
      logsetId: logsetId,
      topicId: topicId,
      reqId,
      endTime: formatDate(endDate),
    });

    const curReq: SearchLogItem = {
      requestId: reqId,
      retryNum: 0,
      startTime: '',
      memoryUsage: '',
      duration: '',
      message: '',
      isCompleted: false,
    };
    const formatedInfo = formatFaasLog(detailLog || []);
    curReq.message = formatedInfo.message;
    curReq.memoryUsage = formatedInfo.memoryUsage;
    curReq.isCompleted = formatedInfo.isCompleted;
    curReq.duration = formatedInfo.duration;

    return curReq;
  }

  /**
   * 获取监控数据，默认获取 Invocation 指标
   * @param {GetMonitorDataOptions} options 参数
   * @returns
   */
  async getMetric({
    metric = 'Invocation',
    ...rest
  }: GetMonitorDataOptions): Promise<FormatedMonitorData[] | MonitorData[]> {
    return this.monitor.get({
      metric,
      ...rest,
    });
  }
}
