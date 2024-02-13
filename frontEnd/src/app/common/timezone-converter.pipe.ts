import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'timezoneConverter'
})
export class TimezoneConverterPipe implements PipeTransform {
  
  transform(value: any, timezone: string): string {
    if (!value) {
      return '';
    }

    const originalTime = moment.utc(value); // Assume input time is in UTC
    const convertedTime = originalTime.clone().tz(timezone);

    // Format time only (HH:mm:ss)
    return convertedTime.format('HH:mm:ss');
  }
}
