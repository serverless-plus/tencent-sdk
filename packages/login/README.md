# Tencent Serverlesss Cloud Function

Tencent serverless cloud wechat login tools.

## Usage

Before use, you need create an instance:

```js
import { TencentLogin } from '@tencent-sdk/login'
const tencentLogin = new TencentLogin();

// login
const loginData = await tLogin.login();
console.log('Login Result: ', loginData);

// refresh auth info
const res = await tLogin.refresh(
  loginData.uuid,
  loginData.expired,
  loginData.signature,
  loginData.appid,
);

console.log('Flush Result: ', res);
```

## License

MIT
