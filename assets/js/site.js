// Proudfoot Holiday Farm: menu, booking bar, availability calendar, gallery, enquiry form.
(function () {
  'use strict';
  var CFG = window.PROUDFOOT || {};
  var PLACES = {
    'main-house': { name: 'The Main House', page: 'main-house.html', minNote: 'The Main House needs at least 6 adults out of season and 10 in season (public holidays, long weekends and December).' },
    'cottage': { name: 'The Cottage', page: 'cottage.html', minNote: 'The Cottage sleeps 2 adults. We can add a mattress for a little one.' }
  };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(s) { var p = String(s || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function pretty(s) { var d = parse(s); return d ? d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear() : ''; }
  function nights(a, b) { var x = parse(a), y = parse(b); return x && y ? Math.round((y - x) / 864e5) : 0; }
  function params() { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); return o; }

  /* Mobile menu */
  var menuBtn = $('.menu-btn'), nav = $('.site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  /* WhatsApp links */
  function waLink(text, number) {
    return 'https://wa.me/' + (number || CFG.whatsapp || '') + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  $all('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') || 'Hi Proudfoot, I would like to ask about a stay.', a.getAttribute('data-wa-number'));
  });

  /* Date inputs never allow the past, and look muted until filled */
  $all('input[type=date]').forEach(function (i) {
    i.min = iso(today());
    var mark = function () { i.classList.toggle('empty', !i.value); };
    ['input', 'change'].forEach(function (ev) { i.addEventListener(ev, mark); });
    mark();
  });
  document.addEventListener('reset', function (e) {
    setTimeout(function () { $all('input[type=date]', e.target).forEach(function (i) { i.classList.add('empty'); }); });
  }, true);

  /* Home booking bar: carry the choice to the place's availability section */
  var bar = $('form.book');
  if (bar) {
    bar.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(bar), place = PLACES[f.get('place')] || PLACES['main-house'];
      var q = new URLSearchParams();
      ['arrive', 'leave', 'adults'].forEach(function (k) { if (f.get(k)) q.set(k, f.get(k)); });
      location.href = place.page + (q.toString() ? '?' + q : '') + '#availability';
    });
    var a = bar.elements.arrive, l = bar.elements.leave;
    if (a && l) a.addEventListener('change', function () {
      var d = parse(a.value); if (!d) return;
      d.setDate(d.getDate() + 1); l.min = iso(d);
      if (!l.value || l.value <= a.value) l.value = iso(d);
    });
  }

  /* Availability data from the booking tracker */
  var availability = null;
  function loadAvailability() {
    if (availability) return availability;
    if (!CFG.trackerUrl) { availability = Promise.resolve(null); return availability; }
    availability = fetch(CFG.trackerUrl + (CFG.trackerUrl.indexOf('?') > -1 ? '&' : '?') + 'action=availability')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return { error: true }; });
    return availability;
  }

  /* Calendar */
  function Calendar(el, form) {
    var place = el.getAttribute('data-place');
    var start = today(); start.setDate(1);
    var view = new Date(start);
    var booked = [];
    var live = false; // true once booked dates have loaded from the tracker
    var sel = { a: null, b: null };
    var status = $('.cal-status', el);
    var months = $('.cal-months', el);
    var prev = $('.cal-prev', el), next = $('.cal-next', el);

    function isBooked(s) {
      for (var i = 0; i < booked.length; i++) if (s >= booked[i][0] && s < booked[i][1]) return true;
      return false;
    }
    function rangeClear(a, b) {
      var d = parse(a);
      while (iso(d) < b) { if (isBooked(iso(d))) return false; d.setDate(d.getDate() + 1); }
      return true;
    }
    function say(msg, warn) { status.textContent = msg; status.classList.toggle('warn', !!warn); }

    function month(base) {
      var y = base.getFullYear(), m = base.getMonth();
      var wrap = document.createElement('div'); wrap.className = 'cal-month';
      wrap.innerHTML = '<h4>' + MONTHS[m] + ' ' + y + '</h4>';
      var g = document.createElement('div'); g.className = 'cal-grid'; g.setAttribute('role', 'grid');
      ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) { g.insertAdjacentHTML('beforeend', '<span class="dow" aria-hidden="true">' + d + '</span>'); });
      var first = (new Date(y, m, 1).getDay() + 6) % 7;
      for (var i = 0; i < first; i++) g.insertAdjacentHTML('beforeend', '<span></span>');
      var t = iso(today()), count = new Date(y, m + 1, 0).getDate();
      for (var day = 1; day <= count; day++) {
        var s = iso(new Date(y, m, day));
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'day'; b.textContent = day; b.dataset.date = s;
        var label = day + ' ' + MONTHS[m];
        if (s < t) { b.classList.add('past'); b.disabled = true; }
        else if (isBooked(s)) { b.classList.add('booked'); label += ', booked'; }
        if (s === t) b.classList.add('today');
        if (sel.a && s === sel.a) b.classList.add('start');
        if (sel.b && s === sel.b) b.classList.add('end');
        if (sel.a && sel.b && s > sel.a && s < sel.b) b.classList.add('in-range');
        b.setAttribute('aria-label', label);
        g.appendChild(b);
      }
      wrap.appendChild(g);
      return wrap;
    }
    function render() {
      months.innerHTML = '';
      months.appendChild(month(view));
      months.appendChild(month(new Date(view.getFullYear(), view.getMonth() + 1, 1)));
      prev.disabled = view <= start;
    }
    function syncForm() {
      if (!form) return;
      form.elements.arrive.value = sel.a || '';
      form.elements.leave.value = sel.b || '';
      form.dispatchEvent(new Event('input'));
    }
    function pick(s) {
      if (isBooked(s) && !(sel.a && !sel.b && s > sel.a)) { say('That night is already booked. Please pick another date.', true); return; }
      if (!sel.a || sel.b || s <= sel.a) { sel = { a: s, b: null }; say('Arriving ' + pretty(s) + '. Now pick the day you leave.'); }
      else if (!rangeClear(sel.a, s)) { say('Some nights between those dates are booked. Please choose different dates.', true); sel = { a: null, b: null }; }
      else { sel.b = s; var n = nights(sel.a, sel.b); say(pretty(sel.a) + ' to ' + pretty(sel.b) + ' · ' + n + ' night' + (n === 1 ? '' : 's') + '. ' + (live ? 'Those dates look free. Send your enquiry below to book.' : 'Send your enquiry below and we will confirm availability.')); }
      render(); syncForm();
    }
    months.addEventListener('click', function (e) { var b = e.target.closest('.day'); if (b && !b.disabled) pick(b.dataset.date); });
    prev.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
    next.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });

    this.setRange = function (a, b) {
      if (a && b && a < b) { sel = { a: a, b: b }; var d = parse(a); view = new Date(d.getFullYear(), d.getMonth(), 1); if (view < start) view = new Date(start); }
      render();
      if (a && b && a < b) {
        if (!live) say(pretty(a) + ' to ' + pretty(b) + '. Send your enquiry below and we will confirm availability.');
        else if (rangeClear(a, b)) say(pretty(a) + ' to ' + pretty(b) + ' look free. Send your enquiry below to book.');
        else say('Some of the nights from ' + pretty(a) + ' to ' + pretty(b) + ' are already booked. Pick other dates on the calendar.', true);
      }
    };

    render();
    say('Loading booked dates…');
    var self = this;
    loadAvailability().then(function (data) {
      if (!data) say('Pick your dates and send an enquiry. We will confirm availability when we reply.');
      else if (data.error) say('We could not load booked dates right now. Send your enquiry and we will confirm.', true);
      else { live = true; booked = (data[place] || []).map(function (r) { return [r[0], r[1]]; }); say('Crossed-out dates are booked. Tap your arrival day, then the day you leave.'); }
      self.setRange(sel.a, sel.b);
    });
  }

  /* Enquiry form */
  function Enquiry(form) {
    var note = $('.form-note', form);
    var placeSel = form.elements.place, minHint = $('[data-min-note]', form);
    function setNote(msg, kind) { note.textContent = msg; note.className = 'form-note' + (kind ? ' ' + kind : ''); }
    function updateMin() { if (minHint && placeSel) minHint.textContent = (PLACES[placeSel.value] || {}).minNote || ''; }
    if (placeSel) placeSel.addEventListener('change', updateMin);
    updateMin();
    form.elements.arrive.addEventListener('change', function () {
      var d = parse(form.elements.arrive.value); if (!d) return;
      d.setDate(d.getDate() + 1); form.elements.leave.min = iso(d);
    });

    function data() {
      var f = new FormData(form), o = {};
      f.forEach(function (v, k) { o[k] = String(v).trim(); });
      o.placeName = (PLACES[o.place] || {}).name || o.place;
      return o;
    }
    function check(o) {
      $all('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      var bad = [];
      ['name', 'phone', 'email', 'arrive', 'leave', 'adults'].forEach(function (k) { if (!o[k]) bad.push(k); });
      if (o.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email)) bad.push('email');
      if (o.arrive && o.leave && o.leave <= o.arrive) bad.push('leave');
      bad.forEach(function (k) { if (form.elements[k]) form.elements[k].setAttribute('aria-invalid', 'true'); });
      if (bad.length) { form.elements[bad[0]].focus(); }
      if (bad.indexOf('leave') > -1 && o.leave) return 'Your leaving date needs to be after your arrival date.';
      if (bad.indexOf('email') > -1 && o.email) return 'That email address does not look right. Please check it.';
      return bad.length ? 'Please fill in the highlighted fields.' : '';
    }
    function summary(o) {
      return 'Enquiry for ' + o.placeName + '\n' +
        'Dates: ' + pretty(o.arrive) + ' to ' + pretty(o.leave) + ' (' + nights(o.arrive, o.leave) + ' nights)\n' +
        'Adults: ' + o.adults + ', children (2-12): ' + (o.children || 0) + ', dogs: ' + (o.dogs || 0) + '\n' +
        'Name: ' + o.name + '\nPhone: ' + o.phone + '\nEmail: ' + o.email + (o.message ? '\n\n' + o.message : '');
    }

    var waBtn = $('[data-wa-enquiry]', form);
    if (waBtn) waBtn.addEventListener('click', function () {
      var o = data();
      var text = 'Hi Proudfoot, I would like to enquire about ' + o.placeName +
        (o.arrive && o.leave ? ' from ' + pretty(o.arrive) + ' to ' + pretty(o.leave) : '') +
        (o.adults ? ', ' + o.adults + ' adults' : '') + (o.children ? ', ' + o.children + ' children' : '') + (o.dogs ? ', ' + o.dogs + ' dogs' : '') + '.';
      window.open(waLink(text), '_blank', 'noopener');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = data();
      if (o.website) return; // spam trap
      var err = check(o);
      if (err) { setNote(err, 'error'); return; }
      var btn = $('button[type=submit]', form);
      if (!CFG.trackerUrl) {
        location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Booking enquiry: ' + o.placeName + ', ' + pretty(o.arrive)) + '&body=' + encodeURIComponent(summary(o));
        setNote('Your email app should open with your enquiry filled in. Press send there to reach us.', 'ok');
        return;
      }
      btn.disabled = true; btn.textContent = 'Sending…'; setNote('');
      fetch(CFG.trackerUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(o) })
        .then(function () {
          form.reset(); updateMin();
          setNote('Thank you, ' + o.name.split(' ')[0] + '. Your enquiry for ' + o.placeName + ' (' + pretty(o.arrive) + ' to ' + pretty(o.leave) + ') has been sent. We will be in touch soon to confirm.', 'ok');
        })
        .catch(function () {
          setNote('Your enquiry did not send. Check your connection and try again, or WhatsApp us instead.', 'error');
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Send enquiry'; });
    });

    this.prefill = function (p) {
      ['arrive', 'leave', 'adults'].forEach(function (k) { if (p[k] && form.elements[k]) form.elements[k].value = p[k]; });
    };
  }

  var p = params();
  var form = $('form[data-enquiry]');
  var enquiry = form ? new Enquiry(form) : null;
  if (enquiry) enquiry.prefill(p);
  var calEl = $('[data-calendar]');
  if (calEl) {
    var cal = new Calendar(calEl, form);
    cal.setRange(p.arrive, p.leave);
    if (form) ['arrive', 'leave'].forEach(function (k) {
      form.elements[k].addEventListener('change', function () { cal.setRange(form.elements.arrive.value, form.elements.leave.value); });
    });
  }
  if (form && form.elements.place && p.place && PLACES[p.place]) { form.elements.place.value = p.place; form.elements.place.dispatchEvent(new Event('change')); }

  /* Gallery lightbox */
  var lb = $('.lightbox');
  if (lb) {
    var items = $all('.gallery button'), idx = 0, cap = $('figcaption', lb);
    var img = document.createElement('img');
    cap.parentNode.insertBefore(img, cap);
    function show(i) {
      idx = (i + items.length) % items.length;
      var b = items[idx];
      img.src = b.getAttribute('data-full'); img.alt = b.querySelector('img').alt; cap.textContent = b.querySelector('img').alt;
    }
    items.forEach(function (b, i) { b.addEventListener('click', function () { show(i); lb.showModal(); }); });
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  /* Re-apply #availability etc. once photos have loaded and the layout has settled */
  if (location.hash.length > 1) window.addEventListener('load', function () {
    var t = document.getElementById(location.hash.slice(1));
    if (t) t.scrollIntoView();
  });

  /* Footer year */
  $all('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });
})();
