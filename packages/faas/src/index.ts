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
  FaasBaseConfig,
  FunctionInfo,
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

  constructor(credentials: Credentials, region: string = 'ap-guangzhou') {
    this.credentials = credentials;
    this.region = region;
    this.capi = new Capi({
      Region: region,
      ServiceType: ServiceType.faas,
      SecretId: credentials.secretId,
      SecretKey: credentials.secretKey,
      Token: this.credentials.token,
    });

    this.cls = new Cls({
      region: this.region,
      secretId: credentials.secretId,
      secretKey: credentials.secretKey,
      token: credentials.token,
      debug: false,
    });

    // 函数 CLS 配置缓存
    this.clsConfigCache = {};
  }

  /**
   * 设置当前地域
   * @param region 地区
   */
  setRegion(region: string) {
    this.region = region;
    this.capi.options.Region = region;
    this.cls.options.region = region;
  }

  /**
   * 获取当前地域
   * @returns 地域
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
   * @param param0
   * @returns FunctionInfo | null
   */
  async get({
    name,
    namespace = 'default',
    qualifier = '$LATEST',
    showCode = false,
    showTriggers = false,
  }: {
    // 是否需要获取函数代码，默认设置为 false，提高查询效率
    showCode?: boolean;
    // 是否需要获取函数触发器，默认设置为 false，提高查询效率
    showTriggers?: boolean;
  } & FaasBaseConfig): Promise<FunctionInfo | null> {
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
   * @param FaasBaseConfig faas 基本配置
   * @returns ClsConfig
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
