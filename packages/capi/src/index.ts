import got, { Options, Response } from 'got';
import { logger, pascalCaseProps, querystring } from '@tencent-sdk/common';
import { tencentSign, tencentSignV1 } from './utils';

export { tencentSign, tencentSignV1 } from './utils';

export * from './factory';

export interface CapiOptions {
  isPascalCase?: boolean; // whether api parameter need use pascalCase to handler
  isV3?: boolean; // whether to use version3 sign method
  debug?: boolean; // whether enable log debug info
  host?: string; // request host
  baseHost?: string; // request domain, default: api.qcloud.com
  path?: string; // request path, default: /
  method?: string; // request method, default: POST
  protocol?: string; // request protocol, default: https
  timeout?: number; // request timeout in miliseconds

  serviceType: string; // tencent service type, eg: apigateway
  version?: string; // tencent service type, eg: apigateway
  region: string; // request region, default: ap-guangzhou
  secretId: string; // tencent account secret id
  secretKey: string; // tencent account secret key
  token?: string; // tencent account token
  signatureMethod?: string; // request signature method, default: sha1
  requestClient?: string; // request client
}

export interface RequestData {
  action: string; // request action
  requestClient?: string; // optional, just to specify your service
  version?: string; // api version, default: 2018-03-21
  [propName: string]: any; // left api parameters
}

export interface RequestOptions {
  isV3?: boolean; // whether to use version3 sign method
  debug?: boolean; // whether enable log debug info
  host?: string; // request host
  baseHost?: string; // request domain, default: api.qcloud.com
  path?: string; // request path, default: /
  method?: string; // request method, default: POST
  protocol?: string; // request protocol, default: https
  timeout?: number; // request timeout in miliseconds
  requestClient?: string; // request client
}

export interface CapiInstance {
  request: (
    data: RequestData,
    opts?: RequestOptions,
    isV3?: boolean,
  ) => Promise<any>;
}

export class Capi implements CapiInstance {
  options: CapiOptions;
  defaultOptions: CapiOptions = {
    path: '/', // api request path
    method: 'POST',
    protocol: 'https',
    baseHost: 'tencentcloudapi.com',
    serviceType: '',
    secretId: '',
    secretKey: '',
    region: 'ap-guangzhou',
    signatureMethod: 'sha1', // sign algorithm, default is sha1
    isPascalCase: true,
  };

  constructor(options: CapiOptions) {
    this.options = Object.assign(this.defaultOptions, options);
  }

  async request(
    data: RequestData,
    opts: RequestOptions = this.defaultOptions,
    isV3 = false,
  ) {
    const options = Object.assign(this.options, opts);
    options.requestClient =
      options.requestClient || data.requestClient || 'TENCENT_SDK_CAPI';
    const { action, version, ...restData } = data;

    let reqOption: Options = {
      url: '',
      method: 'GET',
      responseType: 'json',
    };
    if (isV3 || opts.isV3) {
      const { url, payload, authorization, timestamp, host } = tencentSign(
        this.options.isPascalCase ? pascalCaseProps(restData) : restData,
        options,
      );
      reqOption = {
        url,
        method: 'POST',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
          Host: host,
          'X-TC-Action': action,
          'X-TC-Version': version || options.version,
          'X-TC-Timestamp': timestamp,
          'X-TC-Region': options.region,
        },
        json: payload,
      };
      reqOption.headers!['X-TC-RequestClient'] = options.requestClient;
      if (this.options.token) {
        reqOption.headers!['X-TC-Token'] = this.options.token;
      }
    } else {
      const { url, method, payload } = tencentSignV1(
        this.options.isPascalCase ? pascalCaseProps(data) : data,
        options,
      );
      reqOption = {
        url,
        method,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST') {
        reqOption.form = payload;
      } else {
        reqOption.url += '?' + querystring(payload);
      }
    }

    if (options.timeout) {
      reqOption.timeout = options.timeout;
    }
    // debug request option
    if (options.debug) {
      logger('Request Option', JSON.stringify(reqOption));
    }

    const { url, ...restOptions } = reqOption;
    const { body } = (await got(url!, restOptions)) as Response;
    return body as any;
  }
}
