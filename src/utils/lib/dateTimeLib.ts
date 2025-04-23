export default class DateTimeLib {
  // get time value
  public static getTimeValue(timeString: string) {
    // Extract hours, minutes, and seconds
    let [time, timeZone] = timeString.split('+');
    if (!timeZone) {
      [time, timeZone] = timeString.split('-');
    }
    let [hours, minutes, seconds] = time.split(':');

    // Convert to milliseconds since midnight
    let timeValue =
      (parseInt(hours, 10) * 60 * 60 +
        parseInt(minutes, 10) * 60 +
        parseInt(seconds, 10)) *
      1000;

    // Adjust for time zone
    if (timeZone) {
      let [tzHours, tzMinutes] = timeZone.split(':');
      let timeZoneOffset =
        (parseInt(tzHours, 10) * 60 + parseInt(tzMinutes, 10)) * 60 * 1000;
      timeValue -= timeZoneOffset;
    }

    return timeValue;
  }

  //convert time to locale string
  public static convertToLocaleString(time: any) {
    const completeTimeString = `1970-01-01T${time}`;

    // Parse the date and format it
    const date: any = new Date(completeTimeString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  }

  //get formatted date
  public static getFormattedDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return { year, month, day };
  }

  public static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') : ''} ${
      mins > 0 ? mins + ' minute' + (mins > 1 ? 's' : '') : ''
    }`.trim();
  }
}
