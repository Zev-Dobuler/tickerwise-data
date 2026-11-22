/* Tickerwise app26: S&P 500 Forward P/E, today vs history (home page).
   Source: FactSet Earnings Insight. Update TODAY (+ date) each week from the newest report; the rest change slowly. */
(function () {
if (window.TWSPE) return;
const $ = (s, r) => (r || document).querySelector(s), app = $('#app'); if (!app) return;
const TODAY = { v: 17.1, d: 'Nov 20, 2026' };
/* [group, label line 1, label line 2, avg P/E, note] */
const D = [
  ['t', 'Today', TODAY.d.replace(', 2026', ''), TODAY.v, '', 'Today'],
  ['a', '5-Year', 'Average', 19.8, '', '5Y'], ['a', '10-Year', 'Average', 19.1, '', '10Y'], ['a', '15-Year', 'Average', 17.6, '', '15Y'], ['a', '20-Year', 'Average', 16.5, '', '20Y'], ['a', '25-Year', 'Average', 16.4, '', '25Y'],
  ['p', '2002–06', 'Period', 16.0, '≈', "'02–06"], ['p', '2007–11', 'Period', 13.8, '', "'07–11"], ['p', '2011–15', 'Period', 14.0, '', "'11–15"], ['p', '2016–20', 'Period', 17.4, '', "'16–20"], ['p', '2021–25', 'Period', 20.0, '', "'21–25"]
];
const TOP = 24, h = v => (v / TOP * 100).toFixed(1) + '%', vs = v => Math.round((TODAY.v / v - 1) * 100);
const css = `
#spx-pe .pe-g{display:grid;grid-template-columns:1.25fr repeat(5,1fr) 14px repeat(5,1fr);column-gap:8px;align-items:end}
#spx-pe .pe-plot{position:relative;height:250px;margin-top:26px}
#spx-pe .pe-plot .pe-g{height:100%}
#spx-pe .pe-c{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0}
#spx-pe .pe-v{position:relative;z-index:1;background:#fff;padding:0 4px;border-radius:4px;font:700 13px 'Space Grotesk',sans-serif;color:#0F172A;margin-bottom:5px;white-space:nowrap}
#spx-pe .pe-b{width:100%;max-width:58px;border-radius:8px 8px 3px 3px;transition:height .9s cubic-bezier(.2,.8,.2,1)}
#spx-pe .pe-c.a .pe-b{background:linear-gradient(180deg,#7FA3FF,#2F6BFF)}
#spx-pe .pe-c .pe-b{position:relative;z-index:1}
#spx-pe .pe-c.p .pe-b{background:linear-gradient(180deg,#6EE7C8,#0EA5A0)}
#spx-pe .pe-c.t .pe-b{background:linear-gradient(180deg,#FDBA4D,#F28C28);box-shadow:0 0 0 3px #fff,0 0 0 6px #F28C28,0 10px 28px rgba(242,140,40,.45)}
#spx-pe .pe-c.t .pe-v{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;border:3px solid #F28C28;background:#FFF4E6;color:#C2410C;font-size:19px;margin-bottom:10px;box-shadow:0 0 0 6px rgba(242,140,40,.15)}
#spx-pe .pe-line{position:absolute;left:0;right:0;border-top:2px dashed #F28C28;pointer-events:none}
#spx-pe .pe-line span{position:absolute;right:0;top:-22px;font:700 11.5px 'Inter',sans-serif;color:#C2410C;background:#fff;padding:1px 6px;border-radius:6px}
#spx-pe .pe-x{margin-top:8px}
#spx-pe .pe-x div{text-align:center;font-size:12px;line-height:1.25;color:#475569;min-width:0}
#spx-pe .pe-x b{display:block;color:#0F172A;font-size:12.5px}
#spx-pe .pe-x .t b{color:#C2410C}
#spx-pe .pe-s{display:none}
#spx-pe .pe-x i{display:block;font-style:normal;font-weight:700;margin-top:3px}
#spx-pe .pe-grp{margin-top:10px}
#spx-pe .pe-grp div:empty{border:0}
#spx-pe .pe-grp div{font:700 11px 'Inter',sans-serif;letter-spacing:.06em;text-transform:uppercase;text-align:center;padding-top:6px;border-top:3px solid}
#spx-pe .pe-sum{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}
#spx-pe .pe-sum span{font-size:13px;padding:6px 11px;border-radius:999px;background:#F1F5F9;color:#0F172A}
#spx-pe .pe-sum b{font-weight:700}
#spx-pe .pe-tbl{width:100%;border-collapse:collapse;margin-top:18px;font-size:13.5px}
#spx-pe .pe-tbl th,#spx-pe .pe-tbl td{padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:left}
#spx-pe .pe-tbl th{font-size:12px;color:#64748B;font-weight:600}
#spx-pe .pe-tbl td.n,#spx-pe .pe-tbl th.n{text-align:right}
#spx-pe .pe-tbl tr.t td{background:#FFF4E6;font-weight:700;color:#C2410C}
#spx-pe .up{color:#059669}#spx-pe .dn{color:#DC2626}
#spx-pe .pe-src{font-size:11.5px;color:#64748B;margin:12px 0 0;line-height:1.5}
#spx-pe .pe-src a{color:#64748B}
@media(max-width:640px){
 #spx-pe .pe-g{column-gap:3px;grid-template-columns:1.3fr repeat(5,1fr) 6px repeat(5,1fr)}
 #spx-pe .pe-plot{height:200px}
 #spx-pe .pe-v{font-size:10px}
 #spx-pe .pe-c.t .pe-v{width:40px;height:40px;font-size:13px;border-width:2px;margin-bottom:8px}
 #spx-pe .pe-l{display:none}#spx-pe .pe-s{display:block}
 #spx-pe .pe-x div{font-size:9px}#spx-pe .pe-x b{font-size:9.5px}
 #spx-pe .pe-grp div:empty{border:0}
#spx-pe .pe-grp div{font-size:8.5px;letter-spacing:0}
 #spx-pe .pe-b{border-radius:5px 5px 2px 2px}
 #spx-pe .pe-tbl{font-size:12.5px}#spx-pe .pe-tbl th,#spx-pe .pe-tbl td{padding:7px 6px}
}`;
const word = v => { const p = vs(v); return p === 0 ? 'same as' : Math.abs(p) + '% ' + (p < 0 ? 'below' : 'above'); };
function build() {
  if (!document.getElementById('spx-pe-css')) { const st = document.createElement('style'); st.id = 'spx-pe-css'; st.textContent = css; document.head.appendChild(st); }
  const cols = D.map((r, i) => (i === 6 ? '<div></div>' : '') + `<div class="pe-c ${r[0]}"><div class="pe-v">${r[4] || ''}${r[3].toFixed(1)}</div><div class="pe-b" data-h="${h(r[3])}" style="height:0"></div></div>`).join('');
  const xs = D.map((r, i) => (i === 6 ? '<div></div>' : '') + `<div class="${r[0]}"><b><span class="pe-l">${r[1]}</span><span class="pe-s">${r[5] || r[1]}</span></b><span class="pe-l">${r[2]}</span>${r[0] === 't' ? '' : `<i class="${vs(r[3]) < 0 ? 'up' : 'dn'}">${vs(r[3]) > 0 ? '+' : ''}${vs(r[3])}%</i>`}</div>`).join('');
  const rows = D.map(r => `<tr class="${r[0]}"><td>${r[0] === 't' ? 'Today (' + TODAY.d + ')' : r[0] === 'a' ? r[1] + ' average' : r[1] + (r[4] ? ' (approx.)' : '')}</td><td class="n">${r[4] || ''}${r[3].toFixed(1)}</td><td class="n">${r[0] === 't' ? '—' : `<span class="${vs(r[3]) < 0 ? 'up' : 'dn'}">${Math.abs(vs(r[3]))}% ${vs(r[3]) < 0 ? 'cheaper' : 'pricier'}</span>`}</td></tr>`).join('');
  const sec = document.createElement('section'); sec.className = 'sec'; sec.style.paddingTop = '18px';
  sec.innerHTML = `<div class="wrap"><div class="card" id="spx-pe" style="padding:22px 22px 18px">
    <div class="card-h" style="display:block"><h3 style="margin:0">S&amp;P 500 Forward P/E: Today vs History</h3>
    <p class="muted" style="margin:6px 0 0;font-size:13.5px">What investors pay for each $1 of the earnings expected over the next 12 months. Lower = cheaper. Each column is a different time frame, so you can see today next to every one.</p></div>
    <div class="pe-sum"><span>Today <b style="color:#C2410C">${TODAY.v.toFixed(1)}</b></span><span><b>${word(19.8)}</b> the 5-year average</span><span><b>${word(19.1)}</b> the 10-year average</span><span><b>${word(16.5)}</b> the 20-year average</span><span>25-year low: <b>8.6</b> (Nov 2008)</span></div>
    <div class="pe-plot"><div class="pe-line" style="bottom:${h(TODAY.v)}"></div><div class="pe-g">${cols}</div></div>
    <div class="pe-g pe-x">${xs}</div>
    <div class="pe-g pe-grp"><div style="border-color:#F28C28;color:#C2410C">Now</div><div style="grid-column:span 5;border-color:#2F6BFF;color:#2F6BFF">Average over the last…</div><div></div><div style="grid-column:span 5;border-color:#0EA5A0;color:#0E7490">Average during…</div></div>
    <p class="muted" style="font-size:12px;margin:8px 0 0">Under each column: how today compares. <span class="up">Green</span> = today is cheaper than that time frame, <span class="dn">red</span> = pricier.</p>
    <p class="pe-src">Source: <a href="https://www.factset.com/earningsinsight" target="_blank" rel="noopener">FactSet Earnings Insight</a>. Today, 5- and 10-year averages: Nov 20, 2026 report. 15-, 20- and 25-year averages and the 2008 low: FactSet, as of Nov 5, 2026. 2016–20 and 2021–25: FactSet's 5-year averages in its Dec 18, 2020 and Dec 12, 2025 reports. 2011–15 and 2007–11 are worked out from FactSet's 5- and 10-year averages (Dec 2020 and Dec 2016 reports). 2002–06 is worked out from the 20- and 25-year averages, so it is approximate (±0.5).</p>
  </div></div>`;
  return sec;
}
function put() {
  const k = location.hash.replace(/^#\/?/, '').split(/[/?#]/)[0] || 'home'; if (k !== 'home' || $('#spx-pe')) return true;
  const s2 = $('#app section:nth-of-type(2)'); if (!s2) return false;
  const sec = build(); s2.before(sec);
  const bars = sec.querySelectorAll('.pe-b'), grow = () => bars.forEach(b => b.style.height = b.dataset.h);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { grow(); io.disconnect(); } }, { threshold: .2 }); io.observe(sec); setTimeout(grow, 2500); } else grow();
  return true;
}
let n = 0; const kick = () => { n = 0; const go = () => { if (!put() && n++ < 40) setTimeout(go, 250); }; setTimeout(go, 300); };
window.addEventListener('hashchange', kick); kick();
window.TWSPE = { D, TODAY };
})();
