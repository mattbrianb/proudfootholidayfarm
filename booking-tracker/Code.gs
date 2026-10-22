/**
 * Proudfoot Holiday Farm booking tracker.
 *
 * Paste this into Extensions > Apps Script in the bookings Google Sheet, and add the
 * Dashboard.html file next to it. Full setup steps are in booking-tracker/SETUP.md.
 *
 * - Website enquiries are added to the "Bookings" sheet as Pending, emailed to you, and the
 *   guest gets an automatic "we've received your enquiry" email.
 * - Change Status to Confirmed (or Blocked for dates you want closed) and the website
 *   calendar shows those nights as booked. Only dates are shared, never guest details.
 * - The owner dashboard (a separate, private deployment) shows bookings at a glance.
 */

// Who gets the enquiry emails. Add more addresses separated by commas.
var OWNER_EMAIL = 'admin@proudfootholidayfarm.co.za';

// Google accounts allowed to open the owner dashboard. Fill these in inside Apps Script
// only (never commit real addresses to the public GitHub repository).
var DASHBOARD_ACCOUNTS = ['owner@example.com'];

// Send guests an automatic "we've received your enquiry" email.
var AUTO_REPLY = true;
var AUTO_REPLY_PER_HOUR = 20; // safety cap so the form cannot be used to flood inboxes

var SITE_URL = 'https://www.proudfootholidayfarm.co.za';
var PHONE_MAIN = '082 770 6343';
var PHONE_ALT = '083 228 7776';

var SHEET_NAME = 'Bookings';
var HEADERS = ['Status', 'Place', 'Arrive', 'Leave', 'Nights', 'Guest name', 'Phone', 'Email', 'Adults', 'Children', 'Dogs', 'Message', 'Received', 'Estimate', 'ID'];
var COL = {}; HEADERS.forEach(function (h, i) { COL[h] = i; });
var STATUSES = ['Pending', 'Confirmed', 'Blocked', 'Declined', 'Cancelled'];
var BLOCKING = ['Confirmed', 'Blocked'];
var PLACES = { 'main-house': 'Main House', 'cottage': 'Cottage' };
// Guests (adults + children): sleeps normally, max only by arrangement.
var CAPACITY = { 'main-house': { sleeps: 15, max: 17 }, 'cottage': { sleeps: 2, max: 3 } };

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
  sh.getRange(2, COL['Received'] + 1, rows, 1).setNumberFormat('d mmm yyyy hh:mm');

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
  sh.setColumnWidth(COL['Message'] + 1, 260);
  SpreadsheetApp.getUi().alert('The Bookings sheet is ready. Next: Deploy > New deployment > Web app (see SETUP.md).');
}

/**
 * Public deployment: the website asks for booked dates here.
 * Private deployment with ?view=dashboard: the owner dashboard (allow-listed accounts only).
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.view === 'dashboard') {
    if (!isOwner_()) {
      return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:24px">Not authorised. Sign in with an allowed Google account.</p>');
    }
    return HtmlService.createHtmlOutputFromFile('Dashboard')
      .setTitle('Proudfoot bookings')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  var out = { 'main-house': [], 'cottage': [] };
  readRows_().forEach(function (b) {
    if (BLOCKING.indexOf(b.status) === -1 || !b.arrive || !b.leave || !out[b.place]) return;
    out[b.place].push([b.arrive, b.leave]);
  });
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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email))) return json({ ok: false, error: 'bad email' });
    var guests = num(d.adults) + num(d.children), cap = CAPACITY[d.place];
    if (guests > cap.max) return json({ ok: false, error: 'too many guests' });

    // Flood protection: one enquiry per email address every 10 minutes.
    var cache = CacheService.getScriptCache(), key = 'e:' + String(d.email).toLowerCase();
    if (cache.get(key)) return json({ ok: true });
    cache.put(key, '1', 600);

    var arrive = toDate(d.arrive), leave = toDate(d.leave);
    if (!arrive || !leave || leave <= arrive) return json({ ok: false, error: 'bad dates' });
    var nights = Math.round((leave - arrive) / 864e5);
    var id = newId_();

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var sh = sheet_();
    sh.appendRow(['Pending', PLACES[d.place], arrive, leave, nights, clean(d.name), clean(d.phone), clean(d.email),
      num(d.adults), num(d.children), num(d.dogs), clean(d.message, 2000), new Date(), clean(d.estimate), id]);
    lock.releaseLock();

    var clash = overlaps_(PLACES[d.place], arrive, leave, id);
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
      guests > cap.sleeps ? '\nHeads up: ' + guests + ' guests is more than the usual ' + cap.sleeps + '. Confirm with the guest before accepting.' : '',
      '',
      'Open the bookings sheet to confirm or decline: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    ].join('\n');
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      replyTo: clean(d.email),
      subject: 'Booking enquiry: ' + PLACES[d.place] + ', ' + fmt(arrive) + ' (' + clean(d.name) + ')',
      body: body
    });

    if (AUTO_REPLY) guestReply_(d, arrive, leave, nights, guests, cap, fmt);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** "We've received your enquiry" email to the guest, rate-limited. */
