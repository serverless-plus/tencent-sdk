import crypto from 'crypto';
import { CapiOptions } from './index';

export interface Payload {
  Region?: string;
  SecretId?: string;
  Timestamp?: number | string;
  Nonce?: number;
  [propName: string]: any;
}

export interface HostParams {
  ServiceType: string;
  Region: string;
  host: string | undefined;
  baseHost: string | undefined;
  path?: string;
  protocol?: string;
}

export interface TencentSignResult {
  url: string;
  payload: Payload;
  Host: string;
  Authorization: string;
  Timestamp: number | string;
}

export interface TencentSignResultV1 {
  url: string;
  method: string;
  payload: Payload;
}

export function logger(topic: string, content: string): void {
  console.log(`[DEBUG] ${topic}: ${content} `);
}

export function getHost(
  { host, ServiceType, Region, baseHost }: HostParams,
  isV1 = false,
) {
  if (!host) {
    host = `${ServiceType}${isV1 ? '' : `.${Region}`}.${baseHost}`;
  }
  return host;
}

export function getUnixTime(date: Date) {
  const val = date.getTime();
  return Math.ceil(val / 1000);
}

export function getDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month > 9 ? month : `0${month}`}-${
    day > 9 ? day : `0${day}`
  }`;
}

export function getUrl(opts: HostParams, isV1 = false) {
  opts = opts || {};
  const host = getHost(opts, isV1);
  const path = opts.path || '/';

  return `${opts.protocol || 'https'}://${host}${path}`;
}

export function sign(
  str: string,
  secretKey: Buffer,
  algorithm: string = 'sha256',
): Buffer {
  const hmac = crypto.createHmac(algorithm, secretKey);
  return hmac.update(Buffer.from(str, 'utf8')).digest();
}

/**
 * is array
 * @param obj object
 */
export function isArray(obj: any) {
  return Object.prototype.toString.call(obj) == '[object Array]';
}

/**
 * is object
 * @param obj object
 */
export function isObject(obj: any) {
  return obj === Object(obj);
}

/**
 * iterate object or array
 * @param obj object or array
 * @param iterator iterator function
 */
export function _forEach(
  obj: object | any[],
  iterator: (value: any, index: number | string, array: any) => void,
) {
  if (isArray(obj)) {
    let arr = obj as Array<any>;
    if (arr.forEach) {
      arr.forEach(iterator);
      return;
    }
    for (let i = 0; i < arr.length; i += 1) {
      iterator(arr[i], i, arr);
    }
  } else {
    const oo = obj as { [propName: string]: any };
    for (let key in oo) {
      if (obj.hasOwnProperty(key)) {
        iterator(oo[key], key, obj);
      }
    }
  }
}

/**
 * flatter request parameter
 * @param obj target object or array
 */
export function flatten(obj: {
  [propName: string]: any;
}): { [propName: string]: any } {
  if (!isArray(obj) && !isObject(obj)) {
    return {};
  }
  const ret: { [propName: string]: any } = {};
  const _dump = function(
    obj: object | Array<any>,
    prefix: string | null,
    parents?: any[],
  ) {
    const checkedParents: any[] = [];
    if (parents) {
      let i;
      for (i = 0; i < parents.length; i++) {
        if (parents[i] === obj) {
          throw new Error('object has circular references');
        }
        checkedParents.push(obj);
      }
    }
    checkedParents.push(obj);
    if (!isArray(obj) && !isObject(obj)) {
      if (!prefix) {
        throw obj + 'is not object or array';
      }
      ret[prefix] = obj;
      return {};
    }

    if (isArray(obj)) {
      // it's an array
      _forEach(obj, function(obj, i) {
        _dump(obj, prefix ? prefix + '.' + i : '' + i, checkedParents);
      });
    } else {
      // it's an object
      _forEach(obj, function(obj, key) {
        _dump(obj, prefix ? prefix + '.' + key : '' + key, checkedParents);
      });
    }
  };

  _dump(obj, null);
  return ret;
}

