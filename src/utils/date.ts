import dayjs from 'dayjs';
import 'dayjs/locale/et';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Tallinn');

export const TIMEZONE = 'Europe/Tallinn';

export const formatDate = (date: string | Date) =>
  dayjs(date).format('DD.MM.YYYY');

export const formatDateTime = (date: string | Date) =>
  dayjs(date).format('DD.MM.YYYY HH:mm');

export const formatTime = (date: string | Date) =>
  dayjs(date).format('HH:mm');

export { dayjs };