function guestReply_(d, arrive, leave, nights, guests, cap, fmt) {
  var cache = CacheService.getScriptCache();
  var hourKey = 'replies:' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
  var sent = num(cache.get(hourKey));
  if (sent >= AUTO_REPLY_PER_HOUR || MailApp.getRemainingDailyQuota() < 5) return;
  cache.put(hourKey, String(sent + 1), 3600);

  var first = String(d.name).trim().split(/\s+/)[0] || 'there';
  var guestLine = plural_(num(d.adults), 'adult', 'adults') + (num(d.children) ? ', ' + plural_(num(d.children), 'child', 'children') : '') +
    (num(d.dogs) ? ', ' + plural_(num(d.dogs), 'dog', 'dogs') : '');
  var over = guests > cap.sleeps;
  var lines = [
    ['Place', 'The ' + PLACES[d.place]],
    ['Dates', fmt(arrive) + ' to ' + fmt(leave) + ' (' + plural_(nights, 'night', 'nights') + ')'],
    ['Guests', guestLine]
  ];
  if (d.estimate) lines.push(['Estimated total', clean(d.estimate)]);
  var steps = [
    'We check availability for your dates' + (over ? ' and whether we can fit your group of ' + guests + ' (the ' + PLACES[d.place] + ' usually sleeps ' + cap.sleeps + ')' : '') + ', then get back to you to confirm.',
    'Once we have confirmed, we send banking details for the 50% deposit, which secures your booking.',
    'Cancellations: more than 1 month before check-in, 50% of the deposit is refunded; more than 2 weeks before, 25%; within 2 weeks, no refund.'
  ];

  var text = 'Hi ' + first + ',\n\nThank you for your enquiry. Here is what you sent us:\n\n' +
    lines.map(function (l) { return l[0] + ': ' + l[1]; }).join('\n') +
    '\n\nWhat happens next:\n' + steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n') +
    '\n\nThe estimate is a guide. We confirm the final amount when we reply.\n\n' +
    'Questions? Call or WhatsApp ' + PHONE_MAIN + ' (or ' + PHONE_ALT + '), or simply reply to this email.\n\n' +
    'Warm regards,\nProudfoot Holiday Farm\n' + SITE_URL;

  var h = esc_;
  var html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#1f2421;max-width:560px">' +
    '<p>Hi ' + h(first) + ',</p><p>Thank you for your enquiry. Here is what you sent us:</p>' +
    '<table style="border-collapse:collapse;margin:8px 0 16px">' +
    lines.map(function (l) { return '<tr><td style="padding:4px 16px 4px 0;color:#545c57">' + h(l[0]) + '</td><td style="padding:4px 0;font-weight:bold">' + h(l[1]) + '</td></tr>'; }).join('') +
    '</table><p style="margin-bottom:6px"><b>What happens next</b></p><ol style="margin-top:0;padding-left:20px">' +
    steps.map(function (s) { return '<li style="margin-bottom:6px">' + h(s) + '</li>'; }).join('') + '</ol>' +
    '<p style="color:#545c57">The estimate is a guide. We confirm the final amount when we reply.</p>' +
    '<p>Questions? Call or WhatsApp <b>' + h(PHONE_MAIN) + '</b> (or ' + h(PHONE_ALT) + '), or simply reply to this email.</p>' +
    '<p>Warm regards,<br><b>Proudfoot Holiday Farm</b><br><a href="' + SITE_URL + '" style="color:#2f6b3f">' + SITE_URL.replace('https://', '') + '</a></p></div>';

  MailApp.sendEmail({
    to: String(d.email).trim(),
    replyTo: OWNER_EMAIL,
    name: 'Proudfoot Holiday Farm',
    subject: 'We have received your enquiry: Proudfoot Holiday Farm',
    body: text,
    htmlBody: html
  });
}

/* ---------- Owner dashboard (called from Dashboard.html) ---------- */

/** Bookings for one month plus every upcoming Pending enquiry. */
function getDashboard(year, month) {
  assertOwner_();
  var tz = Session.getScriptTimeZone();
  var first = new Date(year, month, 1), next = new Date(year, month + 1, 1);
  var monthStart = Utilities.formatDate(first, tz, 'yyyy-MM-dd'), monthEnd = Utilities.formatDate(next, tz, 'yyyy-MM-dd');
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var rows = readRows_(true);
  var inMonth = rows.filter(function (b) { return b.arrive && b.leave && b.arrive < monthEnd && b.leave > monthStart && b.status !== 'Declined' && b.status !== 'Cancelled'; });
  var pending = rows.filter(function (b) { return b.status === 'Pending' && b.leave && b.leave >= today; })
    .sort(function (a, b) { return a.arrive < b.arrive ? -1 : 1; });
  pending.forEach(function (p) {
    p.clash = rows.some(function (b) {
      return b.id !== p.id && BLOCKING.indexOf(b.status) > -1 && b.place === p.place && b.arrive < p.leave && b.leave > p.arrive;
    });
  });
  return { year: year, month: month, today: today, bookings: inMonth, pending: pending, sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl() };
}

