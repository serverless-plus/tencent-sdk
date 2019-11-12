import rp from 'request-promise-native';
import assign from 'object-assign';
import qs from 'querystring';
import dotQs from 'dot-qs';
import crypto from 'crypto';

interface CapiOptions {
  host?: string;
  baseHost?: string;
  path?: string;
  method?: string;
  protocol?: string;
  serviceType?: string;
  Region?: string;
  SecretId?: string;
  SecretKey?: string;
  signatureMethod?: string;
  maxKeys?: number;
}

interface RequestData {
  Action: string;
  RequestClient: string;
  Version?: string;
  SignatureMethod?: string;
  [propName: string]: any;
}

interface RequestParam {
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
    signatureMethod: 'sha1', // sign algorithm, default is sha1
  };

  constructor(options: CapiOptions) {
    this.options = assign(this.defaultOptions, options);
  }

  private getHost(opts: CapiOptions) {
    let host = opts.host;
    if (!host) {
      host =
        (opts.serviceType || this.options.serviceType) +
        '.' +
        (opts.baseHost || this.options.baseHost);
    }
    return host;
  }

  generateUrl(opts: CapiOptions) {
    opts = opts || {};
    const host = this.getHost(opts);
    const path = opts.path === undefined ? this.options.path : opts.path;

    return (opts.protocol || this.options.protocol) + '://' + host + path;
  }

  generateQueryString(data: RequestData, opts: CapiOptions) {
    opts = opts || this.options;

    let options = this.options;

    //附上公共参数
    let param: RequestParam = assign(
      {
        Region: this.options.Region,
        SecretId: opts.SecretId || this.options.SecretId,
        Timestamp: Math.round(Date.now() / 1000),
        Nonce: Math.round(Math.random() * 65535),
        RequestClient: 'SDK_NODEJS_v0.0.1', //非必须, sdk 标记
      },
      data,
    );

    // 初始化配置和传入的参数冲突时，以传入的参数为准
    let isSha256 =
      options.signatureMethod === 'sha256' || opts.signatureMethod === 'sha256';
    if (isSha256 && !data.SignatureMethod) param.SignatureMethod = 'HmacSHA256';

    let isAPIv3 = !!data.Version;

    param = dotQs.flatten(param);

    let keys = Object.keys(param);
    let qstr = '';

    let host = this.getHost(opts);
    let method = (opts.method || options.method || '').toUpperCase();
    let path = opts.path === undefined ? options.path : opts.path;

    keys.sort();

    //拼接 querystring, 注意这里拼接的参数要和下面 `qs.stringify` 里的参数一致
    //暂不支持纯数字键值及空字符串键值
    keys.forEach(function(key) {
      let val = param[key];
      // 排除上传文件的参数
      // modify 2018-10-25 云APIv3调用不排除‘@’字符开头的参数
      if (!isAPIv3 && method === 'POST' && val && val[0] === '@') {
        return;
      }
      if (key === '') {
        return;
      }
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'number' && isNaN(val))
      ) {
        val = '';
      }
      //把参数中的 "_" (除开开头)替换成 "."
      qstr +=
        '&' + (key.indexOf('_') ? key.replace(/_/g, '.') : key) + '=' + val;
    });

    qstr = qstr.slice(1);

    let hashResult; // 16进制负载hash值
    if (
      opts.signatureMethod === 'sha256' &&
      data.SignatureMethod === 'TC2-HmacSHA256'
    ) {
      hashResult = crypto
        .createHash(opts.signatureMethod)
        .update(qstr)
        .digest('hex');
      qstr = '\n' + hashResult;
    }

    const signStr = this.sign(
      method + host + path + '?' + qstr,
      opts.SecretKey || options.SecretKey || '',
      opts.signatureMethod || options.signatureMethod,
    );

    param.Signature = signStr;

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
        maxKeys: maxKeys,
      });
    } else {
      reqOption.url += '?' + dataStr;
    }

    return rp(reqOption);
  }
}
