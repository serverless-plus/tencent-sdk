const { Capi } = require('../dist/index');

async function main() {
  const client = new Capi({
    Region: 'ap-guangzhou',
    SecretId: 'AKIDERQREz5KfomYBj8SUWO4zP4qSqcYAn6E',
    SecretKey: '62rUkofMtSp7AlCPZ4LOwHMFwOcbLsBR',
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
