import { Capi } from '../src';

async function main() {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: '',
    SecretKey: '',
    ServiceType: 'tmt',
    Version: '2018-03-21',
  });
  try {
    const res1 = await client.request(
      {
        Action: 'TextTranslate',
        SourceText: 'hello',
        Source: 'auto',
        Target: 'zh',
        ProjectId: 0,
        RequestClient: 'TENCENT_SDK_CAPI',
      },
      {
        debug: true,
        isV3: false,
        host: 'tmt.tencentcloudapi.com',
      },
    );
    console.log('V1 Sign Result: ', res1);

    const res2 = await client.request(
      {
        Action: 'TextTranslate',
        SourceText: 'hello',
        Source: 'auto',
        Target: 'zh',
        ProjectId: 0,
      },
      {
        debug: true,
        isV3: true,
        host: 'tmt.tencentcloudapi.com',
      },
    );
    console.log('V3 Sign Result: ', res2);
  } catch (e) {
    console.log(e);
  }
}

main();
