import { createHmac, createHash, BinaryLike } from 'crypto';

export interface AnyObject {
  [prop: string]: any;
}

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

export function logger(topic: string, content: string): void {
  console.log(`[DEBUG] ${topic}: ${content} `);
}

export function getUnixTime(date: Date) {
  const val = date.getTime();
  return Math.ceil(val / 1000);
}

export function getDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}-${month > 9 ? month : `0${month}`}-${
    day > 9 ? day : `0${day}`
  }`;
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

function stringifyPrimitive(v: any) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
}

function safeUrlEncode(str: string | number | boolean) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

interface ParsedUrlQueryInput {
  [key: string]: any;
}

export function querystring(obj?: ParsedUrlQueryInput): string {
  const sep = '&';
  const eq = '=';

  if (!obj) return '';

  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .map(function(k) {
        let ks = safeUrlEncode(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return (obj[k] as Array<any>)
            .map(function(v) {
              return ks + safeUrlEncode(stringifyPrimitive(v));
            })
            .join(sep);
        } else {
          return ks + safeUrlEncode(stringifyPrimitive(obj[k]));
        }
      })
      .filter(Boolean)
      .join(sep);
  }

  return '';
}

export function sha1(str: string, key: BinaryLike): string {
  return createHmac('sha1', key)
    .update(str)
    .digest('hex');
}

export function hash(str: string, algorithm: string): string {
  return createHash(algorithm)
    .update(str)
    .digest('hex');
}

function sortObjectKey(obj: AnyObject): string[] {
  const list: string[] = [];
  Object.keys(obj).forEach((key: string) => {
    if (obj.hasOwnProperty(key)) {
      list.push(key);
    }
  });

  return list.sort((a: string, b: string) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
  });
}

function sortHeaderKey(obj: AnyObject): string[] {
  const list: string[] = [];
  Object.keys(obj).forEach((key: string) => {
    const lowerKey = key.toLowerCase();
    if (
      obj.hasOwnProperty(key) &&
      (lowerKey === 'content-type' ||
        lowerKey === 'content-md5' ||
        lowerKey === 'host' ||
        lowerKey[0] === 'x')
    ) {
      list.push(key);
    }
  });
  return list.sort((a: string, b: string) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
  });
}

function stringifyObject(
  obj: AnyObject,
  sortKeyMethod: (o: AnyObject) => string[],
): string {
  const list: string[] = [];
  const keyList = sortKeyMethod(obj);
  keyList.forEach((key) => {
    let val = obj[key] === undefined || obj[key] === null ? '' : '' + obj[key];
    key = key.toLowerCase();
    key = safeUrlEncode(key);
    val = safeUrlEncode(val) || '';
    list.push(key + '=' + val);
  });
  return list.join('&');
}

interface GenerateSignatureOptions {
  secretId: string;
  secretKey: string;
  method: string;
  path: string;
  parameters: AnyObject;
  headers: AnyObject;
  expire: number;
}

export function tencentSign({
  secretId,
  secretKey,
  method,
  path,
  parameters,
  headers,
  expire,
}: GenerateSignatureOptions): string {
  let now = Math.floor(Date.now() / 1000);
  const exp = now + Math.floor(expire / 1000);
  now = now - 60;

  // api only support sha1
  const ALGORITHM = 'sha1';

  const signTime = now + ';' + exp;
  const sortedHeader = sortHeaderKey(headers)
    .join(';')
    .toLowerCase();

  const sortedParameters = sortObjectKey(parameters)
    .join(';')
    .toLowerCase();

  // Refer to: https://cloud.tencent.com/document/product/614/12445
  // 1. SignKey
  const signKey = sha1(signTime, secretKey);

  // 2. HttpRequestInfo
  const formatString = [
    method.toLowerCase(),
    path,
    stringifyObject(parameters, sortObjectKey),
    stringifyObject(headers, sortHeaderKey),
    '',
  ].join('\n');
  //formatString = Buffer.from(formatString, 'utf8');

  // 3. StringToSign
  const stringToSign = [
    ALGORITHM,
    signTime,
    hash(formatString, ALGORITHM),
    '',
  ].join('\n');

  // 4. Signature
  const signature = sha1(stringToSign, signKey);

  // 步骤五：构造 Authorization
  const authorization = [
    'q-sign-algorithm=' + ALGORITHM,
    'q-ak=' + secretId,
    'q-sign-time=' + signTime,
    'q-key-time=' + signTime,
    'q-header-list=' + sortedHeader,
    'q-url-param-list=' + sortedParameters,
    'q-signature=' + signature,
  ].join('&');

  return authorization;
}
