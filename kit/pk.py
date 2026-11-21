import json, re
d = json.load(open('/home/claude/tw2/work/data.json'))
RK = sorted({k for o in d['stocks'] if 'risk' in o for k in o['risk']['r']})
def first(s, n=170):
    if not s: return ''
    s = re.split(r'(?<=[.])\s+', s)[0]
    return s if len(s) <= n else s[:n].rsplit(' ', 1)[0] + '…'
# Analyst estimate quarters (next 5, all Fiscal.ai gives) are shown only once (almost) every stock has them, so their presence never marks a holding.
_has = [o for o in d['stocks'] if any(x['k'] != 'E' for x in o['fq'])]
_est = [o for o in _has if sum(1 for x in o['fq'] if x['k'] == 'E' and x.get('rev') is not None) >= 2]
_EST_ON = bool(_has) and len(_est) >= 0.9 * len(_has)
print('estimate quarters', 'ON' if _EST_ON else 'off', len(_est), 'of', len(_has))
for o in d['stocks']:
    if 'risk' in o:
        r = o['risk']
        r['r'] = [[RK.index(k), v['e'], v['s'], first(v['w'],140) if (v['e'] or 0) >= 6 else ''] for k, v in r['r'].items()]
    # Reported quarters only, labelled by calendar quarter, so holdings and wish-list stocks look identical
    # (estimates exist only for some stocks today; they come back for everyone once the wish list has them too).
    def _ql(p):
        import datetime as _dt
        try: m = _dt.datetime.strptime(p, '%b %y'); mm = m.month - 1 or 12; yy = m.year - (1 if m.month == 1 else 0)
        except Exception: return p
        return 'Q%d %s' % ((mm - 1) // 3 + 1, str(yy)[2:])
    _a = [x for x in o['fq'] if x['k'] != 'E']
    _e = [x for x in o['fq'] if x['k'] == 'E' and x.get('rev') is not None][:5] if _EST_ON else []
    o['fq'] = [[_ql(x['p']), 0, x['rev'], x['npm'], x['y']] for x in _a[-9:]] + [[_ql(x['p']), 1, x['rev'], x['npm'], x['y']] for x in _e]
    o['earn']['h'] = [[h['q'], h['d'], h['e'], h['ee'], h['eb'], h['rb'], h['rs'], h['mv'], h.get('ra'), h.get('re')] for h in o['earn']['h']]
    if 'gw' in o:
        g = o['gw']; tr = g['tr']; g['tr'] = [tr[0][0], tr[-1][0], [v for _, v in tr]]
        g['note'] = ' '.join(re.split(r'(?<=[.])\s+', g['note'])[:2])
d['RK'] = RK

def first(s,n=120):
    if not s: return ''
    s=re.split(r'(?<=[.])\s+',s)[0]
    return s if len(s)<=n else s[:n].rsplit(' ',1)[0]+'…'
I=lambda v: None if v is None else int(round(v))
def sig(v):
    if v is None: return None
    a=abs(v)
    if a>=1000: return int(round(v,-int(len(str(int(a)))-3)))
    if a>=10: return int(round(v))
    return round(v,1)
E2=lambda v: None if v is None else round(v,2)
rows=[]
for o in d['stocks']:
    T=o['tech'];R=o['ret'];E=o['earn'];M=o['mg'];V=o['val']
    risk=None
    if 'risk' in o:
        r=o['risk']['r']; top=sorted(range(len(r)),key=lambda i:-(r[i][1] or 0))[:2]
        risk=[first(o['risk']['sum'],170) if o['risk']['sum'] else 0, o['risk']['top'], [[x[0],x[1],x[2],first(x[3],110) if i in top else 0] for i,x in enumerate(r)]]
    gw=None
    if 'gw' in o:
        g=o['gw']; gw=[g['s'],g['f'],I(g['gia']),I(g['g4']),g['new'] or 0,g['imp'] or 0,first(g['note'],170),g['tr'][0],g['tr'][1],[sig(v) for v in g['tr'][2]]]
    rows.append([o['t'],o['n'],o['th'],o['sec'],E2(o['beta']),
      [I(T['off']),I(T['up']),I(T['v50']),I(T['v200']),I(T['x']),T['rsi'],T.get('pos')],
      [I(R['r1m']),I(R['r3m']),I(R['r6m']),I(R['rytd']),I(R['r1y']),I(R['vq'])],
      [E['l4'],E['l8'],E['last'],E['streak'],E['div'],E['mt'],E['rt'],E['et'],[I(v) for v in (E['yoy'] or [])],E['prof4'],E['next'],
       [[h[0],h[1],E2(h[2]),E2(h[3]),h[4],h[5],I(h[6]),I(h[7]),h[8],h[9]] for h in E['h']],E.get('rl4'),E.get('rl8'),E.get('x') or 0],
      [[f[0],f[1],sig(f[2]),I(f[3]),I(f[4])] for f in o['fq']],
      [I(M['gross']),I(M['op']),I(M['net']),I(M['fcf'])],[E2(V['fpe']) if V['fpe'] is None else round(V['fpe'],1),None if V['ps'] is None else round(V['ps'],1),V['peg']],
      I(o['rg']),gw,risk,[1 if o['run']['p'] else 0,o['run']['m']] if o.get('run') else 0,
      [o['P'][k] for k in 'megpb'],o['ws']])

json.dump(rows, open('/home/claude/tw2/work/rows.json','w'), separators=(',',':'), ensure_ascii=False)
json.dump({'asof': d['asof'], 'sectors': d['sectors'], 'RK': d['RK']}, open('/home/claude/tw2/work/meta.json','w'), separators=(',',':'))
print(len(rows))
