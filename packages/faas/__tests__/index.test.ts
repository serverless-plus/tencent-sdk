import { FaaS } from '../src';

describe('FaaS', () => {
  const region = 'ap-guangzhou';
  const faasConfig = {
    name: 'serverless-test',
    namespace: 'default',
    qualifier: '$LATEST',
  };
  const clsConfig = {
    logsetId: '750b324e-f97a-40e8-9b73-31475c37c02a',
    topicId: '34e08a87-95b0-4f8d-85c7-a823c5f630e9',
  };
  let reqId = '';
  const faas = new FaaS({
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    token: process.env.TENCENT_TOKEN,
    region,
    debug: true,
  });

  test('getRegion', async () => {
    const region = faas.getRegion();

    expect(region).toBe(region);
  });

  test('setRegion', async () => {
    faas.setRegion('ap-shanghai');

    expect(faas.getRegion()).toBe('ap-shanghai');

    // 还原为 ap-guangzhou
    faas.setRegion(region);
  });

  test('invoke', async () => {
    const res = await faas.invoke({
      ...faasConfig,
    });

    expect(res).toEqual({
      billDuration: expect.any(Number),
      duration: expect.any(Number),
      errMsg: expect.any(String),
      memUsage: expect.any(Number),
      functionRequestId: expect.any(String),
      invokeResult: expect.any(Number),
      log: expect.any(String),
      retMsg: expect.any(String),
    });
  });

  test('getClsConfig', async () => {
    const res = await faas.getClsConfig({
      ...faasConfig,
    });

    expect(res).toEqual(clsConfig);
  });

  test('getLogList', async () => {
    const res = await faas.getLogList({
      ...faasConfig,
    });

    if (res[0]) {
      reqId = res[0]!.requestId;
    }
    expect(res).toBeInstanceOf(Array);
  });

  if (reqId) {
    test('getLogDetail', async () => {
      const res = await faas.getLogDetail({
        ...faasConfig,
        ...clsConfig,
        reqId,
      });
      expect(res).toBeInstanceOf(Array);
    });
    test('getLogByReqId', async () => {
      const res = await faas.getLogByReqId({
        ...faasConfig,
        reqId,
      });
      expect(res).toEqual({
        requestId: reqId,
        retryNum: 0,
        startTime: expect.any(String),
        memoryUsage: expect.any(String),
        duration: expect.any(String),
        message: expect.any(String),
      });
    });
  }

  test('getMetric', async () => {
    const res = await faas.getMetric({
      ...faasConfig,
      metric: 'Invocation',
      isRaw: false,
    });
    expect(res).toBeInstanceOf(Array);
    if (res.length > 0) {
      expect(res).toEqual(
        expect.arrayContaining([
          {
            time: expect.any(String),
            value: expect.any(Number),
            timestamp: expect.any(Number),
          },
        ]),
      );
    }
  });

  test('[isRaw = true] getMetric', async () => {
    const res = await faas.getMetric({
      ...faasConfig,
      metric: 'Invocation',
      isRaw: true,
    });

    expect(res).toEqual({
      StartTime: expect.any(String),
      EndTime: expect.any(String),
      MetricName: expect.any(String),
      Period: expect.any(Number),
      DataPoints: expect.arrayContaining([
        {
          Dimensions: expect.any(Array),
          Timestamps: expect.any(Array),
          Values: expect.any(Array),
        },
      ]),
      RequestId: expect.stringMatching(/.{36}/g),
    });
  });
});
