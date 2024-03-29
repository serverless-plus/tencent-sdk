## Tencent Cloud FaaS SDK

专门为 [腾讯云云函数](https://console.cloud.tencent.com/scf) 提供的 SDK 工具.

## 安装

```bash
$ npm i @tencent-sdk/faas --save
# 或者
$ yarn add @tencent-sdk/faas
```

## 使用

初始化实例:

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

### 参数说明

| 参数      | 描述                     | 类型    | 必须 | 默认值       |
| --------- | ------------------------ | ------- | :--: | ------------ |
| secretId  | 腾讯云 API 密钥 ID       | string  |  是  | ''           |
| secretKey | 腾讯云 API 密钥 Key      | string  |  是  | ''           |
| token     | 腾讯云临时鉴权密钥 Token | string  |  否  | ''           |
| region    | 请求服务地域             | string  |  否  | ap-guangzhou |
| debug     | 是否打印调试信息         | boolean |  否  | false        |

### 支持方法

- 获取地区配置 [getRegion()](#getRegion)
- 设置地区 [setRegion()](#setRegion)
- 调用该函数 [invoke()](#invoke)
- 获取函数 CLS 配置 [getClsConfig()](#getClsConfig)
- 获取 CLS 日志列表 [getLogList()](#getLogList)
- 获取日志详情 [getLogDetail()](#getLogDetail)
- 通过请求 ID 获取日志详情 [getLogByReqId()](#getLogByReqId)

### getRegion

获取当前地区配置:

```js
const region = client.getRegion();
```

### setRegion

配置服务地区:

```js
client.setRegion('ap-guangzhou');
```

### invoke

调用函数:

```js
const res = await faas.invoke({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
});
```

参数说明：

| 参数      | 描述     |  类型  | 必须 | 默认      |
| --------- | -------- | :----: | :--: | --------- |
| name      | 函数名称 | string |  是  |           |
| namespace | 命名空间 | string |  否  | `default` |
| qualifier | 函数版本 | string |  否  | `$LATEST` |
| event     | 触发参数 | object |  否  | `{}`      |

`event` 为触发函数的事件对象的。

如果函数是 `web` 类型，`event` 对象参数如下：

| 参数   | 描述     |  类型  | 必须 | 默认  |
| ------ | -------- | :----: | :--: | ----- |
| method | 请求方法 | string |  否  | `get` |
| path   | 请求路径 | string |  否  | `/`   |
| data   | 请求数据 | object |  否  | `{}`  |

### getClsConfig

获取函数 CLS 配置:

```js
const res = await faas.getClsConfig({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
});
```

### getLogList

获取日志列表:

```js
const res = await faas.getLogList({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
});
```

> 注意: 默认获取最近 10 分钟日志。

通过 `startTime` 和 `endTime` 参数，获取时间段内日志:

```js
const res = await faas.getLogList({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
  startTime: '2021-04-30 14:00:00',
  endTime: '2021-04-30 14:15:00',
});
```

> 注意：时间必须是 UTC+8 （亚洲/上海时区）时间。

由于云函数是流失日志，日志落盘到 CLS 是有时间延迟的，所以在实时获取日志是会存在最新的部分日志信息并不完整，如果需要过滤掉这些不完整的日志，可以通过传递参数 `isFilterCompleted` 为 `true` 来实现。

参数说明：

| 参数              | 描述                               |       类型       | 必须 | 默认         |
| ----------------- | ---------------------------------- | :--------------: | :--: | ------------ |
| name              | 函数名称                           |      string      |  是  |              |
| namespace         | 命名空间                           |      string      |  否  | `default`    |
| qualifier         | 函数版本                           |      string      |  否  | `$LATEST`    |
| startTime         | 开始时间，支持格式化的时间和时间戳 | `string\|number` |  否  |              |
| endTime           | 结束时间，支持格式化的时间和时间戳 | `string\|number` |  否  | `Date.now()` |
| reqId             | 请求 ID                            |      string      |  否  |              |
| status            | 日志状态                           |      string      |  否  |              |
| interval          | 时间间隔，单位秒                   |      string      |  否  | `600s`       |
| limit             | 获取条数                           |      string      |  否  |              |
| isFilterCompleted | 是否过滤掉不完整的日志             |     boolean      |  否  | `false`      |

### getLogDetail

获取指定请求 ID 日志详情（日志元数据）:

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

参数说明：

| 参数      | 描述        |  类型  | 必须 | 默认      |
| --------- | ----------- | :----: | :--: | --------- |
| name      | 函数名称    | string |  是  |           |
| namespace | 命名空间    | string |  否  | `default` |
| qualifier | 函数版本    | string |  否  | `$LATEST` |
| logsetId  | 日志集 ID   | string |  是  |           |
| topicId   | 日志主题 ID | string |  是  |           |
| reqId     | 请求 ID     | string |  是  |           |

### getLogByReqId

通过请求 ID 获取日志详情（组装日志数据）:

```js
const res = await faas.getLogByReqId({
  name: 'serverless-test',
  namespace: 'default',
  qualifier: '$LATEST',
  reqId: 'xxx-xxx',
});
```

参数说明：

| 参数      | 描述     |  类型  | 必须 | 默认      |
| --------- | -------- | :----: | :--: | --------- |
| name      | 函数名称 | string |  是  |           |
| namespace | 命名空间 | string |  否  | `default` |
| qualifier | 函数版本 | string |  否  | `$LATEST` |
| reqId     | 请求 ID  | string |  是  |           |

## 错误码

| 类型                   | 错误码 | 描述                     |
| ---------------------- | ------ | ------------------------ |
| API_FAAS_get           | 1000   | 查找函数其他错误信息     |
| API_FAAS_get           | 1001   | 无法找到制定函数         |
| API_FAAS_getClsConfig  | 1002   | 无法获取函数的 CLS 配置  |
| API_FAAS_getLogByReqId | 1003   | 无效的请求 ID            |
| API_FAAS_getTriggers   | 1004   | 无法获取函数的触发器列表 |
| API_FAAS_getNamespace  | 1005   | 未找到制定的 namespace   |
| API_FAAS_getQualifier  | 1006   | 未找到指定的 qualifier   |

## License

MIT
