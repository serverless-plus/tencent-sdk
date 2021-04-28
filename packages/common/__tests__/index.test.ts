import {
  deepClone,
  getRealType,
  isArray,
  isObject,
  isEmpty,
  cleanEmptyValue,
  camelCaseProps,
  pascalCaseProps,
  CommonError,
} from '../src';

describe('Common methods', () => {
  const testObj = {
    name: 'test',
    detail: {
      site: 'test.com',
    },
  };
  test('CommonError', async () => {
    try {
      throw new CommonError({
        type: 'TEST_ApiError',
        message: 'This is a test error',
        stack: 'error stack',
        reqId: 123,
        code: 'abc',
        displayMsg: 'error test',
      });
    } catch (e) {
      expect(e.type).toEqual('TEST_ApiError');
      expect(e.message).toEqual('This is a test error');
      expect(e.stack).toEqual('error stack');
      expect(e.reqId).toEqual(123);
      expect(e.code).toEqual('abc');
      expect(e.displayMsg).toEqual('error test');
    }
  });
  test('deepClone', async () => {
    expect(deepClone(testObj)).toEqual({
      name: 'test',
      detail: {
        site: 'test.com',
      },
    });
  });
  test('getRealType', async () => {
    expect(getRealType(testObj)).toBe('Object');
    expect(getRealType([])).toBe('Array');
    expect(getRealType({})).toBe('Object');
    expect(getRealType('hello')).toBe('String');
    expect(getRealType(true)).toBe('Boolean');
    expect(getRealType(1)).toBe('Number');
    expect(getRealType(NaN)).toBe('Number');
  });
  test('isArray', async () => {
    expect(isArray(testObj)).toBe(false);
    expect(isArray([])).toBe(true);
  });
  test('isObject', async () => {
    expect(isObject(testObj)).toBe(true);
    expect(isObject({})).toBe(true);
    expect(isObject([1])).toBe(false);
  });
  test('isEmpty', async () => {
    expect(isEmpty(testObj)).toBe(false);
    expect(isEmpty({})).toBe(false);
    expect(isEmpty([])).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty('')).toBe(false);
    expect(isEmpty(false)).toBe(false);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(NaN)).toBe(true);
  });

  test('cleanEmptyValue', async () => {
    expect(
      cleanEmptyValue({
        name: 'test',
        isAdult: false,
        age: NaN,
        children: null,
        detail: {
          site: undefined,
          view: 0,
        },
      }),
    ).toEqual({
      name: 'test',
      isAdult: false,
      detail: {
        view: 0,
      },
    });
  });
  test('pascalCaseProps', async () => {
    expect(pascalCaseProps(testObj)).toEqual({
      Name: 'test',
      Detail: {
        Site: 'test.com',
      },
    });
  });
  test('camelCaseProps', async () => {
    expect(
      camelCaseProps({
        Name: 'test',
        Detail: {
          Site: 'test.com',
        },
      }),
    ).toEqual(testObj);
  });
});
