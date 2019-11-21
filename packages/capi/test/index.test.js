const { Capi } = require('../dist/index');

async function main() {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: 'Please input your SecretId',
    SecretKey: 'Please input your SecretKey',
    ServiceType: 'tmt',
  });
  try {
    const res = await client.request(
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
    );
    console.log('res', res);
  } catch (e) {
    console.log(e);
  }
}

main();
