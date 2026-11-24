/* ---------- Community tab on every stock (Nov 22, 2026). Each stock gets its own discussion: sentiment gauge, posts with likes and replies, Bullish/Bearish filters,
   and a box to post. The 10 posts per stock marked Demo are sample posts written from that stock's real data (price moves, scores, analyst targets, earnings dates),
   to show how Community works before real members join. A visitor's own posts and likes are saved in their browser for now.
   Tabs: Community makes 15 public tabs = 3 equal rows of 5 (owner-only Dashboard Card moves beside the row label). ---------- */
(function () {
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const { S, BY, esc, nz, sg, cls, dfmt, pxSeries } = window.TWX || {};
const PP = window.TWPP || {}, TW = window.TW || {}, F = TW.F || {}, AN = TW.AN || {}, X = TW.X || {}, ASOF = TW.asof;
const st = document.createElement('style'); st.id = 'cm-css'; st.textContent = `
.tabs.tabs-5{grid-template-columns:repeat(5,1fr)}@media (max-width:980px){.tabs.tabs-5{grid-template-columns:repeat(3,1fr)}}
.tabs-lbl .cm-own{float:right;text-transform:none;letter-spacing:0;font:700 12.5px Inter,sans-serif;color:#2F6BFF;text-decoration:none;background:#fff;border:1px solid #D8E1F0;border-radius:999px;padding:3px 10px;margin-top:-4px}
.cm-top{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:18px;align-items:center}.cm-gauge{display:flex;height:14px;border-radius:999px;overflow:hidden;background:#EEF2F8;margin:10px 0 6px}.cm-gauge i{display:block;height:100%}
.cm-gl{display:flex;justify-content:space-between;font:700 13px Inter,sans-serif}.cm-st{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.cm-st>div{background:#F7F9FC;border-radius:12px;padding:10px 12px}.cm-st span{display:block;font-size:12px;color:var(--mut);font-weight:600}.cm-st b{font:800 21px 'Space Grotesk',sans-serif}
.cm-cmp{border:1.5px solid var(--line);border-radius:14px;padding:12px;background:#fff}.cm-cmp textarea{width:100%;box-sizing:border-box;border:0;resize:vertical;min-height:70px;font:500 15px Inter,sans-serif;outline:none}.cm-cmp .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:10px}
.cm-sb{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font:700 13px Inter,sans-serif;cursor:pointer}.cm-sb.b.on{background:#E7F8EF;border-color:#00B86B;color:#00995A}.cm-sb.s.on{background:#FDECEF;border-color:#E04B4B;color:#C81E3A}
.cm-p{display:flex;gap:12px;padding:16px 0;border-bottom:1px solid var(--line)}.cm-p:last-child{border-bottom:0}.cm-h{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;color:var(--mut)}.cm-h b{color:var(--ink);font:700 15px 'Space Grotesk',sans-serif}
.cm-tx{margin:6px 0 8px;font-size:15px;line-height:1.6;color:#1E293B;white-space:pre-wrap;word-wrap:break-word}.cm-tx a{font-weight:700}.cm-ch{display:inline-block;font:800 11px Inter,sans-serif;padding:2px 8px;border-radius:999px}.cm-ch.b{background:#E7F8EF;color:#00995A}.cm-ch.s{background:#FDECEF;color:#C81E3A}
.cm-ac{display:flex;gap:18px;font:600 13px Inter,sans-serif;color:#64748B}.cm-ac button{border:0;background:none;cursor:pointer;color:inherit;font:inherit;padding:0;display:flex;gap:5px;align-items:center}.cm-ac button.on{color:#E04B4B}
.cm-rp{margin:10px 0 0;padding:10px 12px;background:#F7F9FC;border-radius:12px;display:flex;gap:10px}.cm-rp .cm-tx{font-size:14px;margin:4px 0 0}.cm-bd{font:700 10.5px Inter,sans-serif;padding:2px 7px;border-radius:999px;background:#EEF4FF;color:#2F6BFF}.cm-bd.d{background:#F1F5F9;color:#64748B;border:1px dashed #CBD5E1}
.cm-teaser{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.cm-teaser .cm-gauge{flex:1;min-width:160px;margin:0}
@media (max-width:760px){.cm-top{grid-template-columns:minmax(0,1fr)}}`;
if (!$('#cm-css')) document.head.appendChild(st);

/* ---------- members (sample) ---------- */
const U = [['Mike Sullivan', 'mikesully', [0, 1, 0, '#2F6BFF', '']], ['Jennifer Walsh', 'jen_walsh', [0, 4, 2, '#E04B4B', '']], ['Tom Becker', 'tombecker', [1, 2, 4, '#0B1B3F', 'b']], ['Ashley Morgan', 'ashleyinvests', [1, 0, 6, '#7C3AED', '']], ['Ryan Fletcher', 'rfletcher', [0, 3, 1, '#00B86B', 'g']],
  ['Megan Price', 'megprice', [0, 1, 2, '#0EA5E9', 'g']], ['Chris Donovan', 'chrisd_trades', [2, 0, 0, '#F28C28', '']], ['Brittany Hayes', 'bhayes', [3, 0, 5, '#E04B4B', '']], ['Josh Kramer', 'joshk', [0, 2, 4, '#2F6BFF', 'b']], ['Lauren Mitchell', 'laurenm', [0, 4, 3, '#00B86B', '']],
  ['Derek Coleman', 'dcoleman', [4, 0, 4, '#0B1B3F', '']], ['Stephanie Ross', 'steph_ross', [1, 1, 2, '#7C3AED', '']], ['Kyle Anderson', 'kyle_a', [0, 3, 0, '#0EA5E9', '']], ['Amanda Bishop', 'amandab', [0, 0, 6, '#F28C28', 'g']], ['Greg Turner', 'gregturner', [1, 5, 4, '#0B1B3F', 'g']],
  ['Nicole Parker', 'nicoleparker', [2, 0, 2, '#2F6BFF', '']], ['Brandon Reed', 'breed', [0, 2, 1, '#E04B4B', '']], ['Heather Collins', 'hcollins', [0, 3, 6, '#00B86B', '']], ['Scott Jensen', 'scottj', [0, 4, 0, '#2F6BFF', 'b']], ['Rachel Foster', 'rachelf', [1, 0, 3, '#0EA5E9', '']],
  ['Travis Long', 'travislong', [0, 1, 4, '#F28C28', '']], ['Kimberly Hart', 'kimhart', [3, 0, 2, '#7C3AED', 'g']], ['Dan Morrison', 'danmorrison', [1, 2, 0, '#0B1B3F', '']], ['Erin Douglas', 'erin_d', [0, 3, 2, '#E04B4B', '']], ['Jason Pierce', 'jpierce', [2, 0, 1, '#00B86B', 'g']],
  ['Melissa Grant', 'mgrant', [0, 1, 6, '#2F6BFF', '']], ['Kevin Shaw', 'kshaw', [0, 0, 4, '#0EA5E9', '']], ['Tiffany Burns', 'tiffanyb', [1, 4, 2, '#F28C28', '']], ['Matt Lawson', 'mattlawson', [0, 3, 0, '#7C3AED', 'b']], ['Courtney Hale', 'courtneyh', [2, 1, 3, '#00B86B', '']],
  ['Eric Spencer', 'ericspencer', [1, 0, 1, '#E04B4B', '']], ['Danielle Ward', 'dward', [4, 0, 6, '#2F6BFF', '']], ['Jeff Holloway', 'jholloway', [0, 5, 4, '#0B1B3F', 'g']], ['Samantha Cole', 'samcole', [0, 2, 2, '#0EA5E9', '']], ['Andrew Burke', 'aburke', [0, 1, 1, '#F28C28', '']],
  ['Vanessa Reid', 'vreid', [2, 0, 5, '#7C3AED', '']], ['Patrick Doyle', 'pdoyle', [0, 3, 4, '#00B86B', 'b']], ['Crystal Owens', 'crystalo', [1, 3, 6, '#E04B4B', '']], ['Gary Lindsey', 'garylindsey', [0, 5, 0, '#2F6BFF', '']], ['Holly Benson', 'hollyb', [0, 4, 2, '#0EA5E9', 'g']]];
const BADGE = ['Top 10% Paper Trader', 'Member since 2024', 'Pro', 'Long-term investor', 'Options trader', 'Dividend investor', '', '', '', ''];

/* ---------- post writer: real numbers from the stock's page ---------- */
const fv = (t, k) => { const a = (F[t] || {})[k]; return a && a[0] !== '-' && a[0] !== '' && a[0] != null ? +a[0] : null; };
const px = t => { const s = (pxSeries(t) || []).filter(p => nz(p.c)); return s.length ? s[s.length - 1].c : null; };
const m$ = v => '$' + (v >= 100 ? v.toFixed(0) : v.toFixed(2));
function facts(s) { const t = s.t, T = s.tech || {}, R = s.ret || {}, E = s.earn || {}, A = AN[t], peers = S.filter(x => x.th === s.th && x.t !== t && x.sec !== 'ETF').map(x => x.t);
  return { t, n: (s.n || t).replace(/,? (Inc|Corp|Corporation|Holdings|Ltd|N\.V|plc|Co)\.?.*$/i, ''), p: px(t), ws: s.ws, r1m: R.r1m, r3m: R.r3m, r1y: R.r1y, ytd: R.rytd, off: T.off, rsi: T.rsi, v50: T.v50, v200: T.v200, next: E.next, l8: E.l8, streak: E.streak, last: (E.h || [])[0],
    up: fv(t, 'Analyst Price Target %'), fpe: fv(t, 'Forward P/E'), ps: fv(t, 'P/S'), gr: fv(t, 'Revenue Forward 1Y CAGR') ?? fv(t, 'Y/Y Revenue Growth'), cons: A ? A[7] : null, tgt: A ? A[0] : null, ins: (X[t] || {}).i, th: s.th, peer: peers, etf: s.sec === 'ETF' || /ETF/.test(s.th || '') }; }
const ETF = f => { if (f.etf) Object.assign(f, { l8: null, streak: null, last: null, up: null, fpe: null, ps: null, gr: null, ins: null, cons: null, next: null }); return f; };
const B = [ // bullish
  f => nz(f.up) && f.up > 15 && f.up < 150 && `Analysts have an average target around ${m$(f.tgt || f.p * (1 + f.up / 100))}, about ${Math.round(f.up)}% above here. Street is ${f.cons || 'positive'} and I agree. Adding on this pullback.`,
  f => nz(f.off) && f.off < -20 && f.off > -75 && `$${f.t} is ${Math.abs(f.off)}% off its 52-week high. Nothing about the business changed that much. Started a starter position at ${m$(f.p)}.`,
  f => nz(f.l8) && f.l8 >= 75 && `Beat EPS in ${f.l8}% of the last 8 reports${f.streak > 2 ? `, ${f.streak} in a row` : ''}. Management under-promises and over-delivers. Holding through ${f.next ? dfmt(f.next) : 'next earnings'}.`,
  f => nz(f.rsi) && f.rsi < 35 && `RSI at ${Math.round(f.rsi)}. Oversold territory. Last few times it got here it bounced within weeks. Small add, tight stop.`,
  f => nz(f.ws) && f.ws >= 7 && `Tickerwise score is ${f.ws}/10. Hard to find this mix of growth and profitability. Long-term hold for me.`,
  f => nz(f.gr) && f.gr > 20 && f.gr < 150 && `Revenue growing about ${Math.round(f.gr)}% a year and people are worried about the multiple? Growth fixes valuation. Still long $${f.t}.`,
  f => nz(f.r1y) && f.r1y > 30 && `Up ${Math.round(f.r1y)}% in a year and still not crowded in my view. Trimmed 10% to rebalance, letting the rest ride.`,
  f => f.ins && f.ins[1] > 0 && `Insiders made ${f.ins[1]} open-market buy${f.ins[1] === 1 ? '' : 's'} recently. Executives sell for lots of reasons but buy for one.`,
  f => nz(f.v200) && f.v200 > 0 && `Still above the 200-day average (${sg(f.v200, 0)}). As long as that holds the trend is our friend.`,
  f => !f.etf && f.peer.length > 1 && `Comparing $${f.t} to $${f.peer[0]} and $${f.peer[1]}: better balance sheet and a cleaner story. If you're going to own one name in ${f.th}, this is mine.`,
  f => f.etf && `Simple, cheap exposure. Dollar-cost averaging into $${f.t} every month and ignoring the noise.`,
  f => f.etf && `Core holding in my IRA. $${f.t} plus time does the heavy lifting.`,
  f => f.etf && `Bought more $${f.t} on this dip. Not trying to time it, just adding every month.`,
  f => nz(f.r3m) && f.r3m > 3 && `Up ${Math.round(f.r3m)}% over three months while most of ${f.th} chopped around. Relative strength matters.`,
  f => nz(f.ytd) && f.ytd > 10 && `${Math.round(f.ytd)}% year to date and I'm still holding every share.`,
  f => nz(f.p) && `Set a buy limit a little under ${m$(f.p * 0.95)}. If it fills, great. If not, I already own some.`,
  f => `Long-term holder of $${f.t}. Volatility is the price of admission. Not selling.`,
  f => f.next && `Earnings ${dfmt(f.next)}. Whisper numbers look beatable to me. Holding calls into the print, sized small.`];
const Bear = [
  f => nz(f.fpe) && f.fpe > 35 && `${Math.round(f.fpe)}x forward earnings is a lot to pay. Love the company, not the price. Waiting for a better entry.`,
  f => nz(f.r1m) && f.r1m < -10 && `Down ${Math.abs(Math.round(f.r1m))}% in a month and no bounce yet. Not catching this knife until it bases.`,
  f => nz(f.v50) && f.v50 < -5 && `Below the 50-day by ${Math.abs(Math.round(f.v50))}%. Momentum is gone for now. Took profits, will revisit.`,
  f => nz(f.rsi) && f.rsi > 68 && `RSI ${Math.round(f.rsi)}. Overbought. Taking some off the table here, can always buy back.`,
  f => nz(f.ps) && f.ps > 12 && `${f.ps.toFixed(1)}x sales. Priced for perfection. Any miss and this gets hit hard.`,
  f => f.last && f.last.mv != null && f.last.mv < 0 && `Beat last quarter and the stock still fell ${Math.abs(f.last.mv)}% on the report. When good news doesn't lift it, be careful.`,
  f => f.ins && f.ins[2] > 2 && `${f.ins[2]} insider sales recently. Not panicking, but I notice.`,
  f => !f.etf && `Too much hype in ${f.th} right now. Trimming $${f.t} and keeping cash for better prices.`,
  f => nz(f.r1y) && f.r1y < -5 && `Down ${Math.abs(Math.round(f.r1y))}% over a year. Dead money until something changes.`,
  f => nz(f.off) && f.off > -6 && `Sitting near its 52-week high. Risk/reward isn't great up here. Waiting.`,
  f => nz(f.r1y) && f.r1y > 20 && `Position got too big after the run. Sold a third of my $${f.t} to rebalance.`,
  f => f.etf && `Too concentrated in a handful of names for my taste. Prefer to pick my own.`];
const Neu = [
  f => f.next && `Anyone know what the street expects for ${f.next ? dfmt(f.next) : 'the next report'}? Trying to decide whether to hold through earnings.`,
  f => `What's everyone's average cost on $${f.t}? Mine is around ${m$(f.p * (0.82 + (f.t.length % 4) * 0.07))}. Debating adding.`,
  f => f.peer.length && `$${f.t} or $${f.peer[0]}? Have room for one more ${f.th} position.`,
  f => `New here. What's the bull case on $${f.t} in one sentence?`,
  f => `Curious how many of you hold $${f.t} in a retirement account versus trading it.`];
const RE = { b: ['Agreed. Added a few shares today.', 'Same thesis here. Patience pays.', 'This is the way. Long and strong.', 'Good point on the numbers. Holding.'], s: ['Fair, but you could wait forever for the perfect price.', 'Valuation always looks high on quality names.', 'I sold too. Will buy back lower.', 'Bulls have been right so far though.'] };
const ago = h => h < 1 ? Math.round(h * 60) + 'm' : h < 24 ? Math.round(h) + 'h' : Math.round(h / 24) + 'd';
function posts(t) { const s = BY[t]; if (!s) return []; const f = ETF(facts(s)), r = PP.rng('cm-' + t), pick = a => a[Math.floor(r() * a.length)];
  const bulls = B.map(g => g(f)).filter(Boolean), bears = Bear.map(g => g(f)).filter(Boolean), neus = Neu.map(g => g(f)).filter(Boolean);
  const nb = s.ws >= 7 ? 7 : s.ws >= 5 ? 6 : 4, used = new Set(), us = U.slice().sort(() => r() - 0.5), out = [];
  const take = (arr, side) => { const a = arr.filter(x => !used.has(x)); if (!a.length) return false; const x = a[Math.floor(r() * a.length)]; used.add(x); out.push({ side, tx: x }); return true; };
  for (let i = 0; i < nb; i++) take(bulls, 'b'); for (let i = 0; i < 10 - nb - 1; i++) take(bears, 's'); take(neus, ''); while (out.length < 10 && (take(bulls, 'b') || take(bears, 's') || take(neus, ''))) {}
  let h = 0.3 + r() * 1.5; return out.slice(0, 10).sort(() => r() - 0.5).map((p, i) => { h += 0.6 + r() * (i < 4 ? 5 : 22); const u = us[i], likes = Math.floor(3 + r() * (p.side ? 140 : 40)), nr = Math.floor(r() * 18);
    return Object.assign(p, { id: t + '-' + i, u, badge: BADGE[Math.floor(r() * BADGE.length)], h, likes, nr, rp: nr > 4 ? { u: us[(i + 13) % us.length], tx: pick(RE[p.side === 's' ? 's' : 'b']) } : null }); }); }

/* ---------- browser storage: likes and own posts ---------- */
const K = 'tw_comm', rd = () => { try { return JSON.parse(localStorage.getItem(K) || '{"l":{},"p":{}}'); } catch (e) { return { l: {}, p: {} }; } }, wr = o => { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) {} };
const tags = tx => esc(tx).replace(/\$([A-Z]{1,5}(?:-[A-Z])?)\b/g, (m, x) => BY[x] ? `<a href="#/stock/${x}/community">$${x}</a>` : m);
function postHtml(p, mine) { const o = rd(), on = !!o.l[p.id], av = mine ? PP.avatar('me-' + (o.me || 'you'), [0, 1, 1, '#2F6BFF', ''], 44) : PP.avatar('cm-' + p.u[1], p.u[2], 44);
  return `<div class="cm-p" data-id="${esc(p.id)}">${av}<div style="flex:1;min-width:0"><div class="cm-h"><b>${mine ? 'You' : esc(p.u[0])}</b><span>@${mine ? 'you' : esc(p.u[1])}</span>${!mine && p.badge ? `<span class="cm-bd">${esc(p.badge)}</span>` : ''}${mine ? '<span class="cm-bd">Saved in this browser</span>' : '<span class="cm-bd d">Demo</span>'}<span>·</span><span>${mine ? 'just now' : ago(p.h)}</span>${p.side ? `<span class="cm-ch ${p.side}">${p.side === 'b' ? 'Bullish' : 'Bearish'}</span>` : ''}</div>
    <div class="cm-tx">${tags(p.tx)}</div><div class="cm-ac"><button type="button" class="${on ? 'on' : ''}" data-like="${esc(p.id)}">${on ? '♥' : '♡'} <span>${(p.likes || 0) + (on ? 1 : 0)}</span></button><span>💬 ${p.nr || 0}</span><button type="button" data-share="${esc(p.id)}">↗ Share</button></div>
    ${p.rp ? `<div class="cm-rp">${PP.avatar('cm-' + p.rp.u[1], p.rp.u[2], 30)}<div><div class="cm-h"><b style="font-size:13.5px">${esc(p.rp.u[0])}</b><span class="cm-bd d">Demo</span></div><div class="cm-tx">${tags(p.rp.tx)}</div></div></div>` : ''}</div></div>`; }
let CF = 'all', CS = 'top';
function sentiment(t) { const P = posts(t).concat((rd().p[t] || [])), b = P.filter(p => p.side === 'b').length, s = P.filter(p => p.side === 's').length; return { b, s, n: P.length, pct: b + s ? Math.round(b / (b + s) * 100) : 50 }; }
function tab(s) {
  const t = s.t, own = (rd().p[t] || []).slice().reverse(), P = posts(t), sn = sentiment(t), f = p => CF === 'all' || (CF === 'b' ? p.side === 'b' : p.side === 's');
  const list = (CS === 'top' ? P.slice().sort((a, b) => b.likes - a.likes) : P.slice().sort((a, b) => a.h - b.h)).filter(f), r = PP.rng('cmw-' + t), watch = Math.round((s.ws || 5) * 900 + r() * 4000);
  return `<div class="card"><div class="cm-top"><div><h3 style="margin:0;font:800 22px 'Space Grotesk',sans-serif">$${esc(t)} Community</h3><p class="muted" style="margin:4px 0 0">What investors are saying about ${esc((s.n || "").replace(/\.$/, ""))}.</p>
      <div class="cm-gauge"><i style="width:${sn.pct}%;background:linear-gradient(90deg,#00B86B,#34D399)"></i><i style="width:${100 - sn.pct}%;background:linear-gradient(90deg,#F87171,#E04B4B)"></i></div><div class="cm-gl"><span class="up">${sn.pct}% Bullish</span><span class="dn">${100 - sn.pct}% Bearish</span></div></div>
    <div class="cm-st"><div><span>Posts this week</span><b>${sn.n}</b></div><div><span>Watching</span><b>${watch.toLocaleString()}</b></div><div><span>Tickerwise Score</span><b>${s.ws}/10</b></div></div></div>
    <div class="mk-demo" style="margin-top:14px">Preview: posts marked <b>Demo</b> are sample posts written from ${esc(t)}'s real numbers (prices, scores, analyst targets, earnings dates) to show how Community works. Real member posts start when accounts launch.</div></div>
    <div class="card"><div class="cm-cmp"><textarea id="cm-t" maxlength="600" placeholder="Share your view on $${esc(t)}…"></textarea><div class="row"><button type="button" class="cm-sb b" data-side="b">▲ Bullish</button><button type="button" class="cm-sb s" data-side="s">▼ Bearish</button><span class="muted" style="font-size:12.5px;flex:1">Be respectful. No personal attacks or promotions.</span><button class="btn primary" id="cm-go" style="padding:8px 16px">Post</button></div></div></div>
    <div class="card"><div class="card-h"><h3>Discussion</h3><span><span class="seg" style="display:inline-flex">${[['all', 'All'], ['b', 'Bullish'], ['s', 'Bearish']].map(x => `<button type="button" class="${CF === x[0] ? 'on' : ''}" data-cf="${x[0]}">${x[1]}</button>`).join('')}</span> <span class="seg" style="display:inline-flex">${[['top', 'Top'], ['new', 'Latest']].map(x => `<button type="button" class="${CS === x[0] ? 'on' : ''}" data-cs="${x[0]}">${x[1]}</button>`).join('')}</span></span></div>
      ${own.filter(f).map(p => postHtml(p, 1)).join('')}${list.map(p => postHtml(p)).join('')}</div>
    <p class="muted" style="font-size:12.5px;margin:0">Community posts are members' opinions, not investment advice. Tickerwise does not verify posts.</p>`;
}
function wire(s) { let side = '';
  $$('[data-side]').forEach(b => b.onclick = () => { side = side === b.dataset.side ? '' : b.dataset.side; $$('[data-side]').forEach(x => x.classList.toggle('on', x.dataset.side === side)); });
  const go = $('#cm-go'); if (go) go.onclick = () => { const tx = ($('#cm-t').value || '').trim(); if (!tx) { $('#cm-t').focus(); return; } const o = rd(); (o.p[s.t] = o.p[s.t] || []).push({ id: s.t + '-me-' + Date.now(), side, tx: tx.slice(0, 600), likes: 0, nr: 0 }); wr(o); render(s); };
  $$('[data-like]').forEach(b => b.onclick = () => { const o = rd(), id = b.dataset.like; if (o.l[id]) delete o.l[id]; else o.l[id] = 1; wr(o); const n = $('span', b), on = !!o.l[id]; b.classList.toggle('on', on); b.firstChild.textContent = on ? '♥ ' : '♡ '; n.textContent = +n.textContent + (on ? 1 : -1); });
  $$('[data-share]').forEach(b => b.onclick = () => { const u = location.href.split('#')[0] + '#/stock/' + s.t + '/community'; try { navigator.clipboard.writeText(u); b.textContent = '✓ Link copied'; } catch (e) {} });
  $$('[data-cf]').forEach(b => b.onclick = () => { CF = b.dataset.cf; render(s); }); $$('[data-cs]').forEach(b => b.onclick = () => { CS = b.dataset.cs; render(s); }); }
function render(s) { const m = $('.main'); if (!m) return; m.innerHTML = tab(s); wire(s); }
function teaser(s) { const m = $('.main'); if (!m || $('#cm-teaser')) return; const sn = sentiment(s.t), top = posts(s.t).sort((a, b) => b.likes - a.likes)[0];
  m.insertAdjacentHTML('beforeend', `<div class="card" id="cm-teaser"><div class="card-h"><h3>Community</h3><span><a href="#/stock/${esc(s.t)}/community">Join the discussion →</a></span></div><div class="cm-teaser"><b class="up">${sn.pct}% Bullish</b><div class="cm-gauge"><i style="width:${sn.pct}%;background:#00B86B"></i><i style="width:${100 - sn.pct}%;background:#E04B4B"></i></div><b class="dn">${100 - sn.pct}% Bearish</b><span class="muted">${sn.n} posts this week</span></div>${top ? postHtml(top) : ''}</div>`); wire(s); }

/* ---------- tabs: add Community, keep three equal rows ---------- */
function tabs(t) { const nav = $('nav.tabs'); if (!nav) return;
  if (!$('a[data-k="community"]', nav)) nav.insertAdjacentHTML('beforeend', `<a href="#/stock/${t}/community" class="x-tab" data-k="community">Community</a>`);
  const card = $('a[data-k="card"]', nav), lbl = nav.parentElement && $('.tabs-lbl', nav.parentElement);
  if (card && lbl && !$('.cm-own', lbl)) { lbl.insertAdjacentHTML('beforeend', `<a class="cm-own" href="${card.getAttribute('href')}">Dashboard Card →</a>`); card.remove(); }
  else if (card && !lbl) { card.remove(); }
  nav.classList.remove('tabs-7'); nav.classList.add('tabs-5'); }
function route() { const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('/'); if (p[0] !== 'stock') return; const t = decodeURIComponent(p[1] || '').toUpperCase(), s = BY[t]; if (!s) return;
  let n = 0; const run = () => { const nav = $('nav.tabs'); if (!nav || !$('a.x-tab', nav)) { if (n++ < 40) setTimeout(run, 50); return; } tabs(t);
    if (p[2] === 'community') { $$('a', nav).forEach(a => a.classList.toggle('on', a.dataset.k === 'community')); render(s); document.title = '$' + t + ' Community — Tickerwise'; }
    else if (!p[2] || p[2] === 'overview') setTimeout(() => teaser(s), 300); }; run(); }
window.addEventListener('hashchange', () => setTimeout(route, 20)); route();
window.TWCM = { posts, sentiment };
})();
/* load later modules (site/app11.js …) from the same GitHub commit as the rest of the site */
(function () { if (window.__twMore) return; window.__twMore = 1; const FILES = ['site/app11.js', 'site/app12.js', 'site/app13.js', 'site/app14.js', 'site/app15.js', 'site/app16.js', 'site/app17.js', 'site/app18.js', 'site/app19.js', 'site/app20.js', 'site/app21.js', 'site/app22.js', 'site/app23.js', 'site/app24.js', 'site/app25.js', 'site/app26.js', 'site/app27.js', 'site/app28.js', 'site/app29.js', 'site/app30.js'];
  const base = window.TW_BASE != null ? Promise.resolve(window.TW_BASE) : fetch('https://api.github.com/repos/Zev-Dobuler/tickerwise-data/commits/main', { headers: { Accept: 'application/vnd.github.sha' }, cache: 'no-store' })
    .then(r => r.ok ? r.text() : '').then(s => 'https://raw.githubusercontent.com/Zev-Dobuler/tickerwise-data/' + (/^[0-9a-f]{40}$/.test(s.trim()) ? s.trim() : 'main') + '/').catch(() => 'https://raw.githubusercontent.com/Zev-Dobuler/tickerwise-data/main/');
  FILES.reduce((p, f) => p.then(() => base.then(b => fetch(b + f + (b ? '?t=' + Date.now() : ''), { cache: 'no-store' })).then(r => r.ok ? r.text() : '').then(x => { if (!x) return; const s = document.createElement('script'); s.textContent = x; document.body.appendChild(s); }).catch(() => {})), Promise.resolve());
})();
