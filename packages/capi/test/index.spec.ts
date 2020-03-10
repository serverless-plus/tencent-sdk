import { Capi } from '../src';

async function main() {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: 'Please input SecretId',
    SecretKey: 'Please input SecretKey',
    ServiceType: 'tmt',
  });
  try {
    const res1 = await client.request(
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
      false,
    );
    console.log('V1 Sign Result: ', res1);

    const res2 = await client.request(
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
      true,
    );
    console.log('V3 Sign Result: ', res2);
  } catch (e) {
    console.log(e);
  }
}

main();
