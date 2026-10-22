/**
 * Proudfoot Holiday Farm booking tracker.
 *
 * Paste this into Extensions > Apps Script in the bookings Google Sheet.
 * Full setup steps are in booking-tracker/SETUP.md.
 *
 * - Website enquiries are added to the "Bookings" sheet as Pending and emailed to you.
 * - Change Status to Confirmed (or Blocked for dates you want closed) and the website
 *   calendar shows those nights as booked. Only dates are shared, never guest details.
 */

// Who gets the enquiry emails. Add more addresses separated by commas.
var OWNER_EMAIL = 'admin@proudfootholidayfarm.co.za';

var SHEET_NAME = 'Bookings';
var HEADERS = ['Status', 'Place', 'Arrive', 'Leave', 'Nights', 'Guest name', 'Phone', 'Email', 'Adults', 'Children', 'Dogs', 'Message', 'Received', 'Estimate'];
var STATUSES = ['Pending', 'Confirmed', 'Blocked', 'Declined', 'Cancelled'];
var BLOCKING = ['Confirmed', 'Blocked'];
var PLACES = { 'main-house': 'Main House', 'cottage': 'Cottage' };

/** Run this once from the Apps Script editor to set up the sheet. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#2f6b3f').setFontColor('#ffffff');
  sh.setFrozenRows(1);

  var rows = sh.getMaxRows() - 1;
  sh.getRange(2, 1, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  sh.getRange(2, 2, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Main House', 'Cottage'], true).build());
  sh.getRange(2, 3, rows, 2).setDataValidation(SpreadsheetApp.newDataValidation().requireDate().build()).setNumberFormat('ddd d mmm yyyy');
  sh.getRange(2, 13, rows, 1).setNumberFormat('d mmm yyyy hh:mm');

  var all = sh.getRange(2, 1, rows, HEADERS.length);
  var colour = function (status, bg) {
    return SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$A2="' + status + '"').setBackground(bg).setRanges([all]).build();
  };
  sh.setConditionalFormatRules([
    colour('Pending', '#fff4d6'),
    colour('Confirmed', '#e3eee5'),
    colour('Blocked', '#e6e6e6'),
    colour('Declined', '#f8e9e5'),
    colour('Cancelled', '#f8e9e5')
  ]);
  sh.setColumnWidths(1, HEADERS.length, 120);
  sh.setColumnWidth(12, 260);
  SpreadsheetApp.getUi().alert('The Bookings sheet is ready. Next: Deploy > New deployment > Web app (see SETUP.md).');
}

/** The website asks for booked dates here. */
function doGet(e) {
  var out = { 'main-house': [], 'cottage': [] };
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (sh && sh.getLastRow() > 1) {
    var tz = Session.getScriptTimeZone();
    var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
    rows.forEach(function (r) {
      if (BLOCKING.indexOf(String(r[0]).trim()) === -1) return;
      var key = placeKey(r[1]);
      if (!key || !(r[2] instanceof Date) || !(r[3] instanceof Date)) return;
      out[key].push([Utilities.formatDate(r[2], tz, 'yyyy-MM-dd'), Utilities.formatDate(r[3], tz, 'yyyy-MM-dd')]);
    });
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** The website sends enquiries here. */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json({ ok: true }); // spam trap filled in
    var required = ['place', 'arrive', 'leave', 'adults', 'name', 'phone', 'email'];
    for (var i = 0; i < required.length; i++) if (!d[required[i]]) return json({ ok: false, error: 'missing ' + required[i] });
    if (!PLACES[d.place]) return json({ ok: false, error: 'unknown place' });

    // Simple flood protection: one enquiry per email address per minute.
    var cache = CacheService.getScriptCache(), key = 'e:' + String(d.email).toLowerCase();
    if (cache.get(key)) return json({ ok: true });
    cache.put(key, '1', 60);

    var arrive = toDate(d.arrive), leave = toDate(d.leave);
    if (!arrive || !leave || leave <= arrive) return json({ ok: false, error: 'bad dates' });
    var nights = Math.round((leave - arrive) / 864e5);

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sh.appendRow(['Pending', PLACES[d.place], arrive, leave, nights, clean(d.name), clean(d.phone), clean(d.email),
      num(d.adults), num(d.children), num(d.dogs), clean(d.message, 2000), new Date(), clean(d.estimate)]);
    lock.releaseLock();

    var clash = overlaps(sh, PLACES[d.place], arrive, leave);
    var tz = Session.getScriptTimeZone(), fmt = function (x) { return Utilities.formatDate(x, tz, 'EEE d MMM yyyy'); };
    var body = [
      'New booking enquiry from the website.',
      '',
      'Place: ' + PLACES[d.place],
      'Dates: ' + fmt(arrive) + ' to ' + fmt(leave) + ' (' + nights + ' nights)',
      'Adults: ' + num(d.adults) + '   Children (aged 2-12): ' + num(d.children) + '   Dogs: ' + num(d.dogs),
      d.estimate ? 'Estimated total shown to the guest: ' + clean(d.estimate) : '',
      '',
      'Name: ' + clean(d.name),
      'Phone: ' + clean(d.phone),
      'Email: ' + clean(d.email),
      d.message ? '\nMessage:\n' + clean(d.message, 2000) : '',
      clash ? '\nHeads up: these dates overlap a Confirmed or Blocked booking.' : '',
      '',
      'Open the bookings sheet to confirm or decline: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    ].join('\n');
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      replyTo: clean(d.email),
      subject: 'Booking enquiry: ' + PLACES[d.place] + ', ' + fmt(arrive) + ' (' + clean(d.name) + ')',
      body: body
    });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function overlaps(sh, place, arrive, leave) {
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  return rows.some(function (r) {
    return BLOCKING.indexOf(String(r[0]).trim()) > -1 && r[1] === place && r[2] instanceof Date && r[3] instanceof Date && r[2] < leave && r[3] > arrive;
  });
}
function placeKey(name) {
  var n = String(name).toLowerCase();
  if (n.indexOf('main') > -1) return 'main-house';
  if (n.indexOf('cottage') > -1) return 'cottage';
  return null;
}
function toDate(s) {
  var p = String(s).split('-');
  return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
}
function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
function clean(v, max) {
  var s = String(v || '').replace(/^[=+\-@]/, "'$&"); // stop text being read as a spreadsheet formula
  return s.slice(0, max || 200);
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
