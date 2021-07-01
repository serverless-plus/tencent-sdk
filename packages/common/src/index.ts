import { PascalCasedPropertiesDeep, CamelCasedPropertiesDeep } from 'type-fest';
import camelCase from 'camelcase';

export * from './logger';
export * from './cropto';
export interface KeyValueObject {
  [key: string]: any;
}

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

export function logger(topic: string, content: string): void {
  console.log(`[DEBUG] ${topic}: ${content} `);
}

export function getUnixTime(date: Date) {
  const val = date.getTime();
  return Math.ceil(val / 1000);
}

export function getDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}-${month > 9 ? month : `0${month}`}-${
    day > 9 ? day : `0${day}`
  }`;
}

/**
 * iterate object or array
 * @param obj object or array
 * @param iterator iterator function
 */
export function forEach(
  obj: object | any[],
  iterator: (value: any, index: number | string, array: any) => void,
) {
  if (isArray(obj)) {
    let arr = obj as Array<any>;
    if (arr.forEach) {
      arr.forEach(iterator);
      return;
    }
    for (let i = 0; i < arr.length; i += 1) {
      iterator(arr[i], i, arr);
    }
  } else {
    const oo = obj as { [propName: string]: any };
    for (let key in oo) {
      if (obj.hasOwnProperty(key)) {
        iterator(oo[key], key, obj);
      }
    }
  }
}

/**
 * flatter request parameter
 * @param obj target object or array
 */
export function flatten(obj: {
  [propName: string]: any;
}): { [propName: string]: any } {
  if (!isArray(obj) && !isObject(obj)) {
    return {};
  }
  const ret: { [propName: string]: any } = {};
  const dump = function(
    obj: object | Array<any>,
    prefix: string | null,
    parents?: any[],
  ) {
    const checkedParents: any[] = [];
    if (parents) {
      let i;
      for (i = 0; i < parents.length; i++) {
        if (parents[i] === obj) {
          throw new Error('object has circular references');
        }
        checkedParents.push(obj);
      }
    }
    checkedParents.push(obj);
    if (!isArray(obj) && !isObject(obj)) {
      if (!prefix) {
        throw obj + 'is not object or array';
      }
      ret[prefix] = obj;
      return {};
    }

    if (isArray(obj)) {
      // it's an array
      forEach(obj, function(obj, i) {
        dump(obj, prefix ? prefix + '.' + i : '' + i, checkedParents);
      });
    } else {
      // it's an object
      forEach(obj, function(obj, key) {
        dump(obj, prefix ? prefix + '.' + key : '' + key, checkedParents);
      });
    }
  };

  dump(obj, null);
  return ret;
}

function stringifyPrimitive(v: any) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
}
function safeUrlEncode(str: string | number | boolean) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

export function querystring(
  obj?: KeyValueObject,
  isSafeEncode: boolean = false,
): string {
  const sep = '&';
  const eq = '=';
  const encodeHandler = isSafeEncode ? safeUrlEncode : encodeURIComponent;
  if (!obj) return '';

  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .map(function(k) {
        let ks = encodeHandler(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return (obj[k] as Array<any>)
            .map(function(v) {
              return ks + encodeHandler(stringifyPrimitive(v));
            })
            .join(sep);
        } else {
          return ks + encodeHandler(stringifyPrimitive(obj[k]));
        }
      })
      .filter(Boolean)
      .join(sep);
  }

  return '';
}

export function sortObjectKey(obj: KeyValueObject): string[] {
  const list: string[] = [];
  Object.keys(obj).forEach((key: string) => {
    if (obj.hasOwnProperty(key)) {
      list.push(key);
    }
  });

  return list.sort((a: string, b: string) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
  });
}

export function stringifyObject(
  obj: KeyValueObject,
  sortKeyMethod: (o: KeyValueObject) => string[],
): string {
  const list: string[] = [];
  const keyList = sortKeyMethod(obj);
  keyList.forEach((key) => {
    let val = obj[key] === undefined || obj[key] === null ? '' : '' + obj[key];
    key = key.toLowerCase();
    key = safeUrlEncode(key);
    val = safeUrlEncode(val) || '';
    list.push(key + '=' + val);
  });
  return list.join('&');
}
