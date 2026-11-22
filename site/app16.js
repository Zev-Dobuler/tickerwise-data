/* Tickerwise app16: "Ask AI" prompts scattered across the site, each tied to the page you're on.
   Answers need the backend + AI key, so every prompt opens a locked preview marked "Upgraded Plan". */
(function () {
if (window.TWAI) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { BY, esc } = X, app = $('#app'); if (!app || !esc) return;
const nm = t => (BY && BY[t] && BY[t].n) || t;
/* questions per page; {t} = ticker, {n} = company name, {x} = page subject */
const Q = {
  stock: ['Why did {t} move this week?', 'Bull case vs bear case for {t} in 60 seconds', 'Is {t} expensive compared with its peers?', 'What could break the {t} story?', 'Explain {n}\'s business like I\'m 15', 'What should I watch in {t}\'s next earnings?'],
  technicals: ['Is {t} in an uptrend or a downtrend, and how strong?', 'Where are {t}\'s support and resistance levels?'],
  earnings: ['Summarize {t}\'s last earnings call in 5 bullets', 'Did {t} raise or cut guidance, and why?', 'How does the market usually react to {t} earnings?'],
  financials: ['Is {t}\'s growth getting faster or slower?', 'Explain {t}\'s margins in plain English'],
  famous: ['Why are famous investors buying or selling {t}?', 'Which legend has the best record on {t}?'],
  analysts: ['Why do analysts disagree on {t}?'], risk: ['What are the three biggest risks for {t}?'], community: ['What is the community most worried about on {t}?'],
  investors: ['What are the legends buying that I don\'t own?', 'Which sector are the famous investors rotating into, and why?', 'Explain what a 13F filing tells you, and what it doesn\'t'],
  investor: ['Explain {x}\'s strategy in plain English', 'What did {x} change last quarter, and why might that be?', 'Build me a paper portfolio inspired by {x}'],
  paper: ['Review my paper portfolio: what is my biggest risk?', 'Why am I beating or lagging the S&P 500?', 'Suggest three trades that would balance my portfolio'],
  social: ['Which Lead Trader fits my risk level?', 'Why is the top Lead Trader winning this month?'],
  screener: ['Find me profitable growth stocks under 30x earnings', 'Turn my idea into a screen: "AI stocks that are still cheap"'],
  markets: ['What moved the market today, in one paragraph?', 'Is this a good time to be careful?', 'Which sectors are leading and why?'],
  themes: ['Which theme has the strongest momentum right now?', 'Explain this theme and its best stocks for a beginner'],
  compare: ['Make the case: which of these is the better buy?', 'Compare these companies\' moats in plain English'],
  watchlist: ['What changed on my watchlist this week?', 'Which stock on my watchlist looks strongest right now?'],
  xray: ['What would make my portfolio safer?', 'Am I too concentrated in one sector?'],
  briefing: ['Give me today\'s briefing as a 1-minute summary', 'What is the one thing I should know today?'],
  signals: ['Explain this signal and how reliable it has been'], alerts: ['Suggest smart alerts for my watchlist'],
  options: ['Explain this option trade and its risk like I\'m new', 'Which is better here, a call or buying the stock?'],
  fairvalue: ['Are my fair-value assumptions realistic?', 'What growth is the current price assuming?'],
  orders: ['Where should I set a stop loss on my positions?'], leagues: ['Give me a strategy to win my league'],
  replay: ['Review my last replay: what did I do well and badly?'], learn: ['Quiz me on what I just learned', 'Explain this term with a real example'],
  home: ['What are the three best-scoring stocks right now, and why?', 'I have $1,000 to learn with. Where do I start?'],
  tools: ['Which Tickerwise tool should I start with?', 'Build me a weekly routine using these tools'],
  dashboard: ['Summarize my dashboard in three sentences'], brokers: ['Which broker fits someone like me?'], letters: ['Summarize Buffett\'s latest letter in 10 bullets'], community_hub: ['What is everyone talking about today?']
};
const css = document.createElement('style'); css.textContent = `
.ai-box{border:1.5px solid #DDD6FE;background:linear-gradient(135deg,#FAF5FF,#EFF6FF);border-radius:18px;padding:14px 16px;margin:0}
.ai-box .ai-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;font:800 15px 'Space Grotesk',sans-serif;color:#3B0764}
.ai-box .ai-h i{font-style:normal;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,#7C3AED,#2F6BFF);color:#fff;font-size:14px}
.ai-q{display:flex;gap:8px;flex-wrap:wrap}.ai-q button{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #E9D5FF;background:#fff;border-radius:999px;padding:8px 13px;font:600 13px Inter,sans-serif;color:#4C1D95;cursor:pointer;text-align:left;max-width:100%}
.ai-q button:hover{border-color:#7C3AED;box-shadow:0 6px 16px rgba(124,58,237,.15)}.ai-q button b{font-size:11px}
.ai-ov{position:fixed;inset:0;z-index:1000;background:rgba(7,19,52,.55);backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px}
.ai-m{background:#fff;border-radius:22px;max-width:520px;width:100%;padding:24px;box-shadow:0 40px 80px rgba(0,0,0,.35);position:relative;max-height:calc(100vh - 32px);overflow:auto}
.ai-m .x{position:absolute;right:14px;top:10px;border:0;background:none;font-size:22px;cursor:pointer;color:#64748B}
.ai-you{background:#0B1B3F;color:#fff;border-radius:16px 16px 4px 16px;padding:10px 14px;margin:6px 0 14px auto;max-width:85%;width:fit-content;font-size:14.5px}
.ai-ans{position:relative;border-radius:16px;border:1.5px solid var(--line);padding:16px;overflow:hidden;min-height:250px}
.ai-ans .ln{height:11px;border-radius:6px;background:linear-gradient(90deg,#E2E8F0,#F1F5F9,#E2E8F0);background-size:200% 100%;animation:aish 1.6s linear infinite;margin:9px 0;filter:blur(1.5px)}
@keyframes aish{to{background-position:-200% 0}}
.ai-lk{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;background:rgba(255,255,255,.55);backdrop-filter:blur(2px);padding:12px}
.ai-lk b{font:800 17px 'Space Grotesk',sans-serif}.ai-lk span.l{font-size:30px}
.ai-chip{display:inline-flex;align-items:center;gap:6px;margin-left:8px;border:1.5px solid #E9D5FF;background:#FAF5FF;border-radius:999px;padding:4px 10px;font:700 12px Inter,sans-serif;color:#6D28D9;cursor:pointer;vertical-align:middle}
@media (prefers-reduced-motion:reduce){.ai-ans .ln{animation:none}}
`; document.head.appendChild(css);
const UP = '<span class="tw-up">Upgraded Plan</span>';
function open(q) {
  const o = document.createElement('div'); o.className = 'ai-ov';
  o.innerHTML = `<div class="ai-m" role="dialog" aria-modal="true"><button class="x" aria-label="Close">×</button><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><b style="font:800 20px 'Space Grotesk',sans-serif">Ask Tickerwise AI</b>${UP}</div>
    <div class="ai-you">${esc(q)}</div>
    <div class="ai-ans">${[92, 100, 86, 97, 64, 0, 90, 78].map(w => w ? `<div class="ln" style="width:${w}%"></div>` : '<div style="height:8px"></div>').join('')}
      <div class="ai-lk"><span class="l">🔒</span><b>AI answers are an Upgraded Plan feature</b><span style="font-size:13.5px;color:#475569;max-width:340px">Get instant answers built on Tickerwise scores, prices, earnings and Famous Investors data, right on the page you're reading.</span><a class="btn primary" href="#/plans" style="margin-top:4px">See Plans</a></div></div>
    <p class="muted" style="font-size:12px;margin:12px 0 0">Every answer will show its sources and the data date. Educational only, not investment advice.</p></div>`;
  document.body.appendChild(o); const close = () => o.remove(); $('.x', o).onclick = close; o.onclick = e => { if (e.target === o || e.target.closest('a[href="#/plans"]')) close(); };
}
document.addEventListener('click', e => { const b = e.target.closest('[data-aiq]'); if (b) { e.preventDefault(); open(b.dataset.aiq); } });
function box(keys, v, title, max) {
  const L = []; keys.forEach(k => (Q[k] || []).forEach(q => L.push(q.replace(/\{t\}/g, v.t || '').replace(/\{n\}/g, v.n || '').replace(/\{x\}/g, v.x || ''))));
  const el = document.createElement('div'); el.className = 'ai-box'; el.id = 'ai-box';
  el.innerHTML = `<div class="ai-h"><i>✦</i>${esc(title || 'Ask AI about this page')} ${UP}</div><div class="ai-q">${L.slice(0, max || 4).map(q => `<button data-aiq="${esc(q)}">✦ ${esc(q)} <b>🔒</b></button>`).join('')}</div>`;
  return el;
}
function place(el, where) { if ($('#ai-box')) return; const tgt = where(); if (!tgt) return false; tgt.el ? tgt.el[tgt.how || 'after'](el) : null; return true; }
const W = () => { const w = $('#app .sec .wrap'); if (w) return w; const h = $('#app .page-h'); if (!h) return null; const s = document.createElement('section'); s.className = 'sec'; s.style.paddingTop = '14px'; s.innerHTML = '<div class="wrap"></div>'; h.after(s); return s.firstChild; };
const TABK = { technicals: 'technicals', earnings: 'earnings', financials: 'financials', famous: 'famous', analysts: 'analysts', risk: 'risk', community: 'community' };
function route() {
  const old = $('#ai-box'); if (old) old.remove();
  const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('?')[0].split('/'), k = p[0] || 'home'; let tries = 0;
  const go = () => {
    if ($('#ai-box')) return; let done = false;
    if (k === 'stock' && p[1]) { const t = decodeURIComponent(p[1]).toUpperCase(), tab = p[2] || 'overview', m = $('.main'); if (m) { const keys = TABK[tab] ? [TABK[tab], 'stock'] : ['stock']; m.prepend(box(keys, { t, n: nm(t) }, 'Ask AI about ' + t, TABK[tab] ? 4 : 6)); done = true; } }
    else if (k === 'investors' && p[1] && p[1] !== 'stock') { const F = window.TWFI, inv = F && F.INV && F.INV.find(i => i.id === p[1]); const w = inv && W(); if (w) { w.prepend(box(['investor'], { x: inv.name || '' }, 'Ask AI about this investor', 3)); done = true; } }
    else if (k === 'paper' && p[1] === 'replay') { const w = $('#app .sec .wrap'); if (w) { w.prepend(box(['replay'], {}, 'Ask AI about your replay', 1)); done = true; } }
    else if (k === 'embed') done = true;
    else { const key = k === 'community' ? 'community_hub' : k === 'replay-board' ? 'replay' : k; if (Q[key]) { if (key === 'home') { const h = $('#hm-social', app) || $('#app section:nth-of-type(2)'); if (h) { const s = document.createElement('section'); s.className = 'sec'; s.style.paddingTop = '8px'; s.innerHTML = '<div class="wrap"></div>'; s.firstChild.appendChild(box(['home'], {}, 'Ask AI anything about the market', 2)); h.before(s); done = true; } } else { const w = W(); if (w) { w.prepend(box([key], {}, null, 4)); done = true; } } } else done = true; }
    if (!done && tries++ < 25) setTimeout(go, 250);
  };
  setTimeout(go, 900);
}
/* small "✦ Ask AI" chips next to key headings anywhere they appear */
new MutationObserver(() => {
  $$('#app .card-h h3:not([data-ai])').forEach(h => { h.dataset.ai = 1; const t = h.textContent.trim(), tk = (location.hash.match(/^#\/stock\/([^/]+)/) || [])[1];
    const map = { 'Report Card': `Explain ${tk || 'this stock'}'s Report Card grades`, 'Famous Investors Who Own': null, 'Net Money Flow': 'Why are the legends moving money this way?', 'Your Option Positions': 'Should I close or hold my options?', 'Leaderboard': 'What are the leaders doing differently?', 'Sector Rotation': 'What does this sector rotation mean for me?', 'Group Watchlist': 'Which group pick looks strongest?' };
    const q = map[t]; if (q) { const c = document.createElement('button'); c.className = 'ai-chip'; c.dataset.aiq = q; c.innerHTML = '✦ Ask AI 🔒'; h.appendChild(c); } });
}).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', route); route();
window.TWAI = { open, Q };
})();
