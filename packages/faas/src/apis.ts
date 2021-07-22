import { Capi, ServiceType, ApiFactory } from '@tencent-sdk/capi';

const ACTIONS = [
  'CreateFunction',
  'DeleteFunction',
  'GetFunction',
  'UpdateFunctionCode',
  'UpdateFunctionConfiguration',
  'CreateTrigger',
  'DeleteTrigger',
  'PublishVersion',
  'ListAliases',
  'CreateAlias',
  'UpdateAlias',
  'DeleteAlias',
  'GetAlias',
  'Invoke',
  'ListTriggers',
  'ListNamespaces',
  'ListVersionByFunction',
  'ListAliases',
] as const;

export type ActionType = typeof ACTIONS[number];

export type ApiMap = Record<ActionType, (capi: Capi, inputs: any) => any>;

function initializeApis({
  isV3 = true,
  debug = false,
}: {
  isV3?: boolean;
  debug?: boolean;
}): ApiMap {
  return ApiFactory({
    isV3,
    debug,
    serviceType: ServiceType.faas,
    version: '2018-04-16',
    actions: ACTIONS,
    errorHandler: (e) => {
      console.log(e);
    },
  });
}

export { initializeApis };
