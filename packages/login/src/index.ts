import request from 'request-promise-native';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';
import { sleep, waitResponse } from '@ygkit/request';
import { API_BASE_URL, API_SHORT_URL, REFRESH_TOKEN_URL } from './constant';

export interface ApiUrl {
  login_status_url: string;
  long_url: string;
  short_url: string;
  success: boolean;
}

export interface LoginData {
  secret_id: string;
  secret_key: string;
  token: string;
  appid: string;
  signature: string;
  expired: number;
}

export interface LoginResult {
  uuid: string;
  secret_id: string;
  secret_key: string;
  token: string;
  appid: string;
  signature: string;
  expired: number;
}

export class TencentLogin {
  // timeout in seconds
  public TIMEOUT: number = 60000;

  /**
   * convert string to qrcode
   * @param str string need to be print to qrcode
   */
  async printQrCode(str: string) {
    const url = await qrcode.toString(str, {
      type: 'utf8',
      errorCorrectionLevel: 'M',
    });
    // print cyan color qrcode
    console.log(`\u001b[36m ${url} \u001b[39m`);
  }

  /**
   * GET request
   * @param url request url
   */
  async getRequest(url: string): Promise<Boolean | any> {
    try {
      const res = await request.get(url, {
        json: true,
      });

      if (res.success !== true) {
        return false;
      }
      return res;
    } catch (e) {
      return false;
    }
  }

  /**
   * get short url
   * @param uuid uuid
   */
  async getShortUrl(uuid: string): Promise<Boolean | any> {
    const url = `${API_SHORT_URL}?os=${os.type()}&uuid=${uuid}`;
    return this.getRequest(url);
  }

  /**
   * check auth status
   * @param uuid uuid
   * @param url auth url
   */
  async checkStatus(url: string): Promise<Boolean | LoginData> {
    const tokenUrl = `${API_BASE_URL}${url}`;
    try {
      const res = await request.get(tokenUrl, {
        json: true,
      });

      if (res.success !== true) {
        return false;
      }

      return res;
    } catch (e) {
      return false;
    }
  }

  /**
   * refresh auth token
   * @param uuid uuid
   * @param expired expire time
   * @param signature signature
   * @param appid app id
   */
  async refresh(
    uuid: string,
    expired: number,
    signature: string,
    appid: number | string,
  ): Promise<Boolean | any> {
    const url = `${REFRESH_TOKEN_URL}?uuid=${uuid}&os=${os.type()}&expired=${expired}&signature=${signature}&appid=${appid}`;
    return this.getRequest(url);
  }

  async login(): Promise<LoginResult | undefined> {
    try {
      const uuid = uuidv4();
      const apiUrl = await this.getShortUrl(uuid);
      // 1. print qrcode
      await this.printQrCode(apiUrl.short_url);

      console.log('Please scan QR code login from wechat');
      console.log('Wait login...');
      // wait 3s start check login status
      await sleep(3000);
      try {
        // 2. loop get login status
        const loginData = await waitResponse({
          callback: async () => this.checkStatus(apiUrl.login_status_url),
          timeout: this.TIMEOUT,
          targetProp: 'success',
          targetResponse: true,
        });

        const configure = {
          secret_id: loginData.secret_id,
          secret_key: loginData.secret_key,
          token: loginData.token,
          appid: loginData.appid,
          signature: loginData.signature,
          expired: loginData.expired,
          uuid: uuid,
        } as LoginResult;
        console.log('Login successful for TencentCloud');
        return configure;
      } catch (e) {
        console.log('Login timeout. please login again');
        process.exit(0);
      }
    } catch (e) {
      console.log(e.message);
    }
    process.exit(0);
  }
}
