/* Tickerwise app29 (Nov 23, 2026): Draft Leagues, the fantasy-sports take on Paper Trading.
   #/draft                hub: create (snake draft or open picks, slots, optional Tickerwise Score Bot), join by code, Creator League, how it works
   #/draft/CODE           league: stat strip, standings with vs S&P 500, league heatmap, season race chart, live draft board, moves feed
   #/draft/CODE/p/ID      player: stat strip, sector exposure, by-slot returns, "how the average is built", dropped picks, season moves, links
   #/draft/CODE/broadcast full-screen TV mode for streams and watch parties (auto-refresh)
   Also adds: a stat strip + "How Your Return Is Built" + "Moves" to Paper Trading portfolios, and a stat strip to the Watchlist.
   Storage: Wix Data "Leagues" (rules.type = 'draft') and an add-only event log in "LeagueEntries" (pid = 'dl'):
   join / start / pick / swap. Every client replays the log with the same rules, so no server code is needed.
   Paper picks only: no money, no prizes. Trades between players are an Upgraded Plan feature (paid-plan pop-up). */
(function () {
if (window.TWDL) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, dfmt } = X, PP = window.TWPP || {}, app = $('#app'); if (!app || !S || !esc) return;
const API = 'https://www.wixapis.com', jget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const PC = {}, ser = t => PC[t] || (PC[t] = (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => nz(p.c) && p.c > 0));
const closeOn = (t, d) => { const z = ser(t); for (let i = z.length - 1; i >= 0; i--) if (z[i].d <= d) return z[i]; return null; };
const lastD = () => { const z = ser('SPY'); return z.length ? z[z.length - 1].d : Math.floor(Date.now() / 864e5); };
const iso = d => new Date(d * 864e5).toISOString().slice(0, 10), dnum = s => Math.round(Date.parse(String(s).slice(0, 10) + 'T00:00:00Z') / 864e5);
const pct = (v, d = 1) => !nz(v) ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';
const usd = v => !nz(v) ? '—' : '$' + (+v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gc = v => v > 0 ? 'up' : v < 0 ? 'dn' : '';
const member = () => window.TWA && window.TWA.member ? window.TWA.member() : null, me = () => (member() || {}).id || '', nick = () => (member() || {}).nick || 'Member';
const toast = h => (window.TWA ? window.TWA.toast(h) : 0);
const needLogin = () => { const b = document.createElement('a'); b.setAttribute('data-login', 'up'); b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); };
async function tok(write) { if (member() && window.TWA.token) { const t = await window.TWA.token(); if (t) return t; } if (write) return null; return PP.token ? PP.token() : null; }
async function q(coll, filter, limit) { try { const r = await fetch(API + '/wix-data/v2/items/query', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: (await tok()) || '' }, body: JSON.stringify({ dataCollectionId: coll, query: { filter: filter || {}, sort: [{ fieldName: '_createdDate', order: 'ASC' }], cursorPaging: { limit: limit || 1000 } } }) }); if (!r.ok) return null; return ((await r.json()).dataItems || []).map(i => Object.assign({ _id: i.id, _at: i.data._createdDate && (i.data._createdDate.$date || i.data._createdDate) }, i.data)); } catch (e) { return null; } }
async function ins(coll, data, silent) { if (!member()) { if (!silent) needLogin(); return null; } const t = await tok(true); if (!t) { if (!silent) needLogin(); return null; } try { const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t }, body: JSON.stringify({ dataCollectionId: coll, dataItem: { data } }) }); if (!r.ok) { if (!silent) toast('Sorry, that did not save. Please try again.'); return null; } return (await r.json()).dataItem; } catch (e) { return null; } }
const code6 = () => Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const myL = () => jget('tw_dleagues', []), addMyL = (code, name) => { if (!myL().some(x => x.code === code)) jset('tw_dleagues', myL().concat([{ code, name }])); };
const BOT = 'BOT', BOTN = 'Tickerwise Score Bot';
/* Creator League: put the league code here once creators are signed up, and it is featured on #/draft. */
const FEATURED = [];
const POOL = () => S.filter(s => ser(s.t).length > 20 && s.t !== 'SPY').sort((a, b) => (b.ws || 0) - (a.ws || 0) || (a.t < b.t ? -1 : 1));
const ago = s => { if (!s) return ''; const m = (Date.now() - Date.parse(s)) / 6e4; return m < 1 ? 'just now' : m < 60 ? Math.round(m) + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; };
const IC = { yt: 'YouTube', x: 'X', sa: 'Seeking Alpha', web: 'Website' };
const safeUrl = u => /^https:\/\/[^\s"'<>]+$/i.test(u || '') ? u : '';

/* ---------- styles ---------- */
const css = document.createElement('style'); css.textContent = `
.dl-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.dl-k>div{background:#fff;border:1.5px solid var(--line,#E3E8F3);border-radius:14px;padding:12px 14px;min-width:0}.dl-k span{display:block;font:800 11px Inter,sans-serif;letter-spacing:1.2px;color:var(--mut,#64748B);text-transform:uppercase}.dl-k b{display:block;font:800 22px 'Space Grotesk',sans-serif;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dl-k small{display:block;color:var(--mut,#64748B);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dl-k.dk>div{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);color:#fff}.dl-k.dk span,.dl-k.dk small{color:#9FB0D6}
.up{color:#00A863}.dn{color:#E0344F}.dl-k.dk .up{color:#2BE39A}.dl-k.dk .dn{color:#FF7A90}
.dl-tabs{display:flex;gap:8px;flex-wrap:wrap}.dl-tabs a{padding:9px 16px;border-radius:999px;border:1.5px solid var(--line,#E3E8F3);font-weight:700;font-size:14px;color:#0B1B3F;text-decoration:none;background:#fff}.dl-tabs a.on{background:#0B1B3F;color:#fff;border-color:#0B1B3F}
.dl-st{display:flex;flex-direction:column;gap:8px}.dl-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;background:#fff;border:1.5px solid var(--line,#E3E8F3);border-radius:14px;padding:12px 14px;text-decoration:none;color:inherit}.dl-row:hover{border-color:#2F6BFF}
.dl-rk{font:800 22px 'Space Grotesk',sans-serif;text-align:center}.dl-nm{min-width:0}.dl-nm b{font-size:17px}.dl-nm small{display:block;color:var(--mut,#64748B);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dl-rt{text-align:right}.dl-rt b{font:800 20px 'Space Grotesk',sans-serif;display:block}.dl-rt small{font-size:12px;color:var(--mut,#64748B)}
.dl-bot{display:inline-block;background:#EEF3FF;color:#1F4FD1;font:800 10.5px Inter,sans-serif;letter-spacing:.8px;border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:2px}
.dl-sc{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
.dl-hm{border-collapse:separate;border-spacing:3px;font-size:12.5px;min-width:100%}.dl-hm th{font-weight:700;color:var(--mut,#64748B);padding:4px;white-space:nowrap}.dl-hm td{text-align:center;padding:8px 6px;border-radius:7px;font-weight:700;white-space:nowrap;min-width:46px}.dl-hm td.nm{text-align:left;background:none;color:#0B1B3F;font-weight:800;min-width:90px}.dl-hm small{display:block;font-weight:600;opacity:.85;font-size:10.5px}
.dl-board{border-collapse:separate;border-spacing:4px;width:100%;font-size:13px}.dl-board th{color:var(--mut,#64748B);font-weight:700;padding:4px 6px;white-space:nowrap}.dl-board td{background:#F4F7FF;border-radius:10px;padding:8px;text-align:center;min-width:84px;vertical-align:top}.dl-board td b{display:block;font:800 15px 'Space Grotesk',sans-serif}.dl-board td small{color:var(--mut,#64748B)}.dl-board td.clk{background:#FFF6E5;outline:2px solid #FFB020}.dl-board td.emp{background:#F8FAFD;color:#B6C0D3}.dl-board th.rd{width:30px}
.dl-strip{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}.dl-strip span{flex:0 0 auto;background:#fff;border:1.5px solid var(--line,#E3E8F3);border-radius:999px;padding:6px 12px;font-size:13px;white-space:nowrap}
.dl-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;max-height:380px;overflow:auto}.dl-pick button{text-align:left;background:#fff;border:1.5px solid var(--line,#E3E8F3);border-radius:12px;padding:10px 12px;cursor:pointer;font:600 13px Inter,sans-serif;color:#0B1B3F;min-width:0}.dl-pick button:hover{border-color:#00C176}.dl-pick button b{display:block;font:800 15px 'Space Grotesk',sans-serif}.dl-pick button small{display:block;color:var(--mut,#64748B);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dl-sw{display:inline-block;min-width:30px;text-align:center;border-radius:8px;padding:2px 6px;font-weight:800;font-size:12px;color:#0B1B3F}
.dl-f{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}.dl-f label{display:flex;flex-direction:column;gap:4px;font:600 12.5px Inter,sans-serif;color:var(--mut,#64748B);flex:1 1 150px;min-width:0}.dl-f input,.dl-f select{font:500 15px Inter,sans-serif;padding:11px 12px;border:1.5px solid var(--line,#E3E8F3);border-radius:12px;background:#fff;color:#0B1B3F;min-width:0;width:100%;box-sizing:border-box}.dl-f label.ck{flex-direction:row;align-items:center;gap:8px;font-size:14px;color:#0B1B3F}.dl-f label.ck input{width:auto}
.dl-code{font:800 15px 'Space Grotesk',sans-serif;letter-spacing:2px;background:#EEF3FF;color:#1F4FD1;border-radius:8px;padding:2px 10px}
.dl-pill{display:inline-block;font:800 11px Inter,sans-serif;letter-spacing:1.2px;border-radius:999px;padding:4px 10px}.dl-pill.dr{background:#FFF6E5;color:#8A5A00}.dl-pill.ss{background:#EAFBF3;color:#00794A}.dl-pill.fn{background:#EEF2F8;color:#3B4660}.dl-pill.pr{background:#F4EEFF;color:#5B2BC4}
.dl-hero{background:linear-gradient(145deg,#0B1B3F 0%,#10275A 55%,#1B3F94 100%);color:#fff;border-radius:24px;padding:30px;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between;overflow:hidden}.dl-hero h2{font:700 clamp(28px,4.6vw,46px)/1.05 'Space Grotesk',sans-serif;margin:0;letter-spacing:-1px}.dl-hero h2 em{font-style:normal;color:#00C176}.dl-hero p{margin:10px 0 0;color:#C9D5F0;font-size:16px;max-width:560px}
.dl-vs{display:flex;align-items:center;gap:10px;font:800 15px 'Space Grotesk',sans-serif}.dl-vs i{font-style:normal;width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(255,255,255,.08)}
.dl-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.dl-steps>div{background:#F4F7FF;border-radius:16px;padding:16px}.dl-steps b{display:flex;align-items:center;gap:8px;font:800 16px 'Space Grotesk',sans-serif}.dl-steps b i{font-style:normal;width:28px;height:28px;border-radius:9px;background:#2F6BFF;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px}.dl-steps p{margin:6px 0 0;font-size:14px;color:#3B4660}
.dl-bars{display:flex;flex-direction:column;gap:7px}.dl-bar{display:grid;grid-template-columns:70px minmax(0,1fr) 72px;gap:10px;align-items:center;font-size:13px}.dl-bar>b{font:800 14px 'Space Grotesk',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dl-bar>span{text-align:right;font-weight:800}.dl-tr{position:relative;height:16px;background:#F1F4FA;border-radius:8px}.dl-tr i{position:absolute;top:0;bottom:0;border-radius:8px}.dl-tr i.hat{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.55) 0 4px,transparent 4px 8px)}.dl-tr em{position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:#94A3B8}
.dl-mv{display:flex;flex-direction:column;gap:6px}.dl-mv>div{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1.5px solid var(--line,#E3E8F3);border-radius:12px;padding:10px 12px;font-size:14px}.dl-mv h4{margin:10px 0 2px;font:800 12px Inter,sans-serif;letter-spacing:1.2px;color:var(--mut,#64748B)}
.dl-tag{font:800 10.5px Inter,sans-serif;letter-spacing:.8px;border-radius:6px;padding:3px 7px}.dl-tag.in{background:#EAFBF3;color:#00794A}.dl-tag.out{background:#FFF0F3;color:#B3203D}.dl-tag.dr{background:#EEF3FF;color:#1F4FD1}
.dl-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.dl-slot{background:#fff;border:1.5px solid var(--line,#E3E8F3);border-radius:14px;padding:12px 14px;font-size:13px}.dl-slot .hd{display:flex;justify-content:space-between;font:800 11px Inter,sans-serif;letter-spacing:1px;color:var(--mut,#64748B)}.dl-slot .tk{font:800 20px 'Space Grotesk',sans-serif;margin:4px 0}.dl-slot .g{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px}.dl-slot .lk{margin-top:8px;padding-top:8px;border-top:1px dashed #E3E8F3;color:var(--mut,#64748B)}
.dl-links a{display:inline-block;margin-right:8px;font-size:13px;font-weight:700}
body.dl-bc .nav,body.dl-bc .ticker-tape,body.dl-bc footer.foot,body.dl-bc #r2-stat,body.dl-bc nav.r5-tab{display:none!important}body.dl-bc{background:#07142F}
.dl-bcw{min-height:100vh;background:radial-gradient(circle at 20% 0%,#1B3F94 0%,#0B1B3F 45%,#07142F 100%);color:#fff;padding:28px clamp(16px,4vw,56px);box-sizing:border-box;display:flex;flex-direction:column;gap:22px}
.dl-bcw .dl-row{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#fff}.dl-bcw .dl-nm small,.dl-bcw .dl-rt small{color:#9FB0D6}.dl-bcw .dl-rt b.up{color:#2BE39A}.dl-bcw .dl-rt b.dn{color:#FF7A90}
.dl-bct{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.dl-bct h1{margin:0;font:700 clamp(26px,4vw,52px) 'Space Grotesk',sans-serif}.dl-live{display:inline-flex;align-items:center;gap:8px;background:#E0344F;color:#fff;font:800 13px Inter,sans-serif;letter-spacing:1.5px;border-radius:999px;padding:6px 14px}.dl-live i{width:9px;height:9px;border-radius:50%;background:#fff;animation:dlp 1.2s ease-in-out infinite}@keyframes dlp{50%{opacity:.25}}
.dl-tick{overflow:hidden;white-space:nowrap;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12);padding:10px 0}.dl-tick div{display:inline-block;animation:dlt 60s linear infinite;padding-left:100%}.dl-tick span{margin-right:34px;font-weight:700}@keyframes dlt{to{transform:translateX(-100%)}}
.dl-race svg{width:100%;height:auto;display:block}
@media(max-width:640px){.dl-row{grid-template-columns:34px minmax(0,1fr) auto;padding:10px}.dl-rt b{font-size:17px}.dl-hero{padding:22px}.dl-bar{grid-template-columns:56px minmax(0,1fr) 62px}}
`; document.head.appendChild(css);

const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const head = (t, sub, extra) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p>${extra || ''}</div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const strip = (A, dk) => `<div class="dl-k${dk ? ' dk' : ''}">${A.map(a => `<div><span>${a[0]}</span><b class="${a[2] || ''}">${a[1]}</b>${a[3] ? `<small>${a[3]}</small>` : ''}</div>`).join('')}</div>`;
const heat = v => { if (!nz(v)) return 'background:#F1F4FA;color:#94A3B8'; const a = Math.min(1, Math.abs(v) / 40); return v >= 0 ? `background:rgba(0,193,118,${.15 + a * .75});color:${a > .55 ? '#fff' : '#064E33'}` : `background:rgba(224,52,79,${.15 + a * .75});color:${a > .55 ? '#fff' : '#7A1023'}`; };

/* ---------- the engine: replay the event log ---------- */
function engine(Lg, E) {
  const R = Lg.rules || {}, N = Math.max(3, Math.min(12, +R.slots || 8)), owner = Lg._owner, snake = R.mode !== 'open';
  const endD = R.end ? dnum(R.end) : null, today = lastD(), D = endD && endD < today ? endD : today, ended = !!(endD && endD < today);
  const P = {}, order = [], log = []; let started = !snake, picksN = 0;
  const pl = (id, nk) => P[id] || (P[id] = { id, nick: nk || 'Member', links: {}, slots: [...Array(N)].map(() => []), bot: id === BOT, at: null });
  if (R.bot) { pl(BOT, BOTN); }
  const held = () => { const h = new Set(); Object.values(P).forEach(p => p.slots.forEach(s => { const c = s[s.length - 1]; if (c && !c.xd) h.add(c.t); })); return h; };
  const draftOrder = () => order.length ? order : Object.keys(P);
  const turn = n => { const o = draftOrder(), k = o.length; if (!k) return null; const rd = Math.floor(n / k), i = n % k; return { who: o[rd % 2 ? k - 1 - i : i], slot: rd, rd: rd + 1 }; };
  const total = () => draftOrder().length * N;
  for (const e of E) { const d = e.data || {}, who = e._owner;
    if (d.k === 'join') { const p = pl(who, e.nick); p.nick = e.nick || p.nick; if (d.links) p.links = d.links; if (!p.at) p.at = e._at; continue; }
    if (d.k === 'start' && snake && !started && who === owner) { started = true; (d.order || []).forEach(id => { if (P[id] && !order.includes(id)) order.push(id); }); Object.keys(P).forEach(id => { if (!order.includes(id)) order.push(id); }); log.push({ k: 'start', at: e._at }); continue; }
    if (d.k === 'pick') { const s = BY[d.t], px = +d.px, dd = dnum(d.d); if (!s || !(px > 0) || !isFinite(dd)) continue;
      if (snake) { if (!started || picksN >= total()) continue; const t = turn(picksN); if (!t || t.who !== d.who) continue; if (!(who === d.who || who === owner || (d.who === BOT && P[who]))) continue; if (held().has(d.t)) continue;
        P[t.who].slots[t.slot].push({ t: d.t, px, d: dd, at: e._at, how: 'draft', pick: picksN + 1, rd: t.rd }); log.push({ k: 'pick', who: t.who, slot: t.slot, t: d.t, px, d: dd, at: e._at, pick: picksN + 1, rd: t.rd }); picksN++; continue; }
      const id = d.who === BOT ? (who === owner ? BOT : null) : who; if (!id || !P[id]) continue; const p = P[id], sl = p.slots.findIndex(z => !z.length); if (sl < 0 || p.slots.some(z => z.length && z[0].t === d.t)) continue;
      p.slots[sl].push({ t: d.t, px, d: dd, at: e._at, how: 'draft' }); log.push({ k: 'pick', who: id, slot: sl, t: d.t, px, d: dd, at: e._at }); continue; }
    if (d.k === 'swap') { const p = P[who], sl = +d.slot, s = BY[d.nt], npx = +d.npx, dd = dnum(d.d); if (!p || !s || !(npx > 0) || !p.slots[sl] || !isFinite(dd)) continue;
      if (snake && picksN < total()) continue; if (endD && dd > endD) continue; const cur = p.slots[sl][p.slots[sl].length - 1]; if (!cur || cur.xd || cur.t !== d.t) continue;
      if (snake && held().has(d.nt)) continue; if (!snake && p.slots.some(z => z.length && z[z.length - 1].t === d.nt)) continue;
      const xp = +d.xpx > 0 ? +d.xpx : (closeOn(cur.t, dd) || {}).c; if (!(xp > 0)) continue; cur.xd = dd; cur.xp = xp; cur.xat = e._at;
      p.slots[sl].push({ t: d.nt, px: npx, d: dd, at: e._at, how: 'swap' }); log.push({ k: 'swap', who, slot: sl, t: cur.t, xp, ret: (xp / cur.px - 1) * 100, nt: d.nt, npx, d: dd, at: e._at }); }
  }
  /* returns */
  const spxR = (a, b) => { const x = closeOn('SPY', a), y = closeOn('SPY', b); return x && y ? (y.c / x.c - 1) * 100 : null; };
  const done = snake ? started && picksN >= total() : Object.values(P).every(p => p.slots.every(s => s.length));
  Object.values(P).forEach(p => { let sum = 0, sp = 0, n = 0, best = null, worst = null, win = 0, lose = 0;
    p.slots.forEach((s, i) => { let tot = 0, spT = 0; s.forEach(c => { const end = c.xd || D, px = c.xd ? c.xp : (closeOn(c.t, D) || {}).c; c.now = px; c.ret = px && c.px ? (px / c.px - 1) * 100 : 0; c.spx = spxR(c.d, end); tot += c.ret; spT += c.spx || 0;
      if (!c.xd) { if (!best || c.ret > best.ret) best = c; if (!worst || c.ret < worst.ret) worst = c; } });
      s.tot = s.length ? tot : null; s.spT = spT; if (s.length) { sum += tot; sp += spT; n++; if (tot > 0) win++; else if (tot < 0) lose++; } });
    p.avg = n ? sum / N : null; p.spx = n ? sp / N : null; p.n = n; p.best = best; p.worst = worst; p.win = win; p.lose = lose; });
  const players = order.length ? order.map(id => P[id]) : Object.values(P);
  const rank = players.slice().sort((a, b) => (b.avg ?? -1e9) - (a.avg ?? -1e9));
  const onClock = snake && started && picksN < total() ? turn(picksN) : null;
  return { R, N, snake, started, done, ended, D, endD, P, players, rank, order: draftOrder(), log, picksN, total: total(), onClock, owner, held: held(), spxR };
}
/* season race: each player's average by trading day since the first pick */
function race(G) {
  const first = Math.min(...G.log.filter(x => x.k === 'pick').map(x => x.d)); if (!isFinite(first)) return null;
  const days = ser('SPY').map(p => p.d).filter(d => d >= first && d <= G.D); if (days.length < 3) return null; const step = Math.max(1, Math.floor(days.length / 80)), DD = days.filter((d, i) => i % step === 0 || i === days.length - 1);
  return G.rank.map(p => ({ p, pts: DD.map(d => { let sum = 0; p.slots.forEach(s => s.forEach(c => { if (c.d > d) return; const e = c.xd && c.xd <= d ? c.xp : (closeOn(c.t, d) || {}).c; if (e && c.px) sum += (e / c.px - 1) * 100; })); return [d, sum / G.N]; }) }));
}
const COL = ['#2F6BFF', '#00A863', '#FF8A00', '#7C3AED', '#E0344F', '#0A8F96', '#B07A00', '#DB2777', '#475569', '#16A34A', '#9333EA', '#0EA5E9', '#F59E0B'];
function raceSvg(G, dark) {
  const L = race(G); if (!L) return `<p class="muted" style="margin:0">${G.log.some(x => x.k === 'pick') ? 'The race chart fills in after a few trading days.' : 'The race starts with the first pick.'}</p>`;
  const W = 900, H = 280, pl = 46, pr = 120, pt = 14, pb = 24, all = L.flatMap(x => x.pts.map(p => p[1])), mx = Math.max(2, ...all), mn = Math.min(-2, ...all), d0 = L[0].pts[0][0], d1 = L[0].pts[L[0].pts.length - 1][0];
  const Xp = d => pl + (d - d0) / ((d1 - d0) || 1) * (W - pl - pr), Yp = v => pt + (H - pt - pb) - (v - mn) / ((mx - mn) || 1) * (H - pt - pb), tc = dark ? '#9FB0D6' : '#94A3B8';
  let g = [mn, 0, mx].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${Yp(v)}" y2="${Yp(v)}" stroke="${v === 0 ? (dark ? '#3B4F80' : '#CBD5E1') : (dark ? '#1E2E57' : '#EEF2F8')}"/><text x="${pl - 6}" y="${Yp(v) + 4}" text-anchor="end" font-size="11" fill="${tc}">${pct(v, 0)}</text>`).join('');
  const lab = []; L.forEach((x, i) => { const c = x.p.bot ? '#94A3B8' : COL[i % COL.length], l = x.pts[x.pts.length - 1]; g += `<polyline fill="none" stroke="${c}" stroke-width="${i === 0 ? 3.2 : 2.2}" ${x.p.bot ? 'stroke-dasharray="6 5"' : ''} points="${x.pts.map(p => Xp(p[0]).toFixed(1) + ',' + Yp(p[1]).toFixed(1)).join(' ')}"/>`; let y = Yp(l[1]) + 4; while (lab.some(v => Math.abs(v - y) < 13)) y += 13; lab.push(y); g += `<text x="${W - pr + 6}" y="${y}" font-size="12" font-weight="800" fill="${c}">${esc(x.p.nick.slice(0, 12))} ${pct(l[1], 1)}</text>`; });
  g += `<text x="${pl}" y="${H - 6}" font-size="11" fill="${tc}">${dfmt(iso(d0))}</text><text x="${W - pr}" y="${H - 6}" font-size="11" fill="${tc}" text-anchor="end">${dfmt(iso(d1))}</text>`;
  return `<div class="dl-race"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Season race: average return of each player over time">${g}</svg></div>`;
}

/* ---------- pages ---------- */
const status = G => G.ended ? '<span class="dl-pill fn">FINAL</span>' : !G.started ? '<span class="dl-pill pr">WAITING TO DRAFT</span>' : !G.done ? '<span class="dl-pill dr">DRAFTING</span>' : '<span class="dl-pill ss">IN SEASON</span>';
const nm = p => `${esc(p.nick)}${p.bot ? '<span class="dl-bot">BOT</span>' : ''}`;
const linkBar = p => { const L = p.links || {}; const a = Object.keys(IC).filter(k => safeUrl(L[k])).map(k => `<a href="${esc(safeUrl(L[k]))}" target="_blank" rel="noopener nofollow">${IC[k]} ↗</a>`); return a.length ? `<span class="dl-links">${a.join('')}</span>` : ''; };
function leagueStats(G) {
  const R = G.rank.filter(p => nz(p.avg)); if (!R.length) return '';
  const avg = R.reduce((a, p) => a + p.avg, 0) / R.length, ld = R[0], lt = R[R.length - 1], all = R.flatMap(p => p.slots.flatMap(s => s.filter(c => !c.xd).map(c => Object.assign({ who: p }, c)))), best = all.sort((a, b) => b.ret - a.ret)[0], worst = all[all.length - 1], green = R.filter(p => p.avg > 0).length, spx = R.reduce((a, p) => a + (p.spx || 0), 0) / R.length;
  return [['League Average', pct(avg, 2), gc(avg), 'mean of all players'], ['Leader', esc(ld.nick), '', pct(ld.avg, 2)], ['1st To Last Gap', pct(ld.avg - lt.avg, 1), '', 'spread'], ['Best Pick', best ? esc(best.t) + ' ' + pct(best.ret, 0) : '—', best ? gc(best.ret) : '', best ? esc(best.who.nick) : ''], ['In The Green', green + '/' + R.length, '', worst ? 'worst pick ' + esc(worst.t) + ' ' + pct(worst.ret, 0) : ''], ['S&P 500, Same Days', pct(spx, 2), gc(spx), avg >= spx ? 'league is ahead' : 'market is ahead']];
}
function standings(G, code, dark) {
  if (!G.rank.length) return '<p class="muted" style="margin:0">No players yet. Share the invite link.</p>';
  const n = G.rank.length; return `<div class="dl-st">${G.rank.map((p, i) => { const pc = n > 1 ? Math.round((1 - i / (n - 1)) * 100) : 100, vs = nz(p.avg) && nz(p.spx) ? p.avg - p.spx : null;
    return `<a class="dl-row" href="#/draft/${esc(code)}/p/${encodeURIComponent(p.id)}"><div class="dl-rk">${i === 0 && nz(p.avg) ? '♛' : i + 1}</div><div class="dl-nm"><b>${nm(p)}</b><small>${p.n}/${G.N} slots · ${p.win} up / ${p.lose} down${p.best ? ' · best ' + esc(p.best.t) + ' ' + pct(p.best.ret, 0) : ''}</small></div><div class="dl-rt"><b class="${gc(p.avg)}">${nz(p.avg) ? (p.avg >= 0 ? '▲ ' : '▼ ') + pct(p.avg, 2) : '—'}</b><small>${nz(vs) ? (vs >= 0 ? '+' : '−') + Math.abs(vs).toFixed(1) + ' pts vs S&amp;P' : ''}${n > 3 && nz(p.avg) ? ' · top ' + Math.round((i + 1) / n * 100) + '%' : ''}</small></div></a>`; }).join('')}</div>`;
}
function heatmap(G, code) {
  if (!G.rank.some(p => p.n)) return '<p class="muted" style="margin:0">The heatmap fills in as picks are made.</p>';
  return `<div class="dl-sc"><table class="dl-hm"><tr><th></th>${[...Array(G.N)].map((_, i) => `<th>${i + 1}</th>`).join('')}<th>Avg</th></tr>${G.rank.map(p => `<tr><td class="nm"><a href="#/draft/${esc(code)}/p/${encodeURIComponent(p.id)}">${esc(p.nick.slice(0, 14))}</a></td>${p.slots.map(s => { const c = s[s.length - 1]; return `<td style="${heat(s.tot)}" title="${c ? esc(c.t) + ' ' + pct(s.tot, 1) : 'empty'}">${c ? Math.round(s.tot) + '<small>' + esc(c.t) + '</small>' : '·'}</td>`; }).join('')}<td style="${heat(p.avg)}"><b>${nz(p.avg) ? pct(p.avg, 1) : '—'}</b></td></tr>`).join('')}</table></div><p class="muted" style="margin:8px 0 0;font-size:12.5px">Return by slot since each pick, in %. A slot's number includes returns locked in by earlier swaps. Price return only, closing prices.</p>`;
}
function moves(G, withPicks) {
  const L = G.log.filter(x => x.k === 'swap' || (withPicks && x.k === 'pick')).slice().reverse(); if (!L.length) return '<p class="muted" style="margin:0">No moves yet.</p>';
  const by = {}; L.forEach(x => { const k = iso(x.d); (by[k] = by[k] || []).push(x); });
  return `<div class="dl-mv">${Object.keys(by).map(k => `<h4>${esc(dfmt(k) || k).toUpperCase()} · ${by[k].length} move${by[k].length > 1 ? 's' : ''}</h4>${by[k].map(x => { const p = G.P[x.who]; return x.k === 'pick' ? `<div><b>${nm(p)}</b><span class="dl-tag dr">DRAFT${x.pick ? ' #' + x.pick : ''}</span><span>slot ${x.slot + 1}</span><b>${esc(x.t)}</b><span class="muted">at ${usd(x.px)}</span></div>`
    : `<div><b>${nm(p)}</b><span>slot ${x.slot + 1}</span><span class="dl-tag out">DROPPED</span><b>${esc(x.t)}</b><span class="muted">at ${usd(x.xp)}</span><b class="${gc(x.ret)}">${pct(x.ret, 2)} locked</b><span class="dl-tag in">PICKED UP</span><b>${esc(x.nt)}</b><span class="muted">at ${usd(x.npx)}</span></div>`; }).join('')}`).join('')}</div>`;
}
function board(G, code) {
  const o = G.order, k = o.length; if (!k) return '<p class="muted" style="margin:0">Players appear here as they join.</p>';
  let h = `<div class="dl-sc"><table class="dl-board"><tr><th class="rd">Rd</th>${o.map(id => `<th>${nm(G.P[id])}</th>`).join('')}</tr>`;
  for (let r = 0; r < G.N; r++) { h += `<tr><th class="rd">${r + 1}</th>${o.map(id => { const c = G.P[id].slots[r][0], clk = G.onClock && G.onClock.who === id && G.onClock.slot === r;
    return c ? `<td><b>${esc(c.t)}</b><small>#${c.pick || ''} · ${usd(c.px)}</small></td>` : `<td class="${clk ? 'clk' : 'emp'}">${clk ? '<b>On The Clock</b>' : '—'}</td>`; }).join('')}</tr>`; }
  return h + '</table></div>';
}
function pickPanel(G, code, Lg) {
  if (G.ended) return '';
  const my = me(), isOwner = my && my === G.owner, P = G.P[my];
  if (!G.snake) { if (!P) return ''; const left = P.slots.filter(s => !s.length).length; if (!left) return ''; return card('Make Your Picks', left + ' slot' + (left > 1 ? 's' : '') + ' left', pool(G, false)); }
  if (!G.started) return isOwner ? card('Start The Draft', G.order.length + ' players in', `<p style="margin:0 0 12px">When everyone has joined, start the draft. The order is shuffled at random and snakes back each round.${G.R.bot ? ' The Tickerwise Score Bot drafts the highest-scored stock left on its turn.' : ''}</p><button class="btn primary" id="dl-start">Start The Draft</button>`) : '';
  if (!G.onClock) return '';
  const who = G.P[G.onClock.who], mine = who.id === my;
  if (who.bot) return card('On The Clock: ' + esc(BOTN), 'round ' + G.onClock.rd, `<p style="margin:0">The bot is picking the highest-scored stock still available…</p>`);
  if (mine) return card('You Are On The Clock', 'round ' + G.onClock.rd + ' · pick #' + (G.picksN + 1), pool(G, true));
  return card('On The Clock: ' + esc(who.nick), 'round ' + G.onClock.rd + ' · pick #' + (G.picksN + 1), `<p style="margin:0">Waiting for ${esc(who.nick)} to pick. This page refreshes on its own.</p>${isOwner ? `<p style="margin:12px 0 0"><button class="btn ghost" id="dl-auto">Commissioner: Auto-Pick For ${esc(who.nick)}</button> <span class="muted" style="font-size:13px">takes the highest-scored stock left</span></p>` : ''}`);
}
function pool(G, snake) {
  const my = me(), P = G.P[my], have = new Set(P ? P.slots.map(s => s.length && s[s.length - 1].t).filter(Boolean) : []);
  const avail = POOL().filter(s => snake ? !G.held.has(s.t) : !have.has(s.t));
  return `<div class="dl-f" style="margin-bottom:10px"><label>Search the draft pool (${avail.length} stocks)<input id="dl-q" placeholder="Ticker, company or theme" autocomplete="off"></label></div><div class="dl-pick" id="dl-pool">${avail.map(s => `<button data-pk="${esc(s.t)}" data-q="${esc((s.t + ' ' + (s.n || '') + ' ' + (s.sec || '') + ' ' + (s.th || '')).toLowerCase())}"><b>${esc(s.t)} <span class="dl-sw" style="${heat(((s.ws || 5) - 5) * 8)}">${s.ws ?? '—'}</span></b><small>${esc(s.n || '')}</small><small>${usd((closeOn(s.t, lastD()) || {}).c)}</small></button>`).join('')}</div><p class="muted" style="margin:8px 0 0;font-size:12.5px">Sorted by Tickerwise Score. Your pick starts at the latest close and is locked once made.</p>`;
}

async function load(code) { const r = await q('Leagues', { code: { $eq: code } }, 1); const Lg = r && r[0]; if (!Lg || (Lg.rules || {}).type !== 'draft') return null; const E = (await q('LeagueEntries', { code: { $eq: code } }, 1000) || []).filter(e => e.pid === 'dl'); return { Lg, E, G: engine(Lg, E) }; }
let TM = 0, VER = 0; const stopT = () => { clearTimeout(TM); TM = 0; };
function poll(fn, ms) { stopT(); const h = location.hash; TM = setTimeout(() => { TM = 0; if (location.hash === h) fn(); }, ms); }

async function hub() {
  document.body.classList.remove('dl-bc'); ++VER; document.title = 'Draft Leagues — Tickerwise';
  const L = myL(), feat = FEATURED.length ? await Promise.all(FEATURED.map(c => load(c))) : [];
  const end = iso(lastD() + 182);
  app.innerHTML = head('Draft Leagues', 'Fantasy football, but for stocks. Draft a roster with friends, race all season on real closing prices, and see who really knows how to pick.') + wrap(`
    <div class="dl-hero"><div><h2>Draft your stocks.<br><em>Beat your friends.</em></h2><p>Snake draft or open picks, 5 to 12 stocks each, scored on real prices. Add the Tickerwise Score Bot and find out if you can beat the score. Paper picks only, so nothing real is at risk.</p></div><div class="dl-vs"><i>🏈</i>+<i>📈</i>=<i>🏆</i></div></div>
    ${feat.filter(Boolean).length ? card('Creator League', 'featured', feat.filter(Boolean).map(f => `<a class="dl-row" href="#/draft/${esc(f.Lg.code)}"><div class="dl-rk">★</div><div class="dl-nm"><b>${esc(f.Lg.name)}</b><small>${f.G.players.length} players · ${f.G.N} picks each</small></div><div class="dl-rt">${status(f.G)}</div></a>`).join('')) : ''}
    ${card('Create A Draft League', 'free', `<form class="dl-f" id="dl-new"><label>League name<input name="name" required maxlength="40" placeholder="e.g. Family Stock Draft 2027"></label><label>Format<select name="mode"><option value="snake">Snake draft (each stock once)</option><option value="open">Open picks (anyone can pick anything)</option></select></label><label>Stocks per player<select name="slots">${[5, 6, 8, 10, 12].map(n => `<option${n === 8 ? ' selected' : ''}>${n}</option>`).join('')}</select></label><label>Season ends<input type="date" name="end" value="${end}" required></label><label class="ck"><input type="checkbox" name="bot" checked> Add the Tickerwise Score Bot</label><button class="btn primary">Create League</button></form>`)}
    ${card('Join With A Code', '', `<form class="dl-f" id="dl-join"><label>League code<input name="code" maxlength="6" placeholder="ABC123" style="text-transform:uppercase" required></label><button class="btn ghost">Join</button></form>`)}
    ${card('Your Draft Leagues', '', L.length ? `<div class="dl-st">${L.map(x => `<a class="dl-row" href="#/draft/${esc(x.code)}"><div class="dl-rk">🏟️</div><div class="dl-nm"><b>${esc(x.name)}</b><small>code ${esc(x.code)}</small></div><div class="dl-rt"><small>Open →</small></div></a>`).join('')}</div>` : '<p class="muted" style="margin:0">You have not joined a draft league yet.</p>')}
    ${card('How It Works', '', `<div class="dl-steps"><div><b><i>1</i>Create &amp; invite</b><p>Pick a format and season length, then share the invite link with friends, family or your class.</p></div><div><b><i>2</i>Draft</b><p>Snake draft: each stock can only be owned once and the order flips every round. Open picks: everyone picks freely.</p></div><div><b><i>3</i>Race all season</b><p>Your score is the average return of your slots on real closing prices, next to the S&amp;P 500 over the same days.</p></div><div><b><i>4</i>Swap smart</b><p>Drop a stock and pick up a free one. The return you had is locked into that slot, and the new stock starts at 0%.</p></div></div>`)}
    ${card('Trades Between Players', 'Upgraded Plan', `<p style="margin:0 0 12px">Offer one of your stocks for one of a rival's, at today's prices. Both sides lock in what they had.</p><button class="btn ghost" data-paid="Player-to-player trades" data-paid-sub="Trade stocks with other players in your Draft League.">Propose A Trade</button>`)}
    ${card('Play In The Creator League', 'for finance creators', `<p style="margin:0 0 12px">We are lining up finance YouTubers, writers and X accounts for a public Creator League with a live draft. Want a seat?</p><form class="dl-f" id="dl-cr"><label>Your name<input name="n" required maxlength="60"></label><label>Email<input type="email" name="e" required maxlength="120"></label><label>Channel or profile links<input name="l" required maxlength="300" placeholder="https://youtube.com/@you"></label><button class="btn primary">Apply</button></form><p id="dl-crm" class="muted" style="margin:8px 0 0;font-size:13px"></p>`)}
    <p class="muted" style="margin:0;font-size:12.5px">Draft Leagues are a game for learning. Paper picks only: no money changes hands and there are no prizes. Not investment advice.</p>`);
  $('#dl-new').onsubmit = async e => { e.preventDefault(); const f = e.target; if (!member()) { needLogin(); return; } const code = code6(), name = f.name.value.trim().slice(0, 40), rules = { type: 'draft', mode: f.mode.value, slots: +f.slots.value, end: f.end.value, bot: f.bot.checked, start: iso(lastD()) };
    if (dnum(rules.end) <= lastD() + 6) { toast('Pick a season end at least a week away.'); return; }
    const r = await ins('Leagues', { code, name, nick: nick(), rules }); if (!r) return; await ins('LeagueEntries', { code, nick: nick(), pid: 'dl', data: { k: 'join' } });
    if (rules.bot && rules.mode === 'open') { const d = iso(lastD()); for (const s of POOL().slice(0, rules.slots)) await ins('LeagueEntries', { code, nick: BOTN, pid: 'dl', data: { k: 'pick', who: BOT, t: s.t, px: (closeOn(s.t, lastD()) || {}).c, d } }, true); }
    addMyL(code, name); location.hash = '#/draft/' + code; };
  $('#dl-join').onsubmit = e => { e.preventDefault(); const c = e.target.code.value.trim().toUpperCase(); if (c) location.hash = '#/draft/' + c; };
  $('#dl-cr').onsubmit = async e => { e.preventDefault(); const f = e.target, m = $('#dl-crm'); m.textContent = 'Sending…'; try { const t = await PP.token(); const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t }, body: JSON.stringify({ dataCollectionId: 'ContributorApplications', dataItem: { data: { name: f.n.value.trim(), email: f.e.value.trim(), topics: 'Creator League (Draft Leagues)', links: f.l.value.trim(), sample: '' } } }) }); if (!r.ok) throw 0; m.textContent = 'Thanks! We will be in touch before the draft.'; f.querySelector('button').disabled = true; } catch (x) { m.textContent = 'Could not send. Please try again.'; } };
}