/**
 * generate tencent cloud sign result
 *
 * @param {Payload} payload
 * @param {CapiOptions} options
 * @returns {TencentSignResult}
 */
export function tencentSign(
  payload: Payload,
  options: CapiOptions,
): TencentSignResult {
  const hostParams: HostParams = {
    host: options.host,
    path: options.path,
    protocol: options.protocol,
    baseHost: options.baseHost,
    ServiceType: options.ServiceType,
    Region: options.Region,
  };
  const url = getUrl(hostParams);
  const Host = getHost(hostParams);
  const d = new Date();
  const Timestamp = getUnixTime(d);
  const date = getDate(d);
  const Algorithm = 'TC3-HMAC-SHA256';

  // 1. create Canonical request string
  const HTTPRequestMethod = (options.method || 'POST').toUpperCase();
  const CanonicalURI = '/';
  const CanonicalQueryString = '';
  const CanonicalHeaders = `content-type:application/json\nhost:${Host}\n`;
  const SignedHeaders = 'content-type;host';
  const HashedRequestPayload = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
  const CanonicalRequest = `${HTTPRequestMethod}\n${CanonicalURI}\n${CanonicalQueryString}\n${CanonicalHeaders}\n${SignedHeaders}\n${HashedRequestPayload}`;

  // 2. create string to sign
  const CredentialScope = `${date}/${options.ServiceType}/tc3_request`;
  const HashedCanonicalRequest = crypto
    .createHash('sha256')
    .update(CanonicalRequest)
    .digest('hex');
  const StringToSign = `${Algorithm}\n${Timestamp}\n${CredentialScope}\n${HashedCanonicalRequest}`;

  // 3. calculate signature
  const SecretDate = sign(date, Buffer.from(`TC3${options.SecretKey}`, 'utf8'));
  const SecretService = sign(options.ServiceType, SecretDate);
  const SecretSigning = sign('tc3_request', SecretService);
  const Signature = crypto
    .createHmac('sha256', SecretSigning)
    .update(Buffer.from(StringToSign, 'utf8'))
    .digest('hex');

  // 4. create authorization
  const Authorization = `${Algorithm} Credential=${options.SecretId}/${CredentialScope}, SignedHeaders=${SignedHeaders}, Signature=${Signature}`;

  return {
    url,
    payload,
    Host,
    Authorization,
    Timestamp,
  };
}

/**
 * version1: generate tencent cloud sign result
 *
 * @param {Payload} payload
 * @param {CapiOptions} options
 * @returns {TencentSignResultV1}
 */
export function tencentSignV1(
  payload: Payload,
  options: CapiOptions,
): TencentSignResultV1 {
  const hostParams: HostParams = {
    host: options.host,
    path: options.path,
    protocol: options.protocol,
    baseHost: options.baseHost,
    ServiceType: options.ServiceType,
    Region: options.Region,
  };
  const url = getUrl(hostParams, true);
  const Host = getHost(hostParams, true);
  const d = new Date();
  const Timestamp = getUnixTime(d);
  const Nonce = Math.round(Math.random() * 65535);

  payload.Region = options.Region;
  payload.Nonce = Nonce;
  payload.Timestamp = Timestamp;
  payload.SecretId = options.SecretId;
  payload.RequestClient = payload.RequestClient || 'SDK_NODEJS_v0.0.1';

  if (options.SignatureMethod === 'sha256') {
    payload.SignatureMethod = 'HmacSHA256';
  }

  payload = flatten(payload);

  const keys = Object.keys(payload).sort();
  const method = (options.method || 'POST').toUpperCase();

  let qstr = '';
  keys.forEach(function(key) {
    if (key === '') {
      return;
    }
    key = key.indexOf('_') ? key.replace(/_/g, '.') : key;
    let val = payload[key];
    if (method === 'POST' && val && val[0] === '@') {
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

  payload.Signature = sign(
    `${method}${Host}${options.path}?${qstr}`,
    Buffer.from(options.SecretKey, 'utf8'),
    options.SignatureMethod,
  ).toString('base64');

  return {
    url,
    method,
    payload,
  };
}
