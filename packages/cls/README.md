## Tencent Cloud CLS SDK

This is a SDK tool for [Tencent Cloud CLS](https://console.cloud.tencent.com/cls) service.

## Usage

`Cls` is the only class for create a client request instance.
You can use it like below:

```js
import { Cls } from '@tencent-sdk/cls';

const client = new Cls({
  region: 'ap-guangzhou',
  secretId: 'Please input your SecretId',
  secretKey: 'Please input your SecretKey',
  token: 'Please input your Token',
  debug: false,
});
```

Support methods:

- [getLogsetList()](#getLogsetList)
- [createLogset()](#createLogset)
- [getLogset()](#getLogset)
- [deleteLogset()](#deleteLogset)
- [getTopicList()](#getTopicList)
- [createTopic()](#createTopic)
- [getTopic()](#getTopic)
- [deleteTopic()](#deleteTopic)
- [updateIndex()](#updateIndex)
- [getIndex()](#getIndex)

### getLogsetList

Get logset list:

```js
const res = await client.getLogsetList();
```

### createLogset

Create logset:

```js
const res = await client.createLogset({
  logset_name: 'cls-test',
  period: 7,
});
```

### getLogset

Get logset:

```js
const res = await client.getLogset({
  logset_id: 'xxx-xxx',
});
```

### deleteLogset

Delete logset:

```js
const res = await client.deleteLogset({
  logset_id: 'xxx-xxx',
});
```

### getTopicList

Get topic list:

```js
const res = await client.getTopicList();
```

### createTopic

Create topic:

```js
const res = await client.createTopic({
  logset_id: 'xxx-xxx',
  topic_name: 'cls-test-topic',
});
```

### getTopic

Get topic:

```js
const res = await client.getTopic({
  topic_id: 'xxx-xxx',
});
```

### deleteTopic

Delete topic:

```js
const res = await client.deleteTopic({
  topic_id: 'xxx-xxx',
});
```

### updateIndex

Update topic index:

```js
const res = await client.updateIndex({
  topic_id: 'xxx-xxx',
  effective: true,
  rule: {
    full_text: {
      case_sensitive: true,
      tokenizer: '!@#%^&*()_="\', <>/?|\\;:\n\t\r[]{}',
    },
    key_value: {
      case_sensitive: true,
      keys: ['SCF_RetMsg'],
      types: ['text'],
      tokenizers: [' '],
    },
  },
});
```

### getIndex

Get topic index:

```js
const res = await client.getIndex({
  topic_id: 'xxx-xxx',
});
```

### Custom methods

If you need methods expect above list, you can use `client.request()` like below:

```js
// create cls shipper
const res = await client.request({
  path: '/shipper',
  method: 'POST',
  data: {
    topic_id: 'xxxx-xx-xx-xx-xxxxxxxx',
    bucket: 'test-1250000001',
    prefix: 'test',
    shipper_name: 'myname',
    interval: 300,
    max_size: 100,
    partition: '%Y%m%d',
    compress: {
      format: 'none',
    },
    content: {
      format: 'csv',
      csv_info: {
        print_key: true,
        keys: ['key1', 'key2'],
        delimiter: '|',
        escape_char: "'",
        non_existing_field: 'null',
      },
    },
  },
});
```

## Options

```js
const client = new Cls(ClsOptions);
```

### `ClsOptions` for Cls Construct

| Name      | Description                          | Type    | Required | Default      |
| --------- | ------------------------------------ | ------- | -------- | ------------ |
| region    | request region                       | string  | true     | ap-guangzhou |
| secretId  | tencent account secret id            | string  | true     | ''           |
| secretKey | tencent account secret key           | string  | true     | ''           |
| token     | tencent account token                | string  | false    | ''           |
| debug     | whether enable log debug info        | boolean | false    | false        |
| timeout   | request timeout, unit `ms`           | number  | false    | 5000         |
| expire    | expire time for signature, unit `ms` | number  | false    | 300000       |

## License

MIT
