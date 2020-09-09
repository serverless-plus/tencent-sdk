## Tencent Cound API

This is a basement api tool for all tencent cloud apis supporting Node.js and Browser.

## Usage

`Capi` is the only class for create a client request instance, and the instance only has one method `request`.
You can use it like below:

```js
import { Capi } from '@tencent-sdk/capi';

const client = new Capi({
  Region: 'ap-guangzhou',
  SecretId: 'Please input your SecretId',
  SecretKey: 'Please input your SecretKey',
  Token: 'Please input your Token',
  ServiceType: 'tmt',
});
try {
  const res = await client.request(
    {
      Action: 'TextTranslate',
      Version: '2018-03-21',
      SourceText: 'hello',
      Source: 'auto',
      Target: 'zh',
      ProjectId: 0,
    },
    {
      debug: true,
      host: 'tmt.tencentcloudapi.com',
    },
  );
  console.log('res', res);
} catch (e) {
  console.log(e);
}
```

> This is a demo for using Tencent Machine Translator.

## Options

```js
const client = new Capi(CapiOptions);
client.request(RequestData, RequestOptions, isV3);
```

### `CapiOptions` for Capi Constructor

| Name            | Description                                      | Type    | Required | Default             |
| --------------- | ------------------------------------------------ | ------- | -------- | ------------------- |
| isV3            | whether to use version 3 sign for authentication | boolean | false    | false               |
| debug           | whether enable log debug info                    | boolean | false    | false               |
| host            | request host                                     | string  | false    | false               |
| baseHost        | request domain                                   | string  | false    | 'api.qcloud.com'    |
| path            | request path                                     | string  | false    | '/'                 |
| method          | request method                                   | string  | false    | 'POST'              |
| protocol        | request protocol                                 | string  | false    | 'https'             |
| ServiceType     | tencent service type                             | string  | true     | ''                  |
| Region          | request region                                   | string  | true     | ap-guangzhou        |
| SecretId        | tencent account secret id                        | string  | true     | ''                  |
| SecretKey       | tencent account secret key                       | string  | true     | ''                  |
| Token           | tencent account token                            | string  | false    | ''                  |
| SignatureMethod | request signature                                | string  | false    | 'sha1'              |
| RequestClient   | request client for api mark                      | string  | false    | '@tencent-sdk/capi' |

### `RequestData` for reqeust method

| Name          | Description          | Type   | Required | Default      |
| ------------- | -------------------- | ------ | -------- | ------------ |
| Action        | api action           | string | true     | ''           |
| Version       | api version          | string | true     | '2018-03-21' |
| RequestClient | specify your service | string | false    | 'TSS-CAPI'   |
| [propName]    | left api parameters  | any    | false    | ''           |

### `RequestOptions` for reqeust method

| Name          | Description                   | Type    | Required | Default             |
| ------------- | ----------------------------- | ------- | -------- | ------------------- |
| debug         | whether enable log debug info | boolean | false    | false               |
| host          | request host                  | string  | false    | false               |
| baseHost      | request domain                | string  | false    | 'api.qcloud.com'    |
| path          | request path                  | string  | false    | '/'                 |
| method        | request method                | string  | false    | 'POST'              |
| protocol      | request protocol              | string  | false    | 'https'             |
| RequestClient | request client for api mark   | string  | false    | '@tencent-sdk/capi' |

### `isV3` for request method

`isV3` is used to specify to use version for authentication.

> `true`: using `TC3-HMAC-SHA256`  
> `false`: using `HmacSHA256` or `Sha1`

## License

MIT
