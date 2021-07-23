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
 * 判断是否包含字符串
 * @param {string} msg - string
 * @returns {boolean}
 */
export function isContain(msg: string, subStr: string) {
  return msg.indexOf(subStr) > -1;
}

function hasStartMark(msg: string) {
  return isContain(msg, 'START RequestId');
}
function hasEndMark(msg: string) {
  return isContain(msg, 'END RequestId');
}
function hasReportMark(msg: string) {
  return isContain(msg, 'Report RequestId');
}

/**
 * 判断是否是完整的日志
 * @param {string} msg - log message
 * @returns {boolean}
 */
export function isCompleted(msg: string) {
  return hasStartMark(msg) && hasEndMark(msg) && hasReportMark(msg);
}

export function formatFaasLog(detailLog: { content: string }[]) {
  let memoryUsage = '';
  let duration = '';

  const message = (detailLog || [])
    .map(({ content }: { content: string }) => {
      try {
        const info = JSON.parse(content) as LogContent;
        if (info.SCF_Type === 'Custom') {
          memoryUsage = info.SCF_MemUsage;
          duration = info.SCF_Duration;
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
    message,
    isCompleted: isCompleted(message),
  };
}
