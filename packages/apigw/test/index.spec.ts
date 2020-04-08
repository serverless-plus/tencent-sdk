import { ApiGwRequest } from '../src';

async function main() {
  const client = new ApiGwRequest({
    Region: 'ap-guangzhou',
    SecretId: 'Please input SecretId',
    SecretKey: 'Please input SecretKey',
    debug: true,
    SignatureMethod: 'sha256',
  });
  try {
    const res = await client.apis.DescribeService({
      Version: '2017-03-12',
      RequestClient: 'TENCENT_SDK',
      serviceId: 'service-7kqwzu92',
    });
    console.log('res', res);
  } catch (e) {
    console.log(e);
  }
}

main();
