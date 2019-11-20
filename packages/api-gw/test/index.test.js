const { CapiRequest } = require('../dist/index');

async function main() {
  const client = new CapiRequest({
    Region: 'ap-guangzhou',
    SecretId: 'Please input your SecretId',
    SecretKey: 'Please input your SecretKey',
  });
  try {
    const res = await client.apis.DescribeService(
      {
        Version: '2017-03-12',
        serviceId: 'service-7kqwzu92',
      },
      {
        debug: true,
        SignatureMethod: 'sha256',
      },
    );
    console.log('res', res);
  } catch (e) {
    console.log(e);
  }
}

main();
