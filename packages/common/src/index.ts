import { Capi } from '@tencent-sdk/capi';
import { PascalCasedPropertiesDeep, CamelCasedPropertiesDeep } from 'type-fest';
import camelCase from 'camelcase';

import { ServiceType } from './constants';
import { CommonError } from './error';

export * from './constants';
export * from './error';

/**
 * simple deep clone object
 * @param {object} obj object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * return variable real type
 * @param {any} obj input variable
 */
export function getRealType<T>(obj: T): string {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

/**
 * is array
 * @param obj object
 */
export function isArray<T>(obj: T[] | T): obj is T[] {
  return getRealType(obj) === 'Array';
}

/**
 * is object
 * @param obj object
 */
export function isObject<T>(obj: T): obj is T {
  return getRealType(obj) === 'Object';
}

export function isEmpty<T>(val: T) {
  return (
    val === undefined || val === null || (typeof val === 'number' && isNaN(val))
  );
}

export function cleanEmptyValue<T>(obj: T): T {
  const newObj: any = {};
  for (const key in obj) {
    const val = obj[key];
    if (!isEmpty(val)) {
      newObj[key] = val;
    }
  }
  return newObj;
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

  requestClient = 'TencentSdk',
}: ApiFactoryOptions<ACTIONS_T>) {
  const APIS: Record<
    ACTIONS_T[number],
    (capi: Capi, inputs: any) => any
  > = {} as any;
  actions.forEach((action: ACTIONS_T[number]) => {
    APIS[action] = async (capi: Capi, inputs: any) => {
      inputs = deepClone(inputs);
      const reqData = cleanEmptyValue({
        Action: action,
        Version: version,
        ...inputs,
      });
      inputs = cleanEmptyValue(inputs);
      try {
        const res = await capi.request(reqData, {
          isV3: isV3,
          debug: debug,
          RequestClient: requestClient,
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

export function camelCaseProps<T>(
  obj: T,
  pascalCase = false,
): CamelCasedPropertiesDeep<T> | PascalCasedPropertiesDeep<T> {
  let res: Record<string, any> = {};
  if (isObject(obj)) {
    res = {} as any;
    Object.keys(obj).forEach((key: string) => {
      const val = (obj as any)[key];
      const k = camelCase(key, { pascalCase: pascalCase });
      res[k] =
        isObject(val) || isArray(val) ? camelCaseProps(val, pascalCase) : val;
    });
  }
  if (isArray(obj as any)) {
    res = [];
    (obj as any).forEach((item: any) => {
      res.push(
        isObject(item) || isArray(item)
          ? camelCaseProps(item, pascalCase)
          : item,
      );
    });
  }
  return res as CamelCasedPropertiesDeep<T>;
}

export function pascalCaseProps<T>(obj: T): PascalCasedPropertiesDeep<T> {
  return camelCaseProps(obj, true) as PascalCasedPropertiesDeep<T>;
}
