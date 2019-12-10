import * as util from 'util';
import request from 'request-promise-native';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';
import {
  API_BASE_URL,
  API_SHORT_URL,
  REFRESH_TOKEN_URL,
  ONE_SECOND,
} from './constant';

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
  public TIMEOUT: number = 60;

  sleep(ms: number): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * convert string to qrcode
   * @param str string need to be print to qrcode
   */
  async printQrCode(str: string) {
    const url = await qrcode.toString(str, {
      type: 'terminal',
    });
    console.log(url);
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
    const url = util.format('%s?os=%s&uuid=%s', API_SHORT_URL, os.type(), uuid);
    return this.getRequest(url);
  }

  /**
   * check auth status
   * @param uuid uuid
   * @param url auth url
   */
  async checkStatus(url: string): Promise<Boolean | any> {
    const tokenUrl = util.format('%s%s', API_BASE_URL, url);
    return this.getRequest(tokenUrl);
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

  /**
   * checking login status in loop
   * @param param0 loop status need parameters: { uuid: string; apiUrl: ApiUrl }
   * @param timeout timeout in seconds
   * @param resolve promise resolve
   * @param reject promise reject
   */
  async loopStatus(
    { uuid, apiUrl }: { uuid: string; apiUrl: ApiUrl },
    timeout: number,
    resolve?: (value?: LoginData) => void,
    reject?: (reason?: Boolean) => void,
  ): Promise<LoginData | Boolean> {
    return new Promise(async (res, rej) => {
      resolve = resolve || res;
      reject = reject || rej;
      try {
        // timeout
        if (timeout <= 0) {
          reject(false);
        }
        const loginData = await this.checkStatus(apiUrl.login_status_url);
        if (loginData !== false) {
          resolve(loginData);
        } else {
          timeout--;
          await this.sleep(ONE_SECOND);
          return this.loopStatus({ uuid, apiUrl }, timeout, resolve, reject);
        }
      } catch (e) {
        reject(false);
      }
    });
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
      await this.sleep(3000);
      try {
        // 2. loop get login status
        const loginData = (await this.loopStatus(
          {
            uuid,
            apiUrl,
          },
          this.TIMEOUT,
        )) as LoginData;

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
