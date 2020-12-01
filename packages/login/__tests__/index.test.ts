import { v4 as uuidv4 } from 'uuid';
import { TencentLogin } from '../src';

describe('Login', () => {
  const client = new TencentLogin();
  test('should get login url', async () => {
    const uuid = uuidv4();
    const apiUrl = await client.getShortUrl(uuid);

    expect(apiUrl).toEqual({
      login_status_url: expect.any(String),
      long_url: expect.stringContaining(
        'https://cloud.tencent.com/open/authorize',
      ),
      short_url: expect.stringContaining('https://slslogin.qcloud.com'),
      success: true,
    });
  });
});
