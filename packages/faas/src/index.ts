import { Capi } from '@tencent-sdk/capi';
import { Cls } from '@tencent-sdk/cls';
import {
  ServiceType,
  CommonError,
  camelCaseProps,
  pascalCaseProps,
} from '@tencent-sdk/common';
import { dtz, dayjs, formatDate, Dayjs, TIME_FORMAT } from './dayjs';
import APIS, { ActionType } from './apis';
import { getSearchSql } from './utils';
import {
  Credentials,
  FaasOptions,
  FaasBaseConfig,
  FunctionInfo,
  GetFaasOptions,
  GetLogOptions,
  GetLogDetailOptions,
  ClsConfig,
  LogContent,
  SearchLogItem,
  SearchLogDetailItem,
  InvokeOptions,
  InvokeType,
  LogType,
  InvokeResult,
} from './typings';

export * from './typings';

export class FaaS {
  credentials: Credentials;
  region: string;
  capi: Capi;
  cls: Cls;
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
    this.region = region;
    this.capi = new Capi({
      debug,
      Region: region,
      ServiceType: ServiceType.faas,
      SecretId: secretId,
      SecretKey: secretKey,
      Token: token,
    });

    this.cls = new Cls({
      debug,
      region: this.region,
      secretId: secretId,
      secretKey: secretKey,
      token: token,
    });

    // 函数 CLS 配置缓存
    this.clsConfigCache = {};
  }

  /**
   * 设置当前地域
   * @param {string} region 地区
   */
  setRegion(region: string): void {
    this.region = region;
    this.capi.options.Region = region;
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
    const result = await APIS[Action](this.capi, pascalCaseProps(data));
    return result;
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
      if (
        e.code == 'ResourceNotFound.FunctionName' ||
        e.code == 'ResourceNotFound.Function'
      ) {
        return null;
      }
      throw new CommonError({
        type: 'API_FAAS_GetFunction',
        message: e.message,
        stack: e.stack,
        reqId: e.reqId,
        code: e.code,
      });
    }
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
  }: InvokeOptions): Promise<InvokeResult> {
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

    if (detail) {
      const clsConfig = {
        logsetId: detail.ClsLogsetId,
        topicId: detail.ClsTopicId,
      };
      this.clsConfigCache[cacheKey] = clsConfig;
      return clsConfig;
    }

    return {
      logsetId: '',
      topicId: '',
    };
  }

  /**
   * 获取函数日志列表，默认 近1个小时
   * @param {GetLogOptions} options 参数
   * @returns {Promise<SearchLogItem[]>} 日志列表
   */
  async getLogList({
    name,
    namespace,
    qualifier,
    status,
    endTime = Date.now(),
    interval = 3600,
    limit = 10,
  }: GetLogOptions): Promise<SearchLogItem[]> {
    const { logsetId, topicId } = await this.getClsConfig({
      name,
      namespace,
      qualifier,
    });

    if (!logsetId || !topicId) {
      throw new CommonError({
        type: 'API_FAAS_getClsConfig',
        message: `[FAAS] Can not get CLS config`,
      });
    }

    console.log(
      `[FAAS] Get logs for faas (name: ${name}, namespace: ${namespace}, qualifier: ${qualifier})`,
    );

    let startDate: Dayjs;
    let endDate: Dayjs;

    // 默认获取从当前到一个小时前时间段的日志
    if (!endTime) {
      endDate = dtz();
      startDate = endDate.add(-1, 'hour');
    } else {
      endDate = dtz(endTime);
      startDate = dtz(endDate.valueOf() - Number(interval) * 1000);
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
      curReq.startTime = formatDate(curReq.startTime);

      const detailLog = await this.getLogDetail({
        logsetId: logsetId,
        topicId: topicId,
        reqId: curReq.requestId,
        startTime: startDate.format(TIME_FORMAT),
        endTime: endDate.format(TIME_FORMAT),
      });
      curReq.message = (detailLog || [])
        .map(({ content }: { content: string }) => {
          try {
            const info = JSON.parse(content) as LogContent;
            if (info.SCF_Type === 'Custom') {
              curReq.memoryUsage = info.SCF_MemUsage;
              curReq.duration = info.SCF_Duration;
            }
            return info.SCF_Message;
          } catch (e) {
            return '';
          }
        })
        .join('');
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
      throw new CommonError({
        type: 'API_FAAS_getLogByReqId',
        message: `[FAAS] Can not get CLS config`,
      });
    }

    if (!reqId) {
      throw new CommonError({
        type: 'API_FAAS_getLogByReqId',
        message: `[FAAS] Parameter reqId(Request ID) invalid`,
      });
    }
    const endDate = dayjs(endTime);

    console.log(`[FAAS] Get log by Request ID: ${reqId}`);

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
    };
    curReq.message = (detailLog || [])
      .map(({ content, timestamp }) => {
        try {
          const info = JSON.parse(content) as LogContent;
          if (info.SCF_Type === 'Custom') {
            curReq.memoryUsage = info.SCF_MemUsage;
            curReq.duration = info.SCF_Duration;
            curReq.startTime = timestamp;
          }
          return info.SCF_Message;
        } catch (e) {
          return '';
        }
      })
      .join('');

    return curReq;
  }
}
