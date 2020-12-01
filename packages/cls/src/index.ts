import got, { Options } from 'got';
import { logger, tencentSign, querystring } from './utils';
import {
  ClsOptions,
  ApiResponse,
  CreateTopicData,
  UpdateTopicData,
  UpdateIndexData,
  RequestOptions,
} from './typings';

export { tencentSign } from './utils';

export class Cls {
  options: ClsOptions;
  constructor(options: ClsOptions) {
    this.options = options;

    this.options.region = this.options.region || 'ap-guangzhou';
    this.options.expire = this.options.expire || 300000;
  }

  /**
   * get logsets list
   */
  async getLogsetList(): Promise<ApiResponse> {
    const res = await this.request({
      method: 'GET',
      path: '/logsets',
    });
    return res;
  }

  /**
   * get logset detail
   * @param logset_id string
   */
  async getLogset(data: { logset_id: string }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'GET',
      path: '/logset',
      query: data,
    });
    return res;
  }

  /**
   * create logset
   * @param data
   */
  async createLogset(data: {
    logset_name: string;
    period: number;
  }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'POST',
      path: '/logset',
      data,
    });
    return res;
  }

  /**
   * update logset
   * @param data
   */
  async updateLogset(data: {
    logset_id: string;
    logset_name: string;
    period: number;
  }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'PUT',
      path: '/logset',
      data,
    });
    return res;
  }

  /**
   * dalete logset
   * @param data
   */
  async deleteLogset(data: { logset_id: string }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'DELETE',
      path: '/logset',
      query: data,
    });
    return res;
  }

  /**
   * create topic
   * @param data
   */
  async createTopic(data: CreateTopicData): Promise<ApiResponse> {
    const res = await this.request({
      method: 'POST',
      path: '/topic',
      data,
    });
    return res;
  }

  /**
   * get topic
   * @param data
   */
  async getTopic(data: { topic_id: string }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'GET',
      path: '/topic',
      query: data,
    });
    return res;
  }

  /**
   * get topic
   * @param data
   */
  async getTopicList(data: { logset_id: string }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'GET',
      path: '/topics',
      query: data,
    });
    return res;
  }

  /**
   * update topic
   * @param data
   */
  async updateTopic(data: UpdateTopicData): Promise<ApiResponse> {
    const res = await this.request({
      method: 'PUT',
      path: '/topic',
      data,
    });
    return res;
  }

  /**
   * delete topic
   * @param data
   */
  async deleteTopic(data: { topic_id: string }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'DELETE',
      path: '/topic',
      query: data,
    });
    return res;
  }

  async getIndex(data: { topic_id: string }): Promise<ApiResponse> {
    const res = await this.request({
      method: 'GET',
      path: '/index',
      query: data,
    });
    return res;
  }

  /**
   * update index
   * @param data
   */
  async updateIndex(data: UpdateIndexData): Promise<ApiResponse> {
    const res = await this.request({
      method: 'PUT',
      path: '/index',
      data,
    });
    return res;
  }

  async request({
    method,
    path,
    query,
    data,
  }: RequestOptions): Promise<ApiResponse> {
    const { options } = this;
    const host = `${options.region}.cls.myqcloud.com`;
    const authorization = tencentSign({
      secretId: options.secretId,
      secretKey: options.secretKey,
      // default 5 minutes
      expire: options.expire || 300000,
      method,
      path,
      parameters: query || {},
      headers: {
        Host: host,
      },
    });

    let url = `https://${host}${path}`;

    const reqOption: Options = {
      url,
      method,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
        Host: host,
      },
      json: data || undefined,
    };
    if (query) {
      reqOption.url = `https://${host}${path}?${querystring(query)}`;
    }

    if (options.token) {
      if (!reqOption.headers) {
        reqOption.headers = {};
      }
      reqOption.headers['x-cls-token'] = options.token;
    }
    if (options.timeout) {
      reqOption.timeout = options.timeout;
    }
    // debug request option
    if (options.debug) {
      logger('Request Option', JSON.stringify(reqOption));
    }

    try {
      const { headers, body, statusCode } = (await got(
        reqOption,
      )) as ApiResponse;
      const reqId = headers && headers['x-cls-requestid'];
      if (!body) {
        return {
          requestId: reqId,
          success: statusCode === 200,
        };
      }
      body.requestId = reqId;
      return body as ApiResponse;
    } catch (e) {
      const response = e.response || {};
      const reqId = response.headers && response.headers['x-cls-requestid'];

      return {
        requestId: reqId,
        error: {
          message: reqId ? `${e.message} (reqId: ${reqId})` : e.message,
        },
      };
    }
  }
}
