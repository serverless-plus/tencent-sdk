import { Capi } from '../src';

async function main() {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: 'Please input SecretId',
    SecretKey: 'Please input SecretKey',
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
        isV3: false,
        debug: true,
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
        isV3: true,
        debug: true,
      },
    );
    console.log('V3 Sign Result: ', res2);
  } catch (e) {
    console.log(e);
  }
}

main();
