const { CapiRequest } = require('../dist/index');

async function main() {
  const client = new CapiRequest({
    SecretId: '',
    SecretKey: '',
  });
  const res = await client.apis.DescribeService({
    Region: 'ap-guangzhou',
    serviceId: 'service-7kqwzu92',
  });
  console.log('res', res);
}

main();
