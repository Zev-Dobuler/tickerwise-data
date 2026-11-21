/* Tickerwise Zacks Style Scores + Industry Rank. Run on a zacks.com tab (Zev logged in) with javascript_tool after setting window.__ZTK = [tickers].
   Not awaited: stores the result on window.__Z (JSON string). Same fields for every stock. */
(async () => {
  const TK = window.__ZTK || [], out = {};
  const one = async t => {
    for (let k = 0; k < 3; k++) {
      try {
        const r = await fetch('/stock/quote/' + encodeURIComponent(t));
        if (!r.ok) { if (r.status === 404) return; throw 0; }
        const d = new DOMParser().parseFromString(await r.text(), 'text/html');
        const B = [...d.querySelectorAll('.zr_rankbox')].map(x => { x.querySelectorAll('.tooltiptext').forEach(y => y.remove()); return x.textContent.replace(/\s+/g, ' ').trim(); });
        const st = B.find(s => /^Style Scores/.test(s)) || '', ir = B.find(s => /^Industry Rank/.test(s)) || '';
        const g = n => (st.match(new RegExp('([A-F]) ' + n)) || [])[1] || null;
        const m = ir.match(/(Top|Bottom) (\d+)% \((\d+) out of (\d+)\)/), ind = (ir.match(/Industry: (.+)$/) || [])[1] || null;
        const o = { v: g('Value'), g: g('Growth'), m: g('Momentum'), vgm: g('VGM'), ir: m ? +m[3] : null, irn: m ? +m[4] : null, ind: ind };
        if (Object.values(o).some(x => x != null)) out[t] = o;
        return;
      } catch (e) { await new Promise(r => setTimeout(r, 900)); }
    }
  };
  const q = TK.slice();
  await Promise.all([0, 1, 2, 3].map(async () => { while (q.length) await one(q.shift()); }));
  window.__Z = JSON.stringify({ read: new Date().toISOString().slice(0, 10), T: out });
})();
1
