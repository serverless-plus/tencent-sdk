import { Capi } from '../src';

describe('Capi', () => {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: process.env.TENCENT_SECRET_ID,
    SecretKey: process.env.TENCENT_SECRET_KEY,
    ServiceType: 'tmt',
    Version: '2018-03-21',
  });

  test('[v1] should get api result success', async () => {
    const res = await client.request(
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
    console.log('v1', res);

    expect(res).toEqual({
      Response: {
        RequestId: expect.any(String),
        Source: 'en',
        Target: 'zh',
        TargetText: '你好',
      },
    });
  });

  test('[v3] should get api result success', async () => {
    const res = await client.request(
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

    expect(res).toEqual({
      Response: {
        RequestId: expect.any(String),
        Source: 'en',
        Target: 'zh',
        TargetText: '你好',
      },
    });
  });
});
