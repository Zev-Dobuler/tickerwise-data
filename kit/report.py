import json, os, glob
P='/home/claude/tw2/page/'; O='/home/claude/tw2/prev/'
idx=open(P+'index.html').read()
stub = r"""(function(){var D=null;function src(){if(D)return D;try{if(window.parent&&window.parent!==window&&window.parent.__TWD)D=window.parent.__TWD}catch(e){}if(!D&&window.__TWD)D=window.__TWD;return D||{}}
var calcs={},memo={},cbs=[];var S=function(v){return v};
window.dash={colors:['#2F6BFF','#FF8A00','#00B86B','#7C4DFF','#F0324F','#00B3C7'],loader:function(){},calc:function(id,o){calcs[id]=o},refresh:function(){},params:function(){return {}},setParams:function(){},resetParams:function(){},setLink:function(){},
data:function(id){if(calcs[id]){if(!memo[id]){var o=calcs[id];try{memo[id]={status:'ok',data:o.fn.apply(null,o.inputs.map(function(i){return dash.data(i).data}))}}catch(e){memo[id]={status:'error',data:[],message:e.message}}}return memo[id]}
var d=src()[id];if(id==='quotes'&&!(d&&d.length)){var u=(src().updates||[]).map(function(r){return r.at}).sort().pop()||new Date().toISOString();d=[{ticker:'SPY',name:'SPDR S&P 500 ETF',price:1,prev_close:1,high_52w:1,low_52w:1,ma50:1,ma200:1,rsi14:50,as_of:u}]}if(d===undefined)return {status:'ok',data:[]};
if(Array.isArray(d))d=d.map(function(r){if(r&&typeof r==='object'&&!Array.isArray(r)){var o={};for(var k in r){var v=r[k];o[k]=(v&&typeof v==='object')?JSON.stringify(v):v}return o}return r});
return {status:'ok',data:d}},
onData:function(cb){cbs.push(cb);setTimeout(cb,0)}};})();"""
theme = """:root{--hs-boxh:64px;--color-panel:#fff;--color-bg:#F7F9FC;--color-fg:#0B1B3F;--color-fg-muted:#64748B;--color-border-line:#E5EAF3;--cds-font-size-body:14px;--cds-font-size-caption:12.5px;--cds-font-size-title:26px;--cds-gap-lg:16px;--cds-font-weight-medium:600;--font-anthropic-sans:Inter,system-ui,sans-serif;--font-anthropic-serif:'Space Grotesk',Inter,sans-serif}
html,body{margin:0;background:#F7F9FC;color:#0B1B3F;font-family:Inter,system-ui,sans-serif}body{padding:18px 18px 60px}
"""
html = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
 '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">'
 '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script><style>'+theme+'</style><link rel="stylesheet" href="report.css"><script>'+stub+'</script></head><body><div id="dash-root">'+idx+'</div><script src="report-tw.js"></script></body></html>')
# inline version (used inside the private bundle; loaded with iframe srcdoc)
def inl(h):
    for f in ['bet.js','x.js','m.js','crashes.js','report-tw.js']:
        tag='<script src="%s"></script>'%f
        if tag in h: h=h.replace(tag,'<script>'+open(O+f).read().replace('</script','<\\/script')+'</script>')
    return h.replace('<link rel="stylesheet" href="report.css">','<style>'+open(O+'report.css').read()+'</style>')
open(O+'report_inline.html','w').write(inl(html))
open(O+'report.html','w').write(html)
for f in ['m.js','x.js','bet.js','crashes.js']: open(O+f,'w').write(open(P+f).read())
print(len(html))
