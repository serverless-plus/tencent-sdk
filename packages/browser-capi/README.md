# 简介
iaas.cloud.tencent.com的接口封装
仅限cloud.tencent.com域或子域下页面使用，引入的页面需要有jQuery及Promise
独立域名引入时先指定document.domain到cloud.tencent.com
推荐引入imgcache.qq.com现有的jQuery

```html
<script>
    document.domain = 'cloud.tencent.com'
</script>
<script
    src="//imgcache.qq.com/open/qcloud/js/version/201408/jquery.201408191328.js?t=20140821&amp;max_age=31536000"></script>
<script>
```

# 源码
https://github.com/serverless-plus/tencent-sdk

# 用法
```
tnpm i @tencent-sdk/browser-capi -S
```

```js
import { apiRequest } from '@tencent-sdk/browser-capi'
// 云api请求
apiRequest({
    region: "ap-guangzhou",
    serviceType: "scf", 
    action: "ListFunctions",  
    data: {
        Version: "2018-04-16",
        Namespace: "default",
        Offset: 0,
        Limit: 20
    }
}).then(function(data){

})
```