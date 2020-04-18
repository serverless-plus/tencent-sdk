import { TencentLogin } from '../src';

async function main() {
  const tLogin = new TencentLogin();
  const loginData = await tLogin.login();
  console.log('Login Result: ', loginData);

  if (loginData) {
    const res = await tLogin.refresh(
      loginData.uuid,
      loginData.expired,
      loginData.signature,
      loginData.appid,
    );

    console.log('Flush Result: ', res);
  }
}

main();