let LASTN = -1;
async function league(code, tab, quiet) {
  document.body.classList.remove('dl-bc'); const v = ++VER; if (!quiet) LASTN = -1;
  if (!$('#dl-page')) app.innerHTML = head('Draft League', 'Loading…') + wrap('<p class="muted" id="dl-page">Loading…</p>');
  const x = await load(code); if (v !== VER) return;
  if (quiet && x && x.E.length === LASTN && $('#dl-up')) { const u = $('#dl-up'); if (u) u.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) + '.'; reArm(x.G, code, tab); return; }
  if (!x) { app.innerHTML = head('League Not Found', 'Check the code and try again.') + wrap('<a class="btn primary" href="#/draft">Back to Draft Leagues</a>'); return; }
  LASTN = x.E.length; const { Lg, G } = x, my = me(), joined = my && G.P[my], R = G.R; addMyL(code, Lg.name); document.title = Lg.name + ' — Tickerwise Draft Leagues';
  tab = tab || (G.started && !G.done && G.snake ? 'draft' : 'standings');
  const T = [['standings', 'Standings'], ['draft', 'Draft Board'], ['moves', 'Moves']];
  const recent = G.log.filter(z => z.k === 'pick').slice(-10).reverse();
  const body = tab === 'draft' ? `${pickPanel(G, code, Lg)}${recent.length ? `<div class="dl-strip">${recent.map(z => `<span>#${z.pick || ''} ${nm(G.P[z.who])} <b>${esc(z.t)}</b></span>`).join('')}</div>` : ''}${card('Draft Board', G.snake ? (G.started ? G.picksN + ' of ' + G.total + ' picks in' : 'order is set when the draft starts') : 'open picks', G.snake ? board(G, code) : heatmap(G, code))}`
    : tab === 'moves' ? card('Every Move In The League', 'an exit locks in its return; the stock replacing it starts at 0%', `<label class="dl-f" style="margin-bottom:10px"><span class="ck" style="display:flex;gap:8px;align-items:center;font-size:14px;color:#0B1B3F"><input type="checkbox" id="dl-wp"${jget('tw_dl_wp', 0) ? ' checked' : ''}> Show draft picks (${G.log.filter(z => z.k === 'pick').length})</span></label><div id="dl-mvs">${moves(G, jget('tw_dl_wp', 0))}</div>`)
    : `${G.rank.some(p => p.n) ? strip(leagueStats(G)) : ''}${pickPanel(G, code, Lg)}${card('Standings', 'average return of ' + G.N + ' slots per player', standings(G, code))}${card('League Heatmap', 'return by slot', heatmap(G, code))}${card('Season Race', 'average return over time, the bot dashed', raceSvg(G))}`;
  app.innerHTML = head(esc(Lg.name), `${status(G)} · code <span class="dl-code">${esc(code)}</span> · ${G.snake ? 'snake draft' : 'open picks'} · ${G.N} stocks each · season ends ${esc(dfmt(R.end) || R.end || '—')}${R.bot ? ' · with the Tickerwise Score Bot' : ''}`,
    `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">${joined ? '' : `<button class="btn primary" id="dl-jn">${member() ? 'Join This League' : 'Sign Up Free To Join'}</button>`}<button class="btn ghost" id="dl-inv">Copy Invite Link</button><a class="btn ghost" href="#/draft/${esc(code)}/broadcast">⛶ Broadcast</a>${joined ? `<a class="btn ghost" href="#/draft/${esc(code)}/p/${encodeURIComponent(my)}">My Roster</a>` : ''}</div>`) + wrap(`
    <nav class="dl-tabs">${T.map(t => `<a href="#/draft/${esc(code)}${t[0] === 'standings' ? '' : '/' + t[0]}" class="${t[0] === tab ? 'on' : ''}">${t[1]}</a>`).join('')}</nav>
    ${body}
    <p class="muted" style="margin:0;font-size:12.5px">Prices are closing prices as of ${esc(dfmt(iso(G.D)))}. Price return only, dividends not included. Paper picks only; not investment advice. <span id="dl-up">Updated just now.</span></p>`);
  $('#dl-inv').onclick = () => { const u = location.origin + location.pathname + '#/draft/' + code; try { navigator.clipboard.writeText(u); } catch (e) {} toast('✓ Invite link copied. Send it to your friends.'); };
  const jn = $('#dl-jn'); if (jn) jn.onclick = async () => { if (!member()) { needLogin(); return; } if (G.snake && G.started) { toast('This draft has already started. Ask the commissioner to start a new league.'); return; } if (await ins('LeagueEntries', { code, nick: nick(), pid: 'dl', data: { k: 'join' } })) { toast('✓ You are in!'); league(code, tab); } };
  const st = $('#dl-start'); if (st) st.onclick = async () => { const o = G.order.slice(); for (let i = o.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [o[i], o[j]] = [o[j], o[i]]; } st.disabled = true; if (await ins('LeagueEntries', { code, nick: nick(), pid: 'dl', data: { k: 'start', order: o } })) league(code, 'draft'); };
  const pick = async (t, who) => { const c = closeOn(t, lastD()); if (!c) return; $$('#dl-pool button').forEach(b => { b.disabled = true; }); const r = await ins('LeagueEntries', { code, nick: who === BOT ? BOTN : nick(), pid: 'dl', data: { k: 'pick', who, t, px: c.c, d: iso(c.d) } }); if (r) toast('✓ Picked ' + esc(t)); league(code, tab); };
  $$('#dl-pool button').forEach(b => b.onclick = () => pick(b.dataset.pk, G.snake ? G.onClock.who : my));
  const qq = $('#dl-q'); if (qq) qq.oninput = () => { const s = qq.value.trim().toLowerCase(); $$('#dl-pool button').forEach(b => { b.style.display = !s || b.dataset.q.includes(s) ? '' : 'none'; }); };
  const au = $('#dl-auto'); if (au) au.onclick = () => { const s = POOL().find(z => !G.held.has(z.t)); if (s) pick(s.t, G.onClock.who); };
  const wp = $('#dl-wp'); if (wp) wp.onchange = () => { jset('tw_dl_wp', wp.checked ? 1 : 0); $('#dl-mvs').innerHTML = moves(G, wp.checked); };
  /* the bot picks on its turn (any player's browser can file it; the log rejects duplicates) */
  if (G.onClock && G.onClock.who === BOT && joined) { const s = POOL().find(z => !G.held.has(z.t)), h = location.hash; if (s) { stopT(); TM = setTimeout(() => { TM = 0; if (location.hash === h) pick(s.t, BOT); }, 1500); } return; }
  reArm(G, code, tab);
}
function reArm(G, code, tab) { poll(() => league(code, tab, 1), G.snake && G.started && !G.done ? 6000 : 120000); }

