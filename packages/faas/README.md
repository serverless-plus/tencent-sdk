## Tencent Cloud FaaS SDK

This is a SDK tool for [Tencent Cloud FaaS](https://console.cloud.tencent.com/scf) service.

## Installation

```bash
$ npm i @tencent-sdk/faas --save
# or
$ yarn add @tencent-sdk/faas
```

## Usage

`FaaS` is the only class for create a client request instance.
You can use it like below:

```js
import { FaaS } from '@tencent-sdk/faas';

const client = new FaaS({
  secretId: 'Please input your SecretId',
  secretKey: 'Please input your SecretKey',
  token: 'Please input your Token',
  region: 'ap-guangzhou',
  debug: false,
});
```

Support methods:

- [getRegion()](#getRegion)
- [setRegion()](#setRegion)
- [invoke()](#invoke)
- [getClsConfig()](#getClsConfig)
- [getLogList()](#getLogList)
- [getLogDetail()](#getLogDetail)
- [getLogByReqId()](#getLogByReqId)

### getRegion

Get current region config:

```js
const region = client.getRegion();
```

### setRegion

Config service region:

```js
client.setRegion('ap-guangzhou');
```

### invoke

Invoke faas:

```js
const res = await faas.invoke({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
});
```

### getClsConfig

Get CLS config:

```js
const res = await faas.getClsConfig({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
});
```

### getLogList

Get log list:

```js
const res = await faas.getLogList({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
});
```

> Notice: Default in 1 hour

### getLogDetail

Create log detail by request id:

```js
const res = await faas.getLogDetail({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
  logsetId: 'xxx-xxx',
  topicId: 'xxx-xxx',
  reqId: 'xxx-xxx',
});
```

### getLogByReqId

Get topic:

```js
const res = await faas.getLogByReqId({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
  reqId: 'xxx-xxx',
});
```

## Options

```js
const client = new FaaS(FaasOptions);
```

### `FaasOptions` for FaaS Construct

| Name      | Description                   | Type    | Required | Default      |
| --------- | ----------------------------- | ------- | -------- | ------------ |
| secretId  | tencent account secret id     | string  | true     | ''           |
| secretKey | tencent account secret key    | string  | true     | ''           |
| token     | tencent account token         | string  | false    | ''           |
| region    | request region                | string  | true     | ap-guangzhou |
| debug     | whether enable log debug info | boolean | false    | false        |

## License

MIT
