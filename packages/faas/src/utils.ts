import { LogContent } from './typings/index';
import { StatusSqlMap, GetLogOptions } from './typings';

const StatusMap: StatusSqlMap = {
  success: 'SCF_StatusCode=200',
  fail:
    'SCF_StatusCode != 200 AND SCF_StatusCode != 202 AND SCF_StatusCode != 499',
  retry: 'SCF_RetryNum > 0',
  interrupt: 'SCF_StatusCode = 499',
  timeout: 'SCF_StatusCode = 433',
  exceed: 'SCF_StatusCode = 434',
  codeError: 'SCF_StatusCode = 500',
};

export function formatWhere({
  name,
  namespace = 'default',
  qualifier = '$LATEST',
  status,
  startTime,
  endTime,
}: Partial<GetLogOptions>) {
  let where = `SCF_Namespace='${namespace}' AND SCF_Qualifier='${qualifier}'`;
  if (startTime && endTime) {
    where += ` AND (SCF_StartTime between ${startTime} AND ${endTime})`;
  }
  if (name) {
    where += ` AND SCF_FunctionName='${name}'`;
  }
  if (status) {
    where += ` AND ${StatusMap[status]}'`;
  }

  return where;
}

export function getSearchSql(options: GetLogOptions) {
  const where = formatWhere(options);
  const sql = `* | SELECT SCF_RequestId as requestId, SCF_RetryNum as retryNum, MAX(SCF_StartTime) as startTime WHERE ${where} GROUP BY SCF_RequestId, SCF_RetryNum ORDER BY startTime desc`;

  return sql;
}

/**
 * 判断请求日志是否是完整的
 * @param {string} msg - log message
 * @returns {boolean}
 */
export function isCompleteRequest(msg: string) {
  return msg.indexOf('END RequestId') > -1;
}

export function formatFaasLog(detailLog: { content: string }[]) {
  let memoryUsage = '';
  let duration = '';
  let isCompleted = false;
  let message = (detailLog || [])
    .map(({ content }: { content: string }) => {
      try {
        const info = JSON.parse(content) as LogContent;
        if (info.SCF_Type === 'Custom') {
          memoryUsage = info.SCF_MemUsage;
          duration = info.SCF_Duration;
        }
        // 判断当前调用是否完成，如果完成则设置 isCompleted 为 true
        if (!isCompleted) {
          isCompleted = isCompleteRequest(info.SCF_Message);
        }
        return info.SCF_Message;
      } catch (e) {
        return '';
      }
    })
    .join('');
  return {
    memoryUsage,
    duration,
    isCompleted,
    message,
  };
}
