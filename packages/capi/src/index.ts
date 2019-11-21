import rp, { Options } from 'request-promise-native';
import assign from 'object-assign';
import qs from 'querystring';
import { logger, tencentSign, tencentSignV1 } from './utils';

export interface CapiOptions {
  debug?: boolean;
  host?: string;
  baseHost?: string;
  path?: string;
  method?: string;
  protocol?: string;
  ServiceType: string;
  Region: string;
  SecretId: string;
  SecretKey: string;
  maxKeys?: number;
  SignatureMethod?: string;
}

export interface RequestData {
  Action: string;
  RequestClient?: string;
  Version: string;
  SignatureMethod?: string;
  [propName: string]: any;
}

export interface RequestOptions {
  debug?: boolean;
  host?: string;
  baseHost?: string;
  path?: string;
  method?: string;
  protocol?: string;
  ServiceType?: string;
  Region?: string;
  SecretId?: string;
  SecretKey?: string;
  maxKeys?: number;
  SignatureMethod?: string;
}

export interface CapiInstance {
  request: (data: RequestData, opts?: RequestOptions) => Promise<any>;
}

export class Capi implements CapiInstance {
  options: CapiOptions;
  defaultOptions: RequestOptions = {
    path: '/', // api request path
    method: 'POST',
    protocol: 'https',
    baseHost: 'api.qcloud.com',
    ServiceType: 'api',
    SecretId: '',
    SecretKey: '',
    Region: 'ap-guangzhou',
    SignatureMethod: 'sha1', // sign algorithm, default is sha1
  };

  constructor(options: CapiOptions) {
    this.options = assign(this.defaultOptions, options);
  }

  request(
    data: RequestData,
    opts: RequestOptions = this.defaultOptions,
    isV3 = false,
  ) {
    const options = assign(this.options, opts);
    const { Action, Version, ...restData } = data;
    let reqOption = {
      url: '',
      method: '',
      json: true,
      strictSSL: false,
    } as Options;
    if (isV3) {
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
          'X-TC-Version': Version || '2018-03-21',
          'X-TC-Timestamp': Timestamp,
          'X-TC-Region': options.Region,
        },
        body: payload,
      };
    } else {
      const { url, method, signPath } = tencentSignV1(data, options);
      reqOption = {
        url,
        method,
        json: true,
        strictSSL: false,
      };
      const maxKeys = options.maxKeys || 1000;

      if (method === 'POST') {
        reqOption.form = qs.parse(signPath, '', '', {
          maxKeys,
        });
      } else {
        reqOption.url += '?' + signPath;
      }
    }
    // debug request option
    if (options.debug) {
      logger('Request Option', JSON.stringify(reqOption));
    }

    return rp(reqOption);
  }
}
