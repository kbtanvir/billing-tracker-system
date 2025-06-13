import * as dayjs from 'dayjs';
import { UnitDataType } from './interface';

export class DateUtil {
  static isBeforeNow(dateToCompare: Date): boolean {
    return dayjs(dateToCompare).isBefore(dayjs());
  }

  static addTime(value: number, unit: UnitDataType) {
    return dayjs().add(value, unit).toDate();
  }
}
