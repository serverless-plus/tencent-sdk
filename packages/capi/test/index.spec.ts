import { Capi } from '../src';

async function main() {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: 'Please input SecretId',
    SecretKey: 'Please input SecretKey',
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
        RequestClient: 'TENCENT_SDK_CAPI',
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
}

main();
