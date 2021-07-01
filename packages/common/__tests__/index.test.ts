import {
  deepClone,
  getRealType,
  isArray,
  isObject,
  isEmpty,
  cleanEmptyValue,
  camelCaseProps,
  pascalCaseProps,
  getUnixTime,
  getDate,
  flatten,
  querystring,
  sortObjectKey,
  stringifyObject,
  sha1,
  hash,
} from '../src';

describe('Common methods', () => {
  const testObj = {
    name: 'test',
    detail: {
      site: 'test.com',
    },
  };
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
  test('getUnixTime', async () => {
    expect(getUnixTime(new Date())).toBeGreaterThan(1625079323);
  });
  test('getDate', async () => {
    const res = getDate(new Date());
    expect(/^(\d){4}-\d{2}-\d{2}$/.test(res)).toBe(true);
  });
  test('flatten', async () => {
    expect(flatten(testObj)).toEqual({
      name: 'test',
      'detail.site': 'test.com',
    });
  });
  test('querystring', async () => {
    expect(querystring(flatten(testObj))).toEqual(
      'name=test&detail.site=test.com',
    );
  });
  test('sortObjectKey', async () => {
    expect(sortObjectKey(testObj)).toEqual(['detail', 'name']);
  });
  test('stringifyObject', async () => {
    expect(stringifyObject(flatten(testObj), sortObjectKey)).toEqual(
      'detail.site=test.com&name=test',
    );
  });
  test('sha1', async () => {
    expect(sha1('test', '123')).toEqual(
      'cfa54b5a91f6667966fc8a33362128a4715572f7',
    );
  });
  test('hash', async () => {
    expect(hash('test', 'sha1')).toEqual(
      'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
    );
  });
});
