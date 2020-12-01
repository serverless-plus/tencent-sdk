import { Capi } from '../src';

describe('Capi', () => {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: process.env.TENCENT_SECRET_ID,
    SecretKey: process.env.TENCENT_SECRET_KEY,
    Token: process.env.TENCENT_TOKEN,
    ServiceType: 'scf',
    Version: '2018-04-16',
  });

  test('[v1] should get api result success', async () => {
    const res = await client.request(
      {
        Action: 'ListFunctions',
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
        Action: 'ListFunctions',
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
