import Joi from 'joi';
import Capi from 'qcloudapi-sdk';

interface CapiOptions {
  Action: string;
  RequestClient: string;
  [propName: string]: any;
}

interface CapiInstance {
  request: (
    options: CapiOptions,
    cb: (err: Error, data: any) => void,
  ) => Promise<any>;
}

interface CapiRequestProps {
  SecretId: string;
  SecretKey: string;
}

class HttpError extends Error {
  code: number = 0;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message || '';
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

export class CapiRequest {
  // support action list
  actionList: string[] = [
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
    'DescribeApiKeysStatus',
    'BindSecretIds',
    'UnBindSecretIds',
    'BindEnvironment',
    'UnBindEnvironment',
  ];
  // action need check exist error
  needCheckAction: string[] = [
    'UnBindSecretIds',
    'UnBindEnvironment',
    'DeleteUsagePlan',
    'DeleteApiKey',
  ];

  apiRequest: CapiInstance;
  apis: any;

  constructor({ SecretId, SecretKey }: CapiRequestProps) {
    this.apiRequest = new Capi({
      SecretId,
      SecretKey,
      serviceType: 'apigateway',
    }) as CapiInstance;

    this.apiFactory();
  }

  request(action: string, options: any, needCheck: boolean = false) {
    return new Promise((resolve, reject) => {
      this.apiRequest.request(
        {
          Action: action,
          RequestClient: 'ServerlessComponent',
          ...options,
        },
        function(err, data) {
          if (err) {
            return reject(err);
          } else if (data.code !== 0) {
            if (needCheck) {
              if (CheckExistsFromError(data)) {
                return reject(new HttpError(data.code, data.message));
              }
            } else {
              return reject(new HttpError(data.code, data.message));
            }
          }
          resolve(data);
        },
      );
    });
  }

  apiFactory() {
    this.apis = {};
    this.actionList.forEach((item: string) => {
      this.apis[item] = (options: any) => {
        return this.request(
          item,
          options,
          this.needCheckAction.indexOf(item) !== -1,
        );
      };
    });
  }

  createService(options: any) {
    return this.request('CreateService', options);
  }
}

export const Validate = (config: any) => {
  const usagePlanScheme = {
    usagePlanId: Joi.string().optional(),
    usagePlanDesc: Joi.string()
      .max(200)
      .optional(),
    maxRequestNum: Joi.number()
      .integer()
      .min(1)
      .max(99999999)
      .optional()
      .default(-1),
    maxRequestNumPreSec: Joi.number()
      .integer()
      .min(1)
      .max(2000)
      .optional()
      .default(1000),
    usagePlanName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .error(new Error('"usagePlan.usagePlanName" is required')),
  };

  // Api returns a maximum of 100 rows of records at a time
  const endpointsScheme = Joi.array()
    .max(100)
    .items(
      Joi.object().keys({
        apiId: Joi.string().optional(),
        description: Joi.string()
          .max(200)
          .optional(),
        enableCORS: Joi.boolean()
          .optional()
          .default(false),
        path: Joi.string().required(),
        method: Joi.string()
          .regex(/^(GET|POST|PUT|DELETE|HEAD|ANY)$/)
          .required(),
        function: Joi.object()
          .keys({
            isIntegratedResponse: Joi.boolean()
              .optional()
              .default(false),
            functionQualifier: Joi.string()
              .optional()
              .default('$LATEST'),
            functionName: Joi.string()
              .required()
              .error(
                new Error('"endpoints.function.functionName" is required'),
              ),
          })
          .required(),
        usagePlan: Joi.object().keys(usagePlanScheme),
        auth: {
          serviceTimeout: Joi.number()
            .integer()
            .optional()
            .default(15),
          secretName: Joi.string().required(),
          // Api returns a maximum of 100 rows of records at a time
          // https://cloud.tencent.com/document/product/628/14920
          secretIds: Joi.array().max(100),
        },
      }),
    )
    .required();

  const globalScheme = Joi.object()
    .keys({
      region: Joi.string()
        .optional()
        .default('ap-guangzhou'),
      serviceId: Joi.string().optional(),
      protocol: Joi.string()
        .regex(/^(http|https|http&https)$/)
        .optional()
        .default('http'),
      serviceName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .error(new Error('"serviceName" is required')),
      description: Joi.string()
        .max(200)
        .optional(),
      environment: Joi.string()
        .regex(/^(prepub|test|release)$/)
        .optional()
        .default('release'),
      endpoints: endpointsScheme,
      // usagePlan: Joi.object().keys(usagePlanScheme)
    })
    .options({ allowUnknown: true });

  const gloalResult = Joi.validate(config, globalScheme);
  if (gloalResult.error) {
    throw gloalResult.error;
  }

  return gloalResult.value;
};