/** Change a booking's status (Confirmed, Declined, Cancelled, Pending). */
function setStatus(id, status) {
  assertOwner_();
  if (['Pending', 'Confirmed', 'Declined', 'Cancelled'].indexOf(status) === -1) throw new Error('Unknown status');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_(), last = sh.getLastRow();
    if (last < 2) throw new Error('No bookings');
    var ids = sh.getRange(2, COL['ID'] + 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) { sh.getRange(i + 2, COL['Status'] + 1).setValue(status); return true; }
    }
    throw new Error('Booking not found. Refresh and try again.');
  } finally {
    lock.releaseLock();
  }
}

/** Close dates for a place (family visit, maintenance). */
function blockDates(place, from, to, note) {
  assertOwner_();
  if (!PLACES[place]) throw new Error('Unknown place');
  var a = toDate(from), b = toDate(to);
  if (!a || !b || b <= a) throw new Error('The end date must be after the start date');
  var row = HEADERS.map(function () { return ''; });
  row[COL['Status']] = 'Blocked'; row[COL['Place']] = PLACES[place];
  row[COL['Arrive']] = a; row[COL['Leave']] = b; row[COL['Nights']] = Math.round((b - a) / 864e5);
  row[COL['Guest name']] = clean(note || 'Blocked by owner'); row[COL['Received']] = new Date(); row[COL['ID']] = newId_();
  sheet_().appendRow(row);
  return true;
}

/* ---------- Helpers ---------- */

function isOwner_() {
  var email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) return false;
  return DASHBOARD_ACCOUNTS.some(function (a) { return String(a).toLowerCase() === email; });
}
function assertOwner_() { if (!isOwner_()) throw new Error('Not authorised'); }

function sheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME); }

/** Every row as a plain object. withDetails adds guest details (dashboard only). */
function readRows_(withDetails) {
  var sh = sheet_();
  if (!sh || sh.getLastRow() < 2) return [];
  var tz = Session.getScriptTimeZone();
  var range = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length);
  var values = range.getValues();
  var day = function (v) { return v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : ''; };
  var out = [], missingIds = false;
  values.forEach(function (r, i) {
    if (withDetails && !r[COL['ID']] && (r[COL['Status']] || r[COL['Arrive']])) { r[COL['ID']] = newId_(); missingIds = true; }
    var b = { status: String(r[COL['Status']]).trim(), place: placeKey(r[COL['Place']]), arrive: day(r[COL['Arrive']]), leave: day(r[COL['Leave']]) };
    if (withDetails) {
      b.id = String(r[COL['ID']]);
      b.name = String(r[COL['Guest name']]); b.phone = String(r[COL['Phone']]); b.email = String(r[COL['Email']]);
      b.adults = num(r[COL['Adults']]); b.children = num(r[COL['Children']]); b.dogs = num(r[COL['Dogs']]);
      b.message = String(r[COL['Message']]); b.estimate = String(r[COL['Estimate']]);
      b.nights = b.arrive && b.leave ? Math.round((toDate(b.leave) - toDate(b.arrive)) / 864e5) : 0;
      b.over = b.place ? b.adults + b.children > CAPACITY[b.place].sleeps : false;
    }
    if (b.place) out.push(b);
  });
  // Rows typed in by hand get an ID so the dashboard can update them.
  if (missingIds) sh.getRange(2, COL['ID'] + 1, values.length, 1).setValues(values.map(function (r) { return [r[COL['ID']]]; }));
  return out;
}

function overlaps_(place, arrive, leave, exceptId) {
  var a = Utilities.formatDate(arrive, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var l = Utilities.formatDate(leave, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var key = placeKey(place);
  return readRows_(true).some(function (b) {
    return b.id !== exceptId && BLOCKING.indexOf(b.status) > -1 && b.place === key && b.arrive < l && b.leave > a;
  });
}
function placeKey(name) {
  var n = String(name).toLowerCase();
  if (n.indexOf('main') > -1) return 'main-house';
  if (n.indexOf('cottage') > -1) return 'cottage';
  return null;
}
function newId_() { return Utilities.getUuid().slice(0, 8); }
function toDate(s) {
  var p = String(s).split('-');
  return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
}
function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
function plural_(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function clean(v, max) {
  var s = String(v || '').replace(/^[=+\-@]/, "'$&"); // stop text being read as a spreadsheet formula
  return s.slice(0, max || 200);
}
function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
