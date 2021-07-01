import { ServiceType, ApiFactory } from '@tencent-sdk/capi';

const ACTIONS = ['GetMonitorData'] as const;

export type ActionType = typeof ACTIONS[number];

const APIS = ApiFactory({
  isV3: true,
  serviceType: ServiceType.monitor,
  version: '2018-07-24',
  actions: ACTIONS,
});

export default APIS;
