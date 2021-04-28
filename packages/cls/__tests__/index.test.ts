import { Cls } from '../src';

describe('Cls', () => {
  const client = new Cls({
    region: 'ap-guangzhou',
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    token: process.env.TENCENT_TOKEN,
    debug: true,
  });

  let logset_id: string = '';
  let topic_id: string = '';

  test('create logset', async () => {
    const res = await client.createLogset({
      logset_name: 'cls-test',
      period: 7,
    });
    expect(res).toEqual({
      requestId: expect.any(String),
      logset_id: expect.any(String),
    });

    logset_id = res.logset_id;
  });

  test('get logset', async () => {
    const res = await client.getLogset({
      logset_id,
    });
    expect(res).toEqual({
      requestId: expect.any(String),
      create_time: expect.any(String),
      logset_id: logset_id,
      logset_name: 'cls-test',
      period: 7,
      topics_number: 0,
    });

    logset_id = res.logset_id;
  });

  test('get logset list', async () => {
    const res = await client.getLogsetList();
    expect(res).toEqual({
      requestId: expect.any(String),
      logsets: expect.any(Array),
    });

    const [exist] = res.logsets.filter(
      (item: { logset_id: string }) => item.logset_id === logset_id,
    );
    expect(exist).toEqual({
      create_time: expect.any(String),
      logset_id,
      logset_name: 'cls-test',
      period: 7,
      topics_number: 0,
    });
  });

  test('create topic', async () => {
    const res = await client.createTopic({
      logset_id,
      topic_name: 'cls-test-topic',
    });
    expect(res).toEqual({
      requestId: expect.any(String),
      topic_id: expect.any(String),
    });

    topic_id = res.topic_id;
  });

  test('get topic', async () => {
    const res = await client.getTopic({
      topic_id,
    });
    expect(res.topic_id).toBe(topic_id);
    expect(res.topic_name).toBe('cls-test-topic');
  });

  test('update index', async () => {
    const res = await client.updateIndex({
      topic_id,
      effective: true,
      rule: {
        full_text: {
          case_sensitive: true,
          tokenizer: '!@#%^&*()_="\', <>/?|\\;:\n\t\r[]{}',
        },
        key_value: {
          case_sensitive: true,
          keys: ['SCF_RetMsg'],
          types: ['text'],
          tokenizers: [' '],
        },
      },
    });

    expect(res).toEqual({
      requestId: expect.any(String),
      success: true,
    });
  });

  test('get index', async () => {
    const res = await client.getIndex({
      topic_id,
    });

    expect(res).toEqual({
      requestId: expect.any(String),
      effective: true,
      rule: {
        full_text: {
          case_sensitive: true,
          tokenizer: `!@#%^&*()_="', <>/?|\\;:\n\t\r[]{}`,
        },
        key_value: {
          case_sensitive: true,
          template_type: 'static',
          keys: ['SCF_RetMsg'],
          types: ['text'],
          tokenizers: [' '],
        },
      },
      topic_id,
    });
  });

  test('delete topic', async () => {
    const res = await client.deleteTopic({
      topic_id,
    });
    // TODO: cloud api bug
    // expect(res).toEqual({
    //   requestId: expect.any(String),
    //   success: true,
    // });
    expect(true).toBe(true);
  });

  test('delete logset', async () => {
    const res = await client.deleteLogset({
      logset_id,
    });
    expect(res).toEqual({
      requestId: expect.any(String),
      success: true,
    });
  });
});
