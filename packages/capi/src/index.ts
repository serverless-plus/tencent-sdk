import * as rp from 'request-promise-native';
import { logger, tencentSign, tencentSignV1, querystring } from './utils';

export { tencentSign, tencentSignV1 } from './utils';

export interface CapiOptions {
  isV3?: boolean; // whether to use version3 sign method
  debug?: boolean; // whether enable log debug info
  host?: string; // request host
  baseHost?: string; // request domain, default: api.qcloud.com
  path?: string; // request path, default: /
  method?: string; // request method, default: POST
  protocol?: string; // request protocol, default: https
  timeout?: number; // request timeout in miliseconds
  ServiceType: string; // tencent service type, eg: apigateway
  Version?: string; // tencent service type, eg: apigateway
  Region: string; // request region, default: ap-guangzhou
  SecretId: string; // tencent account secret id
  SecretKey: string; // tencent account secret key
  Token?: string; // tencent account token
  SignatureMethod?: string; // request signature method, default: sha1
  RequestClient?: string; // request client
}

export interface RequestData {
  Action: string; // request action
  RequestClient?: string; // optional, just to specify your service
  Version?: string; // api version, default: 2018-03-21
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
  RequestClient?: string; // request client
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
    ServiceType: '',
    SecretId: '',
    SecretKey: '',
    Region: 'ap-guangzhou',
    SignatureMethod: 'sha1', // sign algorithm, default is sha1
  };

  constructor(options: CapiOptions) {
    this.options = Object.assign(this.defaultOptions, options);
  }

  request(
    data: RequestData,
    opts: RequestOptions = this.defaultOptions,
    isV3 = false,
  ) {
    const options = Object.assign(this.options, opts);
    options.RequestClient =
      options.RequestClient || data.RequestClient || 'TENCENT_SDK_CAPI';
    const { Action, Version, ...restData } = data;
    let reqOption = {
      url: '',
      method: '',
      json: true,
      strictSSL: false,
    } as rp.Options;
    if (isV3 || opts.isV3) {
      const { url, payload, Authorization, Timestamp, Host } = tencentSign(
        restData,
        options,
      );
      reqOption = {
        url,
        method: 'POST',
        json: true,
        strictSSL: false,
        headers: {
          'Content-Type': 'application/json',
          Authorization: Authorization,
          Host: Host,
          'X-TC-Action': Action,
          'X-TC-Version': Version || options.Version,
          'X-TC-Timestamp': Timestamp,
          'X-TC-Region': options.Region,
        },
        body: payload,
      };
      if (!reqOption.headers) {
        reqOption.headers = {};
      }
      reqOption.headers['X-TC-RequestClient'] = options.RequestClient;
      if (this.options.Token) {
        reqOption.headers['X-TC-Token'] = this.options.Token;
      }
    } else {
      const { url, method, payload } = tencentSignV1(data, options);
      reqOption = {
        url,
        method,
        json: true,
        strictSSL: false,
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

    return rp.default(reqOption);
  }
}
