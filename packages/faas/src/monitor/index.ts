import { Capi, ServiceType } from '@tencent-sdk/capi';
import { pascalCaseProps } from '@tencent-sdk/common';
import APIS, { ActionType } from './apis';
import { dtz, formatDate } from '../dayjs';
import {
  Credentials,
  MonitorOptions,
  GetMonitorDataOptions,
  MonitorData,
  FormatedMonitorData,
} from '../typings';

/**
 * 格式化监控数据
 * @param {MonitorData} data raw monitor data
 * @returns {FormatedMonitorData[]} 格式化后的监控数据
 */
function formatMetricData(data: MonitorData): FormatedMonitorData[] {
  const { DataPoints = [] } = data;
  const list: FormatedMonitorData[] = [];
  DataPoints.forEach((point) => {
    const { Timestamps = [], Values = [] } = point;
    Timestamps.forEach((time, i) => {
      list.push({
        time: formatDate(time),
        value: Values[i],
        timestamp: time,
      });
    });
  });

  return list;
}

export class Monitor {
  credentials: Credentials;
  capi: Capi;
  region: string;

  constructor({
    secretId,
    secretKey,
    token,
    region = 'ap-guangzhou',
    debug = false,
  }: MonitorOptions) {
    this.credentials = {
      secretId,
      secretKey,
      token,
    };
    this.region = region;
    this.capi = new Capi({
      debug,
      region: region,
      serviceType: ServiceType.monitor,
      secretId: secretId,
      secretKey: secretKey,
      token: token,
    });
  }

  /**
   * 获取监控数据
   * @param {GetMonitorDataOptions} options 参数
   * @returns
   */
  async get(
    options: GetMonitorDataOptions,
  ): Promise<FormatedMonitorData[] | MonitorData[]> {
    const {
      metric,
      name,
      namespace = 'default',
      alias,
      period = 60,
      interval = 900,
      startTime,
      endTime = Date.now(),
      isRaw = false,
    } = options;

    const endDate = dtz(endTime);
    const startDate = startTime
      ? dtz(startTime)
      : endDate.add(0 - interval, 'second');
    const formatedStartTime = formatDate(startDate, true);
    const formatedEndTime = formatDate(endDate, true);

    const dimensions = [
      {
        Name: 'namespace',
        Value: namespace,
      },
      {
        Name: 'functionName',
        Value: name,
      },
    ];

    if (alias) {
      dimensions.push({
        Name: 'alias',
        Value: alias,
      });
    }

    const res = await this.request({
      MetricName: metric,
      Action: 'GetMonitorData',
      Namespace: 'QCE/SCF_V2',
      Instances: [
        {
          Dimensions: dimensions,
        },
      ],
      Period: period,
      StartTime: formatedStartTime,
      EndTime: formatedEndTime,
    });

    return isRaw ? res : formatMetricData(res);
  }

  async request({
    Action,
    ...data
  }: {
    Action: ActionType;
    [key: string]: any;
  }) {
    const result = await APIS[Action](this.capi, pascalCaseProps(data));
    return result;
  }
}