async function player(code, id) {
  document.body.classList.remove('dl-bc'); stopT(); const v = ++VER; app.innerHTML = head('Player', 'Loading…') + wrap('<p class="muted">Loading…</p>');
  const x = await load(code); if (v !== VER) return; if (!x) { location.hash = '#/draft/' + code; return; }
  const { Lg, G } = x, p = G.P[id]; if (!p) { location.hash = '#/draft/' + code; return; }
  const rk = G.rank.indexOf(p) + 1, mine = id === me(), cur = p.slots.map((s, i) => ({ i, c: s[s.length - 1], s })).filter(z => z.c);
  const secs = {}; cur.forEach(z => { const s = BY[z.c.t], k = (s && (s.sec || s.th)) || 'Other'; secs[k] = (secs[k] || 0) + 1; });
  const bestS = cur.slice().sort((a, b) => b.s.tot - a.s.tot)[0], worstS = cur.slice().sort((a, b) => a.s.tot - b.s.tot)[0];
  const allC = p.slots.flatMap((s, i) => s.map(c => Object.assign({ slot: i }, c))), mx = Math.max(1, ...allC.map(c => Math.abs(c.ret / G.N)));
  const bar = (lab, v, scale, hat, col) => { const w = Math.min(50, Math.abs(v) / scale * 50); return `<div class="dl-bar"><b>${lab}</b><div class="dl-tr"><em></em><i class="${hat ? 'hat' : ''}" style="${v >= 0 ? 'left:50%' : 'right:50%'};width:${w}%;background-color:${col || (v >= 0 ? '#00C176' : '#E0344F')}"></i></div><span class="${gc(v)}">${pct(v, 2)}</span></div>`; };
  app.innerHTML = head(`${rk === 1 && nz(p.avg) ? '♛ ' : ''}#${rk} ${nm(p)}`, `${esc(Lg.name)} · ${status(G)} · ${p.bot ? 'drafts the highest Tickerwise Score left on every turn' : 'player'} ${linkBar(p)}`, `<p style="margin:12px 0 0"><a href="#/draft/${esc(code)}">← Back to standings</a></p>`) + wrap(`
    ${strip([['Average Return', pct(p.avg, 2), gc(p.avg), 'across ' + G.N + ' slots'], ['vs S&P 500', nz(p.avg) && nz(p.spx) ? (p.avg - p.spx >= 0 ? '+' : '−') + Math.abs(p.avg - p.spx).toFixed(1) + ' pts' : '—', nz(p.avg) && nz(p.spx) ? gc(p.avg - p.spx) : '', 'S&P ' + pct(p.spx, 2) + ' on the same days'], ['Winners / Losers', p.win + ' / ' + p.lose, '', 'slots up vs down'], ['Best Slot', bestS ? pct(bestS.s.tot, 1) : '—', bestS ? gc(bestS.s.tot) : '', bestS ? 'slot ' + (bestS.i + 1) + ' · ' + esc(bestS.s.map(c => c.t).join(' → ')) : ''], ['Worst Slot', worstS ? pct(worstS.s.tot, 1) : '—', worstS ? gc(worstS.s.tot) : '', worstS ? 'slot ' + (worstS.i + 1) + ' · ' + esc(worstS.s.map(c => c.t).join(' → ')) : '']])}
    ${mine ? card('Swap A Stock', G.snake && !G.done ? 'opens when the draft is complete' : 'drop one, pick up a free one', G.ended ? '<p class="muted" style="margin:0">The season is over.</p>' : G.snake && !G.done ? '<p class="muted" style="margin:0">Swaps open once every slot is drafted.</p>' : `<form class="dl-f" id="dl-sw"><label>Drop<select name="slot">${cur.map(z => `<option value="${z.i}">Slot ${z.i + 1}: ${esc(z.c.t)} (${pct(z.c.ret, 1)})</option>`).join('')}</select></label><label>Pick up<select name="nt">${POOL().filter(s => G.snake ? !G.held.has(s.t) : !cur.some(z => z.c.t === s.t)).map(s => `<option value="${esc(s.t)}">${esc(s.t)} · score ${s.ws ?? '—'} · ${esc((s.n || '').slice(0, 28))}</option>`).join('')}</select></label><button class="btn primary">Swap</button><button type="button" class="btn ghost" data-paid="Player-to-player trades" data-paid-sub="Trade stocks with other players in your Draft League.">Propose A Trade</button></form><p class="muted" style="margin:8px 0 0;font-size:12.5px">The dropped stock's return is locked into its slot at the latest close. The new stock starts at 0% from the same close.</p>`) : ''}
    ${card('Return Over Time', '', raceSvg(Object.assign({}, G, { rank: [p] })))}
    ${card('Sector Exposure', cur.length + ' stocks', cur.length ? `<div class="dl-bars">${Object.entries(secs).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<div class="dl-bar" style="grid-template-columns:minmax(0,34%) minmax(0,1fr) 70px"><b style="font:700 13px Inter,sans-serif">${esc(k)}</b><div class="dl-tr"><i style="left:0;width:${n / cur.length * 100}%;background:#2F6BFF"></i></div><span>${n} · ${Math.round(n / cur.length * 100)}%</span></div>`).join('')}</div>` : '<p class="muted" style="margin:0">No picks yet.</p>')}
    ${card('By Slot', 'what each current stock has done since it entered its slot', cur.length ? `<div class="dl-bars">${cur.slice().sort((a, b) => b.c.ret - a.c.ret).map(z => bar(z.i + 1 + ' ' + esc(z.c.t), z.c.ret, Math.max(1, ...cur.map(w => Math.abs(w.c.ret))))).join('')}</div>` : '<p class="muted" style="margin:0">No picks yet.</p>')}
    ${card('How The Average Is Built', 'each pick adds its return ÷ ' + G.N + '; solid = locked in, striped = still running', allC.length ? `<div class="dl-bars">${allC.slice().sort((a, b) => b.ret - a.ret).map(c => bar((c.slot + 1) + ' ' + esc(c.t), c.ret / G.N, mx, !c.xd)).join('')}</div><p style="margin:12px 0 0;font-weight:800">Sum of ${allC.length} pick${allC.length > 1 ? 's' : ''} across ${G.N} slots = <span class="${gc(p.avg)}">${pct(p.avg, 2)}</span></p>` : '<p class="muted" style="margin:0">No picks yet.</p>')}
    ${allC.some(c => c.xd) ? card('Dropped', 'the return up to the exit price stays in that slot', `<div class="dl-mv">${allC.filter(c => c.xd).map(c => `<div><b>Slot ${c.slot + 1}</b><b>${esc(c.t)}</b><span class="muted">${esc(dfmt(iso(c.d)))} – ${esc(dfmt(iso(c.xd)))}</span><b class="${gc(c.ret)}">${pct(c.ret, 2)} locked</b></div>`).join('')}</div>`) : ''}
    ${card('Slots', '', `<div class="dl-slots">${p.slots.map((s, i) => { const c = s[s.length - 1]; if (!c) return `<div class="dl-slot"><div class="hd"><span>SLOT ${i + 1}</span><span>EMPTY</span></div></div>`; const lk = s.slice(0, -1);
      return `<div class="dl-slot"><div class="hd"><span>SLOT ${i + 1}</span><span class="${gc(s.tot)}">${pct(s.tot, 2)}</span></div><div class="tk"><a href="#/stock/${esc(c.t)}">${esc(c.t)}</a></div><div class="g"><span class="muted">Cost</span><b>${usd(c.px)}</b><span class="muted">Now</span><b>${usd(c.now)}</b><span class="muted">Return</span><b class="${gc(c.ret)}">${pct(c.ret, 2)}</b><span class="muted">S&amp;P 500</span><b class="${gc(c.spx)}">${pct(c.spx, 2)}</b></div>${lk.length ? `<div class="lk">Locked in: ${lk.map(l => `${esc(l.t)} <b class="${gc(l.ret)}">${pct(l.ret, 2)}</b>`).join(' · ')}<br>${lk.map(l => pct(l.ret, 2)).join(' + ')} locked + ${pct(c.ret, 2)} on ${esc(c.t)} = <b>${pct(s.tot, 2)}</b></div>` : ''}</div>`; }).join('')}</div>`)}
    ${card('Season Moves', 'newest first', moves(Object.assign({}, G, { log: G.log.filter(z => z.who === id) }), true))}
    ${mine ? card('Your Links', 'shown next to your name', `<form class="dl-f" id="dl-lk">${Object.keys(IC).map(k => `<label>${IC[k]}<input name="${k}" placeholder="https://…" value="${esc(safeUrl((p.links || {})[k]))}" maxlength="200"></label>`).join('')}<button class="btn ghost">Save Links</button></form>`) : ''}`);
  const sw = $('#dl-sw'); if (sw) sw.onsubmit = async e => { e.preventDefault(); const sl = +sw.slot.value, z = cur.find(w => w.i === sl), nt = sw.nt.value, c = closeOn(nt, lastD()), xc = z && closeOn(z.c.t, lastD()); if (!z || !c || !xc) return; sw.querySelector('button').disabled = true;
    if (await ins('LeagueEntries', { code, nick: nick(), pid: 'dl', data: { k: 'swap', slot: sl, t: z.c.t, xpx: xc.c, nt, npx: c.c, d: iso(c.d) } })) { toast('✓ Swapped ' + esc(z.c.t) + ' for ' + esc(nt)); player(code, id); } };
  const lk = $('#dl-lk'); if (lk) lk.onsubmit = async e => { e.preventDefault(); const links = {}; Object.keys(IC).forEach(k => { const u = safeUrl(lk[k].value.trim()); if (u) links[k] = u; }); if (await ins('LeagueEntries', { code, nick: nick(), pid: 'dl', data: { k: 'join', links } })) { toast('✓ Links saved'); player(code, id); } };
}

