// WIB (UTC+7) day boundaries. The FE sends date strings in the user's local
// timezone (Asia/Jakarta), but `new Date('YYYY-MM-DD')` is parsed as UTC
// midnight. These helpers interpret a 'YYYY-MM-DD' string as a WIB calendar
// day so "today" on the client matches the same day on the server.

function startOfDayWIB(dateStr) {
  return new Date(`${dateStr}T00:00:00.000+07:00`);
}

function endOfDayWIB(dateStr) {
  return new Date(`${dateStr}T23:59:59.999+07:00`);
}

module.exports = { startOfDayWIB, endOfDayWIB };
