import { Capi } from '../src';

describe('Capi', () => {
  const client = new Capi({
    region: 'ap-guangzhou',
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    token: process.env.TENCENT_TOKEN,
    serviceType: 'scf',
    version: '2018-04-16',
  });

  test('[v1] should get api result success', async () => {
    const res = await client.request(
      {
        action: 'ListFunctions',
      },
      {
        isV3: false,
        debug: true,
      },
    );

    expect(res).toEqual({
      Response: {
        Functions: expect.any(Array),
        TotalCount: expect.any(Number),
        RequestId: expect.any(String),
      },
    });
  });

  test('[v3] should get api result success', async () => {
    const res = await client.request(
      {
        action: 'ListFunctions',
      },
      {
        isV3: true,
        debug: true,
      },
    );

    expect(res).toEqual({
      Response: {
        Functions: expect.any(Array),
        TotalCount: expect.any(Number),
        RequestId: expect.any(String),
      },
    });
  });
});
