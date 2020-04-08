## Tencent Cound API For Browser

Request tool for `iaas.cloud.tencent.com`, can only ussed in domain or subdomain of `cloud.tencent.com`

## Prepare

Request tool for `iaas.cloud.tencent.com`, can only ussed in domain or subdomain of `cloud.tencent.com`

Specify `document.domain` to `cloud.tencent.com`:

```html
<script>
  document.domain = 'cloud.tencent.com';
</script>
```

Import `jQuery`:

```html
<!-- tencent jquery file is  suggested -->
<script src="//imgcache.qq.com/open/qcloud/js/version/201408/jquery.201408191328.js?t=20140821&amp;max_age=31536000"></script>
```

## Usage

Using by npm module:

```
$ npm i @tencent-sdk/capi-wen --save
```

```js
import { CapiRequest } from '@tencent-sdk/capi-web';
const data = await CapiRequest({
  region: 'ap-guangzhou',
  serviceType: 'scf',
  action: 'ListFunctions',
  data: {
    Version: '2018-04-16',
    Namespace: 'default',
    Offset: 0,
    Limit: 20,
  },
});
```

Using by script:

```html
<script src="https://unpkg.com/@tencent-sdk/capi-web"></script>
```

## License
