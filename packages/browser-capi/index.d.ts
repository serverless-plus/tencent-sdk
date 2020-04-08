declare module "@tencent-sdk/browser-capi" {
  export function capiRequest<TResult = any, TParam = any, TOpts = any>(
    param: APIRequestParam<TParam>,
    opts?: APIRequestOpts & TOpts
  ): Promise<TResult>;
  export { capiRequest as apiRequest }
  export function request<TResult = any, TParam = any, TOpts = any>(
    url: string,
    param: RequestParam & TParam,
    opts?: RequestOpts & TOpts
  ): Promise<TResult>;
  export function isCamRefused(
    e: CapiError
  ): boolean;
  export function needLogin(
    e: CapiError
  ): boolean;
  export function noAuth(
    e: CapiError
  ): boolean;

  // ---------------- request接口 -------------------
  export interface RequestParam { }
  export interface RequestOpts {
    isFormData?: string;
    clientTimeout?: number;
  }

  export interface CapiError {
    Code: string;
    Message: String;
  }

  // --------------- apiRequest接口 ------------------
  export interface APIRequestParam<T> extends RequestParam {
    /** 云API 服务类别 */
    serviceType: string;
    /** 云API Action，与`data.Action`二选一，必须指定一个 */
    action?: string;
    /** 云API请求地域，与`data.Region`二选一，必须指定一个 */
    regionId?: number;
    data?: T & {
      Region?: string;
      Action?: string;
      /** 指定v3接口的Version字段，默认为"2017-03-12" */
      Version?: string
    };
  }
  export interface APIRequestOpts extends RequestOpts {
  }
}