async function broadcast(code) {
  const v = ++VER; document.body.classList.add('dl-bc'); window.scrollTo(0, 0);
  const x = await load(code); if (v !== VER) return; if (!x) { document.body.classList.remove('dl-bc'); location.hash = '#/draft'; return; }
  const { Lg, G } = x, live = G.snake && G.started && !G.done, all = G.rank.flatMap(p => p.slots.map(s => s[s.length - 1]).filter(Boolean).map(c => ({ p, c })));
  const tick = all.length ? all.sort((a, b) => b.c.ret - a.c.ret).map(z => `<span>${esc(z.c.t)} <b class="${gc(z.c.ret)}" style="color:${z.c.ret >= 0 ? '#2BE39A' : '#FF7A90'}">${pct(z.c.ret, 1)}</b> <small style="color:#9FB0D6">${esc(z.p.nick)}</small></span>`).join('') : '<span>Waiting for the first pick…</span>';
  const cl = G.onClock ? G.P[G.onClock.who] : null, lastPick = G.log.filter(z => z.k === 'pick').slice(-1)[0];
  app.innerHTML = `<div class="dl-bcw"><div class="dl-bct"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><svg viewBox="0 0 32 32" width="44" height="44" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#fff"/><rect x="6.5" y="13" width="4.5" height="11" rx="1.2" fill="#FF4D6D"/><rect x="13.75" y="9" width="4.5" height="15" rx="1.2" fill="#FFB020"/><rect x="21" y="5" width="4.5" height="19" rx="1.2" fill="#00C176"/></svg><h1>${esc(Lg.name)}</h1>${live ? '<span class="dl-live"><i></i>LIVE DRAFT</span>' : status(G)}</div><a href="#/draft/${esc(code)}" style="color:#fff;border:1.5px solid rgba(255,255,255,.4);border-radius:999px;padding:10px 18px;font-weight:700;text-decoration:none;background:transparent">Exit Broadcast</a></div>
    ${live ? `<div class="dl-k dk"><div><span>On The Clock</span><b>${cl ? nm(cl) : '—'}</b><small>round ${G.onClock.rd} · pick #${G.picksN + 1} of ${G.total}</small></div><div><span>Last Pick</span><b>${lastPick ? esc(lastPick.t) : '—'}</b><small>${lastPick ? esc(G.P[lastPick.who].nick) : ''}</small></div></div>` : (G.rank.some(p => p.n) ? strip(leagueStats(G), 1) : '')}
    <div class="dl-tick"><div>${tick}</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:22px"><div>${standings(G, code)}</div><div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px">${raceSvg(G, 1)}</div></div>
    <p style="margin:0;color:#9FB0D6;font-size:13px">tickerwise · Draft Leagues · join free with code <b style="color:#fff">${esc(code)}</b> · closing prices as of ${esc(dfmt(iso(G.D)))} · paper picks, not investment advice</p></div>`;
  poll(() => { if (/\/broadcast$/.test(location.hash)) broadcast(code); }, live ? 6000 : 60000);
}

/* ---------- Paper Trading + Watchlist extras ---------- */
function paperExtras(id) {
  const o = jget('tw_paper', { list: [] }), P = (o.list || []).find(x => x.id === id); if (!P || !PP.calc || $('#dl-pp')) return;
  const sc = $$('#app .card').find(c => /Scorecard/.test(($('h3', c) || {}).textContent || '')); if (!sc) return;
  const c = PP.calc(P), S0 = P.start || 100000, rows = c.rows || []; const box = document.createElement('div'); box.id = 'dl-pp'; box.style.cssText = 'display:flex;flex-direction:column;gap:18px';
  if (!rows.length) return;
  const open = c.open || [], green = open.filter(r => r.r > 0).length, rs = open.map(r => r.r).filter(nz), worst = open.slice().sort((a, b) => a.r - b.r)[0];
  const contrib = rows.map(r => Object.assign({ cp: r.g / S0 * 100 }, r)).sort((a, b) => b.cp - a.cp), mx = Math.max(.1, ...contrib.map(r => Math.abs(r.cp)));
  const bar = r => { const w = Math.min(50, Math.abs(r.cp) / mx * 50); return `<div class="dl-bar"><b>${esc(r.t)}</b><div class="dl-tr"><em></em><i class="${r.sd ? '' : 'hat'}" style="${r.cp >= 0 ? 'left:50%' : 'right:50%'};width:${w}%;background-color:${r.cp >= 0 ? '#00C176' : '#E0344F'}"></i></div><span class="${gc(r.cp)}">${pct(r.cp, 2)}</span></div>`; };
  const ev = []; rows.forEach(r => { ev.push({ d: r.bd, h: `<span class="dl-tag in">BOUGHT</span><b>${esc(r.t)}</b><span>${(+r.q).toLocaleString()} sh at ${usd(r.bp)}</span>` }); if (r.sd) ev.push({ d: r.sd, h: `<span class="dl-tag out">SOLD</span><b>${esc(r.t)}</b><span>${(+r.q).toLocaleString()} sh at ${usd(r.sp)}</span><b class="${gc(r.r)}">${pct(r.r, 2)} locked</b>` }); });
  ev.sort((a, b) => String(b.d).localeCompare(String(a.d)));
  box.innerHTML = strip([['In The Green', green + '/' + open.length, '', 'open positions up'], ['Best Open', open.length ? esc(open.slice().sort((a, b) => b.r - a.r)[0].t) + ' ' + pct(Math.max(...rs), 0) : '—', open.length ? gc(Math.max(...rs)) : ''], ['Worst Open', worst ? esc(worst.t) + ' ' + pct(worst.r, 0) : '—', worst ? gc(worst.r) : ''], ['Best To Worst Gap', rs.length > 1 ? pct(Math.max(...rs) - Math.min(...rs), 0) : '—', ''], ['Closed Trades', String((c.closed || []).length), '', (c.closed || []).length ? 'win rate ' + Math.round((c.closed.filter(r => r.r > 0).length / c.closed.length) * 100) + '%' : '']])
    + card('How Your Return Is Built', 'each trade\'s gain as a share of your $' + S0.toLocaleString() + ' start; solid = sold, striped = still open', `<div class="dl-bars">${contrib.map(bar).join('')}</div><p style="margin:12px 0 0;font-weight:800">Sum of ${rows.length} trade${rows.length > 1 ? 's' : ''} = <span class="${gc(c.ret)}">${pct(c.ret, 2)}</span></p>`)
    + card('Moves', 'every buy and sell, newest first', `<div class="dl-mv">${ev.slice(0, 60).map(e => `<div><span class="muted" style="min-width:92px">${esc(dfmt(e.d) || e.d)}</span>${e.h}</div>`).join('')}</div>`);
  sc.after(box);
}
function watchStrip() {
  if ($('#dl-ws')) return; const ph = $('#app .page-h'); if (!ph || !/Watchlist/.test(ph.textContent)) return; const WL = jget('tw-watchlist', []).filter(t => BY[t]); if (!WL.length) return;
  const d = lastD(), R = WL.map(t => { const a = closeOn(t, d), b = closeOn(t, d - 1), m = closeOn(t, d - 30); return { t, d1: a && b && b.d < a.d ? (a.c / b.c - 1) * 100 : null, m1: a && m ? (a.c / m.c - 1) * 100 : null, ws: BY[t].ws }; });
  const m1 = R.filter(r => nz(r.m1)), best = m1.slice().sort((a, b) => b.m1 - a.m1)[0], worst = m1.slice().sort((a, b) => a.m1 - b.m1)[0], avg = m1.length ? m1.reduce((a, r) => a + r.m1, 0) / m1.length : null, ws = R.filter(r => nz(r.ws)), sp = (() => { const a = closeOn('SPY', d), m = closeOn('SPY', d - 30); return a && m ? (a.c / m.c - 1) * 100 : null; })();
  const el = document.createElement('div'); el.id = 'dl-ws'; el.className = 'wrap'; el.style.cssText = 'margin-top:16px';
  el.innerHTML = strip([['Stocks', String(WL.length), '', 'on your watchlist'], ['Average Score', ws.length ? (ws.reduce((a, r) => a + r.ws, 0) / ws.length).toFixed(1) : '—', '', 'Tickerwise Score'], ['Up Today', R.filter(r => r.d1 > 0).length + '/' + R.filter(r => nz(r.d1)).length, ''], ['Average, 1 Month', pct(avg, 1), gc(avg), nz(sp) ? 'S&P 500 ' + pct(sp, 1) : ''], ['Best, 1 Month', best ? esc(best.t) + ' ' + pct(best.m1, 0) : '—', best ? gc(best.m1) : ''], ['Worst, 1 Month', worst ? esc(worst.t) + ' ' + pct(worst.m1, 0) : '—', worst ? gc(worst.m1) : '']]);
  ph.after(el);
}
function leagueTeaser() {
  if ($('#dl-tz')) return; const w = $('#app .sec .wrap'); if (!w) return; const el = document.createElement('div'); el.id = 'dl-tz';
  el.innerHTML = `<a class="dl-row" href="#/draft" style="border-color:#00C176"><div class="dl-rk">🏈</div><div class="dl-nm"><b>New: Draft Leagues</b><small>Fantasy-style stock drafts with friends, a live draft board and the Tickerwise Score Bot.</small></div><div class="dl-rt"><small>Open →</small></div></a>`; w.prepend(el);
}

/* ---------- router ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0], p = h.split('/');
  if (p[0] !== 'draft') { if (document.body.classList.contains('dl-bc')) document.body.classList.remove('dl-bc'); stopT(); ++VER; }
  if (p[0] === 'draft') { stopT(); $$('#navlinks a').forEach(a => a.classList.remove('on')); const c = (p[1] || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!c) hub(); else if (p[2] === 'broadcast') broadcast(c); else if (p[2] === 'p' && p[3]) player(c, decodeURIComponent(p[3])); else league(c, p[2] === 'draft' || p[2] === 'moves' ? p[2] : null); if (p[2] !== 'broadcast') window.scrollTo(0, 0); return; }
  const later = (fn, test) => { let n = 0; const go = () => { if (test()) fn(); else if (n++ < 25) setTimeout(go, 160); }; setTimeout(go, 220); };
  if (p[0] === 'paper' && p[1] === 'p' && p[2]) later(() => paperExtras(decodeURIComponent(p[2])), () => $$('#app .card h3').some(x => /Scorecard/.test(x.textContent)));
  if (p[0] === 'watchlist') later(watchStrip, () => $('#app .page-h'));
  if (p[0] === 'leagues' && !p[1]) later(leagueTeaser, () => $('#app .sec .wrap'));
  if (p[0] === 'paper' && !p[1]) later(() => { const g = $('#app .tq-tool'); if (g && !$('a.tq-tool[href="#/draft"]')) { const a = g.cloneNode(true); a.href = '#/draft'; const i = $('i', a); if (i) i.textContent = '🏈'; const b = $('b', a) || $('h4', a) || $('strong', a); if (b) b.textContent = 'Draft Leagues'; const s = $('p', a) || $('span', a); if (s) s.textContent = 'Fantasy-style stock drafts with friends.'; g.parentNode.appendChild(a); } }, () => $('#app .tq-tool'));
}
window.addEventListener('hashchange', () => setTimeout(route, 80)); setTimeout(route, 80);
window.TWDL = { engine, load, FEATURED, league };
})();
