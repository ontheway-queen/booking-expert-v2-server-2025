"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateTimeLib {
    // get time value
    static getTimeValue(timeString) {
        // Extract hours, minutes, and seconds
        let [time, timeZone] = timeString.split('+');
        if (!timeZone) {
            [time, timeZone] = timeString.split('-');
        }
        let [hours, minutes, seconds] = time.split(':');
        // Convert to milliseconds since midnight
        let timeValue = (parseInt(hours, 10) * 60 * 60 +
            parseInt(minutes, 10) * 60 +
            parseInt(seconds, 10)) *
            1000;
        // Adjust for time zone
        if (timeZone) {
            let [tzHours, tzMinutes] = timeZone.split(':');
            let timeZoneOffset = (parseInt(tzHours, 10) * 60 + parseInt(tzMinutes, 10)) * 60 * 1000;
            timeValue -= timeZoneOffset;
        }
        return timeValue;
    }
    //convert time to locale string
    static convertToLocaleString(time) {
        const completeTimeString = `1970-01-01T${time}`;
        // Parse the date and format it
        const date = new Date(completeTimeString);
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
    static getFormattedDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return { year, month, day };
    }
    static formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') : ''} ${mins > 0 ? mins + ' minute' + (mins > 1 ? 's' : '') : ''}`.trim();
    }
    static nightsCount(from_date, to_date) {
        const fromDate = new Date(from_date);
        const toDate = new Date(to_date);
        // Ensure the dates are valid
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return 0;
        }
        // Calculate the difference in time
        const timeDifference = toDate.getTime() - fromDate.getTime();
        // Convert time difference from milliseconds to days
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        // Return the number of nights (days - 1)
        return daysDifference > 0 ? daysDifference - 1 : 0;
    }
}
exports.default = DateTimeLib;
