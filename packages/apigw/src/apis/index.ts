import {
  Capi,
  CapiInstance,
  CapiOptions,
  RequestData,
  RequestOptions,
} from '@tencent-sdk/capi';

class HttpError extends Error {
  message: string = '';
  code: number = 0;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

const CheckExistsFromError = (err: Error) => {
  if (err && err.message.match('does not exist')) {
    return false;
  }
  if (err && err.message.match('not found')) {
    return false;
  }
  return true;
};

type ApiGwRequestData = Omit<RequestData, 'Action'>;
type ApiGwOptions = Omit<RequestOptions, 'ServiceType'>;

interface ApiObject {
  [propName: string]: (
    data: ApiGwRequestData,
    options?: ApiGwOptions,
    isV3?: boolean,
  ) => Promise<any>;
}

export class ApiGwRequest {
  // support action list
  private actionList: string[] = [
    'CreateService',
    'DeleteService',
    'DescribeService',
    'ReleaseService',
    'UnReleaseService',
    'CreateApi',
    'DescribeApi',
    'DeleteApi',
    'ModifyApi',
    'DescribeApisStatus',
    'CreateUsagePlan',
    'DescribeApiUsagePlan',
    'DescribeUsagePlanSecretIds',
    'DescribeUsagePlan',
    'DeleteUsagePlan',
    'ModifyUsagePlan',
    'CreateApiKey',
    'DeleteApiKey',
    'DisableApiKey',
    'EnableApiKey',
    'DescribeApiKeysStatus',
    'BindSecretIds',
    'UnBindSecretIds',
    'BindEnvironment',
    'UnBindEnvironment',
  ];
  // action need check exist error
  private needCheckAction: string[] = [
    'UnBindSecretIds',
    'UnBindEnvironment',
    'DeleteUsagePlan',
    'DeleteApiKey',
  ];

  apiRequest: CapiInstance;
  apis: ApiObject = {};

  constructor(options: CapiOptions) {
    this.apiRequest = new Capi({
      ...options,
      ...{
        ServiceType: 'apigateway',
      },
    });

    this.apiFactory();
  }

  async request(
    Action: string,
    data: ApiGwRequestData,
    options: ApiGwOptions | undefined,
    isV3: boolean | undefined = false,
    needCheck: boolean = false,
  ) {
    try {
      const res = await this.apiRequest.request(
        {
          Action,
          ...data,
        } as RequestData,
        options as RequestOptions,
        isV3,
      );

      if (res.code !== 0) {
        if (needCheck) {
          if (CheckExistsFromError(res)) {
            throw new HttpError(res.code, res.message);
          }
        } else {
          throw new HttpError(res.code, res.message);
        }
      }
      return res;
    } catch (err) {
      throw err;
    }
  }

  apiFactory() {
    this.apis = {};
    this.actionList.forEach((item: string) => {
      this.apis[item] = (
        data: ApiGwRequestData,
        options?: ApiGwOptions,
        isV3?: boolean,
      ) => {
        return this.request(
          item,
          data,
          options,
          isV3,
          this.needCheckAction.indexOf(item) !== -1,
        );
      };
    });
  }
}
