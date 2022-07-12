const { formatDateTime, timeDiff, formatTimePeriod } = require('./time');

test('check formatDateTeme', () => {
  expect(formatDateTime('2019-10-17T08:56:08.573Z')).toBe('Oct 17, 2019, 11:56');
});

test('check formatTimePeriod', () => {
  expect(formatTimePeriod('1000000')).toBe('16m');
});

test('check formatTimePeriod', () => {
  expect(formatTimePeriod('999999999999')).toBe('31y 259d 1h');
});

test('check timeDiff', () => {
  expect(timeDiff('2019-10-17T08:56:08.573Z', '2019-10-18T08:56:08.573Z')).toBe(86400000);
});


