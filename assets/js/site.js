// Proudfoot Holiday Farm: menu, booking bar, availability calendar, gallery, enquiry form.
(function () {
  'use strict';
  var CFG = window.PROUDFOOT || {};
  var PLACES = {
    'main-house': { name: 'The Main House', page: 'main-house.html', sleeps: 15, max: 17,
      minNote: 'The Main House sleeps 15 guests (adults and children). Minimum 6 adults out of season and 10 in season (public holidays, long weekends and December).' },
    'cottage': { name: 'The Cottage', page: 'cottage.html', sleeps: 2, max: 3,
      minNote: 'The Cottage sleeps 2 adults, plus a mattress for a little one.' }
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
      else { live = true; var bk = $('[data-key-booked]', el); if (bk) bk.hidden = false; booked = (data[place] || []).map(function (r) { return [r[0], r[1]]; }); say('Crossed-out dates are booked. Tap your arrival day, then the day you leave.'); }
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

    var count = function (k) { var v = parseInt(form.elements[k] && form.elements[k].value, 10); return isNaN(v) || v < 0 ? 0 : v; };
    setTimeout(function () { setLimits(); });

    /* Guest limits: up to "sleeps" is normal, up to "max" needs our OK, beyond that cannot be sent */
    var placeInfo = function () { return PLACES[placeSel ? placeSel.value : ''] || PLACES['main-house']; };
    var guests = function () {
      var pl = placeInfo(), ad = count('adults'), ch = count('children'), total = ad + ch;
      var g = { place: pl, adults: ad, children: ch, total: total, level: 'ok', msg: '' };
      if (total > pl.max) {
        g.level = 'block';
        g.msg = pl.name + ' sleeps ' + pl.sleeps + (pl.sleeps === 2 ? ' adults, plus a little one on a mattress' : ' guests') +
          '. We can never take more than ' + pl.max + ' people, so ' + total + ' guests is too many. Please lower the number of adults or children.';
      } else if (total > pl.sleeps || (pl.sleeps === 2 && ad > 2)) {
        g.level = 'over';
        g.msg = pl.sleeps === 2
          ? 'The Cottage sleeps 2 adults. A third guest is only possible for a little one on a mattress, and we need to confirm it with you before you book.'
          : pl.name + ' sleeps ' + pl.sleeps + '. A group of ' + total + ' is only possible by arrangement, so we need to confirm it with you before you book.';
      }
      return g;
    };
    var setLimits = function () {
      var pl = placeInfo();
      form.elements.adults.max = pl.sleeps === 2 ? 3 : pl.max;
      form.elements.children.max = pl.max - 1;
    };
    if (placeSel) placeSel.addEventListener('change', setLimits);

    /* Cost estimate: nights x (adults x R600 + children x R300 + dogs x R50) */
    var est = $('[data-estimate]', form);
    var RATE = { adult: 600, child: 300, dog: 50 };
    var rands = function (n) { return 'R' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); };
    var plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : many); };
    var calc = function () {
      var a = form.elements.arrive.value, l = form.elements.leave.value, n = nights(a, l), ad = count('adults');
      if (!(n > 0) || !ad) return null;
      var ch = count('children'), dg = count('dogs');
      var e = { nights: n, adults: ad, children: ch, dogs: dg, adultCost: n * ad * RATE.adult, childCost: n * ch * RATE.child, dogCost: n * dg * RATE.dog };
      e.total = e.adultCost + e.childCost + e.dogCost;
      e.deposit = e.total / 2;
      // December nights count as in season (public holidays and long weekends are confirmed by the owner)
      var d = parse(a);
      e.inSeason = false;
      for (var i = 0; i < n; i++) { if (d.getMonth() === 11) e.inSeason = true; d.setDate(d.getDate() + 1); }
      return e;
    };
    var renderEstimate = function () {
      if (!est) return;
      var g = guests();
      if (g.level !== 'block' && note.classList.contains('error')) setNote('');
      est.classList.toggle('is-blocked', g.level === 'block');
      if (g.level === 'block') { est.innerHTML = '<p class="est-block-title">Too many guests</p><p>' + g.msg + '</p>'; return; }
      var overNote = g.level === 'over' ? '<p class="est-over"><strong>Needs our confirmation.</strong> ' + g.msg + '</p>' : '';
      var e = calc();
      if (!e) { est.innerHTML = overNote + '<p class="est-empty">Choose your dates and number of guests to see an estimated total.</p>'; return; }
      var row = function (label, amount) { return '<div class="est-row"><span>' + label + '</span><span>' + rands(amount) + '</span></div>'; };
      var per = ' &times; ' + plural(e.nights, 'night', 'nights') + ' &times; ';
      var html = overNote + '<div class="est-head"><span>Estimated total</span><strong>' + rands(e.total) + '</strong></div>';
      html += row(plural(e.adults, 'adult', 'adults') + per + 'R600', e.adultCost);
      if (e.children) html += row(plural(e.children, 'child', 'children') + per + 'R300', e.childCost);
      if (e.dogs) html += row(plural(e.dogs, 'dog', 'dogs') + per + 'R50', e.dogCost);
      html += '<div class="est-row est-deposit"><span>50% deposit to secure your booking</span><span>' + rands(e.deposit) + '</span></div>';
      var place = placeSel ? placeSel.value : '', warn = '';
      if (place === 'main-house') {
        var min = e.inSeason ? 10 : 6;
        if (e.adults < min) warn = 'The Main House needs at least ' + min + ' adults ' + (e.inSeason ? 'in December' : 'out of season') + '. We will confirm the price for your group when we reply.';
      }
      if (warn) html += '<p class="est-warn">' + warn + '</p>';
      html += '<p class="est-note">An estimate only. We confirm the final amount, including public holiday and long weekend minimums, when we reply.</p>';
      est.innerHTML = html;
    };
    ['input', 'change'].forEach(function (ev) { form.addEventListener(ev, renderEstimate); });
    form.addEventListener('reset', function () { setTimeout(renderEstimate); });
    renderEstimate();
    form.elements.arrive.addEventListener('change', function () {
      var d = parse(form.elements.arrive.value); if (!d) return;
      d.setDate(d.getDate() + 1); form.elements.leave.min = iso(d);
    });

    function data() {
      var f = new FormData(form), o = {};
      f.forEach(function (v, k) { o[k] = String(v).trim(); });
      o.placeName = (PLACES[o.place] || {}).name || o.place;
      var e = calc();
      var g = guests();
      o.guestCheck = g.level === 'over' ? 'Over usual capacity (' + g.total + ' guests, sleeps ' + g.place.sleeps + '): needs confirmation' : '';
      o.estimate = e ? rands(e.total) + ' for ' + plural(e.nights, 'night', 'nights') + ' (deposit ' + rands(e.deposit) + ')' : '';
      return o;
    }
    function check(o) {
      $all('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      var bad = [];
      ['name', 'phone', 'email', 'arrive', 'leave', 'adults'].forEach(function (k) { if (!o[k]) bad.push(k); });
      if (o.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email)) bad.push('email');
      if (o.arrive && o.leave && o.leave <= o.arrive) bad.push('leave');
      var g = guests();
      if (g.level === 'block') { bad.push('adults'); if (count('children')) bad.push('children'); }
      bad.forEach(function (k) { if (form.elements[k]) form.elements[k].setAttribute('aria-invalid', 'true'); });
      if (bad.length) { form.elements[bad[0]].focus(); }
      if (g.level === 'block') return g.msg;
      if (bad.indexOf('leave') > -1 && o.leave) return 'Your leaving date needs to be after your arrival date.';
      if (bad.indexOf('email') > -1 && o.email) return 'That email address does not look right. Please check it.';
      return bad.length ? 'Please fill in the highlighted fields.' : '';
    }
    function summary(o) {
      return 'Enquiry for ' + o.placeName + '\n' +
        'Dates: ' + pretty(o.arrive) + ' to ' + pretty(o.leave) + ' (' + nights(o.arrive, o.leave) + ' nights)\n' +
        'Adults: ' + o.adults + ', children (aged 2-12): ' + (o.children || 0) + ', dogs: ' + (o.dogs || 0) + '\n' +
        (o.guestCheck ? o.guestCheck + '\n' : '') +
        (o.estimate ? 'Estimated total: ' + o.estimate + '\n' : '') +
        'Name: ' + o.name + '\nPhone: ' + o.phone + '\nEmail: ' + o.email + (o.message ? '\n\n' + o.message : '');
    }

    var waBtn = $('[data-wa-enquiry]', form);
    if (waBtn) waBtn.addEventListener('click', function () {
      var o = data();
      var g = guests();
      if (g.level === 'block') { setNote(g.msg, 'error'); form.elements.adults.focus(); return; }
      var text = 'Hi Proudfoot, I would like to enquire about ' + o.placeName +
        (o.arrive && o.leave ? ' from ' + pretty(o.arrive) + ' to ' + pretty(o.leave) : '') +
        (+o.adults ? ', ' + plural(+o.adults, 'adult', 'adults') : '') + (+o.children ? ', ' + plural(+o.children, 'child', 'children') : '') + (+o.dogs ? ', ' + plural(+o.dogs, 'dog', 'dogs') : '') + '.' +
        (g.level === 'over' ? ' I know this is more than the usual ' + g.place.sleeps + ' guests, so please let me know if it is possible.' : '') +
        (o.estimate ? ' The website estimate is ' + o.estimate.replace(/ /g, ' ') + '.' : '');
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
      renderEstimate();
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

  /* Photo viewer: any [data-full] button inside a [data-gallery] group opens it */
  var lb = $('.lightbox');
  if (lb) {
    var group = [], idx = 0, cap = $('figcaption', lb);
    var img = document.createElement('img');
    cap.parentNode.insertBefore(img, cap);
    var show = function (i) {
      idx = (i + group.length) % group.length;
      var b = group[idx], im = b.querySelector('img');
      img.src = b.getAttribute('data-full'); img.alt = im.alt; cap.textContent = im.alt;
    };
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-gallery] [data-full]');
      if (!b) return;
      group = $all('[data-full]', b.closest('[data-gallery]')).filter(function (x) { return !x.classList.contains('clone'); });
      var orig = b.classList.contains('clone') ? group[+b.getAttribute('data-i')] : b;
      show(group.indexOf(orig));
      lb.showModal();
    });
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  /* "View all photos" window */
  var all = $('.all-photos');
  if (all) {
    $all('[data-open-all]').forEach(function (b) { b.addEventListener('click', function () { all.showModal(); }); });
    $('.all-close', all).addEventListener('click', function () { all.close(); });
    all.addEventListener('click', function (e) { if (e.target === all) all.close(); });
  }

  /* Home photo reel: drifts right to left, arrows jump a photo, drag or swipe to scroll */
  var reel = $('[data-reel]');
  if (reel) {
    var track = $('.reel-track', reel);
    var originals = $all('.reel-item', track);
    originals.forEach(function (b) {
      var c = b.cloneNode(true);
      c.classList.add('clone'); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
      track.appendChild(c);
    });
    var cards = $all('.reel-item', track);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SPEED = 34; // pixels per second
    var x = 0, setW = 0, last = 0, hover = false, focus = false, visible = true, holdUntil = 0, anim = null;
    var drag = null, dragged = false;
    var measure = function () { setW = cards[originals.length].offsetLeft - cards[0].offsetLeft; };
    var wrapX = function () { if (setW > 0) x = ((x % setW) + setW) % setW; };
    var tick = function (t) {
      var dt = last ? Math.min((t - last) / 1000, 0.1) : 0; last = t;
      if (anim) {
        var p = Math.min((t - anim.t0) / anim.d, 1), e = 1 - Math.pow(1 - p, 3);
        x = anim.from + (anim.to - anim.from) * e;
        if (p === 1) { anim = null; wrapX(); }
      } else if (!drag && !reduce && !hover && !focus && visible && t > holdUntil) {
        x += SPEED * dt; wrapX();
      }
      track.style.transform = 'translate3d(' + (-x) + 'px,0,0)';
      requestAnimationFrame(tick);
    };
    var jump = function (dir) {
      if (!setW) measure();
      if (anim) { x = anim.to; anim = null; }
      wrapX();
      if (dir < 0 && x < 4) x += setW;
      var target = null;
      cards.forEach(function (c) {
        var l = c.offsetLeft;
        if (dir > 0 && l > x + 2 && (target === null || l < target)) target = l;
        if (dir < 0 && l < x - 2 && (target === null || l > target)) target = l;
      });
      if (target === null) return;
      anim = { from: x, to: target, t0: performance.now(), d: 520 };
      holdUntil = performance.now() + 4000;
    };
    $('.reel-prev').addEventListener('click', function () { jump(-1); });
    $('.reel-next').addEventListener('click', function () { jump(1); });
    reel.addEventListener('mouseenter', function () { hover = true; });
    reel.addEventListener('mouseleave', function () { hover = false; });
    reel.addEventListener('focusin', function () { focus = true; });
    reel.addEventListener('focusout', function () { focus = false; });
    reel.addEventListener('pointerdown', function (e) { drag = { x0: e.clientX, start: x }; dragged = false; });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      if (Math.abs(dx) > 6) dragged = true;
      if (dragged) { x = drag.start - dx; wrapX(); anim = null; }
    });
    window.addEventListener('pointerup', function () { if (drag) { drag = null; holdUntil = performance.now() + 3000; } });
    reel.addEventListener('click', function (e) { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(reel);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);
    window.addEventListener('load', measure);
    measure();
    requestAnimationFrame(tick);
  }

  /* Instagram feed (Behold JSON feed URL in config.js) */
  var ig = $('[data-instagram]');
  if (ig && CFG.instagramFeed) {
    fetch(CFG.instagramFeed)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        (d.posts || []).slice(0, 6).forEach(function (p) {
          var src = (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl) || (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl);
          if (!src) return;
          var a = document.createElement('a'), im = document.createElement('img');
          a.href = p.permalink; a.target = '_blank'; a.rel = 'noopener';
          im.src = src; im.loading = 'lazy';
          im.alt = p.altText || (p.prunedCaption || 'Proudfoot Holiday Farm on Instagram').slice(0, 120);
          a.setAttribute('aria-label', 'Open on Instagram: ' + im.alt);
          a.appendChild(im); ig.appendChild(a);
        });
        if (ig.children.length) ig.hidden = false;
      })
      .catch(function () { /* leave the follow link on its own */ });
  }

  /* Re-apply #availability etc. once photos have loaded and the layout has settled */
  if (location.hash.length > 1) window.addEventListener('load', function () {
    var t = document.getElementById(location.hash.slice(1));
    if (t) t.scrollIntoView();
  });

  /* Footer year */
  $all('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });
})();
