const moment = require('moment');

function getNthWeekday(year, month, weekday, n) {
    // Define date
    const date = moment({year: year, month: month, day: 1});

    // Get the first weekday of the month
    const first_weekday = date.day();

    // Figure out how many days to add
    const date_delta = weekday < first_weekday
        ? (weekday + 7) - first_weekday + (n - 1) * 7
        : weekday - first_weekday       + (n - 1) * 7

    return date.add(date_delta, 'days');
}

function whichNthWeekday(input_date) {
    // Get moment with same year, month and date
    const date = moment({ 
        year: input_date.getFullYear(),
        month: input_date.getMonth(),
        day: input_date.getDate()
    });

    // Get the weekday
    const weekday = date.day();

    // Get the first of that weekday of the month
    let check_date = getNthWeekday(date.year(), date.month(), weekday, 1)
    let n = 1;

    // Find which n matches date
    while (!date.isSame(check_date)) {
        n++;
        check_date = getNthWeekday(date.year(), date.month(), weekday, n)
    }

    return { weekday: weekday, n: n }
}

module.exports = { getNthWeekday, whichNthWeekday }