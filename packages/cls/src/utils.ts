import {
  KeyValueObject,
  sortObjectKey,
  stringifyObject,
  sha1,
  hash,
} from '@tencent-sdk/common';

function sortHeaderKey(obj: KeyValueObject): string[] {
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

export interface GenerateSignatureOptions {
  secretId: string;
  secretKey: string;
  method: string;
  path: string;
  parameters: KeyValueObject;
  headers: KeyValueObject;
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
