import { deepClone, cleanEmptyValue } from '@tencent-sdk/common';
import { Capi } from './';

export enum ServiceType {
  /** API 网关服务 (apigateway) */
  apigateway = 'apigateway',

  apigw = 'apigw',
  /** 云函数服务 (SCF) */
  faas = 'scf',
  /** 视频处理服务 (MPS) */
  mps = 'mps',
  /** 资源标签服务 (TAG) */
  tag = 'tag',
  /** 内容分发 (CDN) */
  cdn = 'cdn',
  /** 文件存储 (CFS) */
  cfs = 'cfs',
  /** 域名解析服务 (CNS) */
  cns = 'cns',
  /**  */
  domain = 'domain',
  /** MySQL 数据库 (CynosDB) */
  cynosdb = 'cynosdb',
  /** Postgres 数据库 (Postgres) */
  postgres = 'postgres',
  /** 私有网络 (VPC) */
  vpc = 'vpc',
  /* 访问管理 （CAM）  */
  cam = 'cam',

  // 负载均衡 （CLB）*/
  clb = 'clb',

  // 监控 */
  monitor = 'monitor',
}

export interface ApiErrorOptions {
  message: string;
  stack?: string;
  type: string;
  reqId?: string | number;
  code?: string;
  displayMsg?: string;
}

export class CommonError extends Error {
  type: string;
  reqId?: string | number;
  code?: string;
  displayMsg: string;

  constructor({
    type,
    message,
    stack,
    reqId,
    displayMsg,
    code,
  }: ApiErrorOptions) {
    super(message);
    this.type = type;
    if (stack) {
      this.stack = stack;
    }
    if (reqId) {
      this.reqId = reqId;
    }
    if (code) {
      this.code = code;
    }
    this.displayMsg = displayMsg ?? message;
    return this;
  }
}

interface ApiFactoryOptions<ACTIONS_T> {
  serviceType: ServiceType;
  version: string;
  actions: ACTIONS_T;

  debug?: boolean;
  isV3?: boolean;
  host?: string;
  path?: string;
  requestClient?: string;

  customHandler?: (action: string, res: any) => any;
  responseHandler?: (res: any) => any;
  errorHandler?: (action: string, res: any) => any;
}

export function ApiFactory<ACTIONS_T extends readonly string[]>({
  debug = false,
  isV3 = false,
  actions,
  serviceType,
  host,
  path,
  version,
  customHandler,
  responseHandler = (res: any) => res,
  errorHandler,

  requestClient = 'TENCENT_SDK',
}: ApiFactoryOptions<ACTIONS_T>) {
  const APIS: Record<
    ACTIONS_T[number],
    (capi: Capi, inputs: any) => any
  > = {} as any;
  actions.forEach((action: ACTIONS_T[number]) => {
    APIS[action] = async (capi: Capi, inputs: any) => {
      inputs = deepClone(inputs);

      const reqData = cleanEmptyValue({
        action,
        version,
        ...inputs,
      });
      inputs = cleanEmptyValue(inputs);
      try {
        const res = await capi.request(reqData, {
          isV3,
          debug,
          requestClient,
          host: host || `${serviceType}.tencentcloudapi.com`,
          path: path || '/',
        });
        // Customize response handler
        if (customHandler) {
          return customHandler(action, res);
        }
        const { Response } = res;
        if (Response && Response.Error && Response.Error.Code) {
          if (errorHandler) {
            return errorHandler(action, Response);
          }
          throw new CommonError({
            type: `API_${serviceType.toUpperCase()}_${action}`,
            message: `${Response.Error.Message} (reqId: ${Response.RequestId})`,
            reqId: Response.RequestId,
            code: Response.Error.Code,
          });
        }
        return responseHandler(Response);
      } catch (e) {
        throw new CommonError({
          type: `API_${serviceType.toUpperCase()}_${action}`,
          message: e.message,
          stack: e.stack,
          reqId: e.reqId,
          code: e.code,
        });
      }
    };
  });

  return APIS;
}
