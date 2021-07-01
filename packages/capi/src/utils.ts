import { createHash, createHmac } from 'crypto';
import { Method } from 'got';
import { getUnixTime, getDate, flatten } from '@tencent-sdk/common';
import { CapiOptions } from './index';

export interface Payload {
  Region?: string;
  SecretId?: string;
  Timestamp?: number | string;
  Nonce?: number;
  [propName: string]: any;
}

export interface HostParams {
  serviceType: string;
  region: string;
  host: string | undefined;
  baseHost: string | undefined;
  path?: string;
  protocol?: string;
}

export interface TencentSignResult {
  url: string;
  payload: Payload;
  host: string;
  authorization: string;
  timestamp: string | string[] | undefined;
}

export interface TencentSignResultV1 {
  url: string;
  method: Method;
  payload: Payload;
}

export function getHost(
  { host, serviceType, region, baseHost }: HostParams,
  isV1 = false,
) {
  if (!host) {
    host = `${serviceType}${isV1 ? '' : `.${region}`}.${baseHost}`;
  }
  return host;
}

export function getUrl(opts: HostParams, isV1 = false) {
  const host = getHost(opts, isV1);
  const path = opts.path || '/';

  return `${opts.protocol || 'https'}://${host}${path}`;
}

export function sign(
  str: string,
  secretKey: Buffer,
  algorithm: string = 'sha256',
): Buffer {
  const hmac = createHmac(algorithm, secretKey);
  return hmac.update(Buffer.from(str, 'utf8')).digest();
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
    serviceType: options.serviceType,
    region: options.region,
  };
  const url = getUrl(hostParams);
  const host = getHost(hostParams);
  const d = new Date();
  const timestamp = String(getUnixTime(d));
  const date = getDate(d);
  const algorithm = 'TC3-HMAC-SHA256';

  // 1. create Canonical request string
  const httpRequestMethod = (options.method || 'POST').toUpperCase();
  const canonicalURI = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const hashedRequestPayload = createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
  const canonicalRequest = `${httpRequestMethod}\n${canonicalURI}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

  // 2. create string to sign
  const credentialScope = `${date}/${options.serviceType}/tc3_request`;
  const hashedCanonicalRequest = createHash('sha256')
    .update(canonicalRequest)
    .digest('hex');
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // 3. calculate signature
  const secretDate = sign(date, Buffer.from(`TC3${options.secretKey}`, 'utf8'));
  const secretService = sign(options.serviceType, secretDate);
  const secretSigning = sign('tc3_request', secretService);
  const signature = createHmac('sha256', secretSigning)
    .update(Buffer.from(stringToSign, 'utf8'))
    .digest('hex');

  // 4. create authorization
  const authorization = `${algorithm} Credential=${options.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url,
    payload,
    host,
    authorization,
    timestamp,
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
    serviceType: options.serviceType,
    region: options.region,
  };
  const url = getUrl(hostParams, true);
  const Host = getHost(hostParams, true);
  const d = new Date();
  const Timestamp = getUnixTime(d);
  const Nonce = Math.round(Math.random() * 65535);

  payload.Region = options.region;
  payload.Nonce = Nonce;
  payload.Timestamp = Timestamp;
  payload.SecretId = options.secretId;
  payload.Version = payload.Version || options.version;
  payload.RequestClient = options.requestClient;

  if (options.token) {
    payload.Token = options.token;
  }
  if (options.signatureMethod === 'sha256') {
    payload.SignatureMethod = 'HmacSHA256';
  }

  payload = flatten(payload);

  const keys = Object.keys(payload).sort();
  const method = (options.method || 'POST').toUpperCase() as Method;

  let qstr = '';
  keys.forEach((key) => {
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
    Buffer.from(options.secretKey, 'utf8'),
    options.signatureMethod,
  ).toString('base64');

  return {
    url,
    method,
    payload,
  };
}
