import dayjs, { Dayjs, ConfigType } from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(tz);
dayjs.extend(utc);

dayjs.tz.setDefault('Asia/Shanghai');

const dtz = (date: ConfigType = Date.now()) => {
  return dayjs.tz(date);
};

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const TIME_FORMAT_TIMEZONE = 'YYYY-MM-DDTHH:mm:ssZ';

function formatDate(date: ConfigType, withTimeout = false): string {
  return dtz(date).format(withTimeout ? TIME_FORMAT_TIMEZONE : TIME_FORMAT);
}

export { dayjs, dtz, Dayjs, TIME_FORMAT, formatDate };
