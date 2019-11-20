import rp from 'request-promise-native';
import assign from 'object-assign';
import qs from 'querystring';
import dotQs from 'dot-qs';
import crypto from 'crypto';
import chalk from 'chalk';

export interface CapiOptions {
  debug?: boolean;
  host?: string;
  baseHost?: string;
  path?: string;
  method?: string;
  protocol?: string;
  ServiceType?: string;
  maxKeys?: number;
  Region?: string;
  SecretId?: string;
  SecretKey?: string;
  SignatureMethod?: string;
}

export interface RequestData {
  Action: string;
  RequestClient: string;
  Version?: string;
  SignatureMethod?: string;
  [propName: string]: any;
}

interface RequestParam extends CapiOptions, RequestData {
  [propName: string]: any;
}

export interface CapiInstance {
  request: (data: RequestData, opts?: CapiOptions) => Promise<any>;
}

export class Capi implements CapiInstance {
  options: CapiOptions;
  defaultOptions: CapiOptions = {
    path: '/v2/index.php', // api request path
    method: 'POST',
    protocol: 'https',
    baseHost: 'api.qcloud.com',
    SignatureMethod: 'sha1', // sign algorithm, default is sha1
  };

  constructor(options: CapiOptions) {
    this.options = assign(this.defaultOptions, options);
  }

  private getHost(opts: CapiOptions) {
    const options = assign({}, this.options, opts);
    let host = options.host;
    if (!host) {
      host = `${options.ServiceType}.${options.baseHost}`;
    }
    return host;
  }

  generateUrl(opts: CapiOptions) {
    opts = opts || {};
    const host = this.getHost(opts);
    const path = opts.path === undefined ? this.options.path : opts.path;

    return (opts.protocol || this.options.protocol) + '://' + host + path;
  }

  generateQueryString(data: RequestData, opts: CapiOptions = {}) {
    const options = assign(this.options, opts);

    //附上公共参数
    let param: RequestParam = assign(
      {
        Region: options.Region,
        SecretId: options.SecretId,
        Timestamp: Math.round(Date.now() / 1000),
        Nonce: Math.round(Math.random() * 65535),
        RequestClient: 'SDK_NODEJS_v0.0.1', //非必须, sdk 标记
      },
      data,
    );

    if (options.SignatureMethod === 'sha256') {
      param.SignatureMethod = 'HmacSHA256';
    }

    const isAPIv3 = !!data.Version;

    param = dotQs.flatten(param);

    const keys = Object.keys(param).sort();
    const host = this.getHost(opts);
    const method = (opts.method || options.method || '').toUpperCase();
    const path = options.path;

    let qstr = '';
    keys.forEach(function(key) {
      if (key === '') {
        return;
      }
      key = key.indexOf('_') ? key.replace(/_/g, '.') : key;
      let val = param[key];
      if (!isAPIv3 && method === 'POST' && val && val[0] === '@') {
        return;
      }
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'number' && isNaN(val))
      ) {
        val = '';
      }
      qstr += `&${key}=${val}`;
    });

    qstr = qstr.slice(1);

    param.Signature = this.sign(
      `${method}${host}${path}?${qstr}`,
      options.SecretKey || '',
      options.SignatureMethod,
    );

    return qs.stringify(param);
  }

  sign(str: string, secretKey: string, signatureMethod: string = 'sha1') {
    const hmac = crypto.createHmac(signatureMethod, secretKey || '');
    return hmac.update(Buffer.from(str, 'utf8')).digest('base64');
  }

  request(data: RequestData, opts: CapiOptions = {}) {
    const options = assign(this.options, opts);
    const url = this.generateUrl(options);
    const method = (options.method || 'POST').toUpperCase();
    const dataStr = this.generateQueryString(data, options);
    const reqOption = {
      url,
      method,
      json: true,
      strictSSL: false,
      form: {},
    };
    const maxKeys = options.maxKeys || 1000;

    if (method === 'POST') {
      reqOption.form = qs.parse(dataStr, '', '', {
        maxKeys,
      });
    } else {
      reqOption.url += '?' + dataStr;
    }

    // debug request option
    if (options.debug) {
      console.log(
        chalk.black.bgYellow('[DEBUG]') +
          ` Request Option: ${JSON.stringify(reqOption)}`,
      );
    }

    return rp(reqOption);
  }
}
