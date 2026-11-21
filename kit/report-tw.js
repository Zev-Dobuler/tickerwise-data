/* Runs inside the embedded dashboard: Tickerwise drives which tab shows. */
(function () {
  var q = {}, qs = ''; try { qs = (window.frameElement && window.frameElement.dataset.q) || ''; } catch (e) {} (qs || location.hash || '').replace(/^#/, '').split('&').forEach(function (p) { var k = p.split('='); if (k[0]) q[k[0]] = decodeURIComponent(k[1] || ''); });
  document.documentElement.classList.add('tw-embed');
  if (q.card) document.documentElement.classList.add('tw-card');
  function nav(v) { var b = document.querySelector('.hs-navb[data-view="' + v + '"]'); if (b) { b.click(); return true; } return false; }
  function card(t) {
    var c = document.getElementById('stock-' + t);
    document.querySelectorAll('#hs-list > .hs-card').forEach(function (e) { e.style.display = e === c ? '' : 'none'; });
    if (!c) { var l = document.getElementById('hs-list'); if (l && !document.getElementById('tw-nocard')) l.insertAdjacentHTML('afterbegin', '<p id="tw-nocard" style="padding:30px;color:#64748B">This stock is not on the dashboard yet.</p>'); }
  }
  function tell() { try { parent.postMessage({ tw: 'h', h: document.documentElement.scrollHeight }, '*'); } catch (e) {} }
  window.twShow = function (v) { if (nav(v)) { window.scrollTo(0, 0); setTimeout(tell, 400); } };
  var n = 0;
  (function wait() {
    if (!document.querySelector('.hs-navb')) { if (++n < 200) return setTimeout(wait, 100); return; }
    setTimeout(function () {
      if (q.card) { nav('charts'); setTimeout(function () { card(q.card); tell(); }, 300); }
      else if (q.view) nav(q.view);
      document.documentElement.classList.add('tw-ready'); tell();
    }, 150);
  })();
  new ResizeObserver(tell).observe(document.body);
})();
