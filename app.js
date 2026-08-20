/* 우리동네 이야기 — app.js (데이터: window.__URI__) */
var D = window.__URI__;
var APP = document.getElementById('app');

/* ---------- 포맷 ---------- */
function fmtWon(v){ // 원 → 조/억
  if (v == null || isNaN(v)) return '—';
  var neg = v < 0 ? '-' : ''; v = Math.abs(v);
  if (v >= 1e12) return neg + (v/1e12).toFixed(v>=1e13?1:2).replace(/\.0+$/,'') + '조원';
  if (v >= 1e8)  return neg + Math.round(v/1e8).toLocaleString() + '억원';
  if (v >= 1e4)  return neg + Math.round(v/1e4).toLocaleString() + '만원';
  return neg + v.toLocaleString() + '원';
}
function fmtManFromChun(chun){ // 천원 → 만원
  if (chun == null) return '—';
  return (chun/10).toLocaleString(undefined,{maximumFractionDigits:0}) + '만원';
}
function pct(v, d){ return (v==null||isNaN(v)) ? '—' : v.toFixed(d==null?1:d) + '%'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function partyTag(p){
  var cls = p==='더불어민주당' ? 'dem' : (p==='국민의힘' ? 'ppp' : '');
  return '<span class="tag '+cls+'">'+esc(p)+'</span>';
}
var SIDO_FULL = {서울:'서울특별시',부산:'부산광역시',대구:'대구광역시',인천:'인천광역시',광주:'광주 (전남광주통합특별시)',대전:'대전광역시',울산:'울산광역시',세종:'세종특별자치시',경기:'경기도',강원:'강원특별자치도',충북:'충청북도',충남:'충청남도',전북:'전북특별자치도',전남:'전남 (전남광주통합특별시)',경북:'경상북도',경남:'경상남도',제주:'제주특별자치도'};

/* ---------- SVG 차트 ---------- */
function barLine(series, opts){ // series: [{x, v}], opts {h, color, fmt}
  opts = opts || {};
  var h = opts.h || 150, w = 560, padL = 8, padB = 22, padT = 18;
  var vals = series.map(function(s){return s.v;}).filter(function(v){return v!=null;});
  if (!vals.length) return '<div class="muted">데이터가 없어요.</div>';
  var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
  var lo = opts.zero ? 0 : min * 0.9;
  var bw = (w - padL*2) / series.length;
  var color = opts.color || 'var(--accent)';
  var out = '<svg class="chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(opts.label||'차트')+'">';
  out += '<line x1="'+padL+'" y1="'+(h-padB)+'" x2="'+(w-padL)+'" y2="'+(h-padB)+'" stroke="var(--rule)" stroke-width="1"/>';
  series.forEach(function(s, i){
    if (s.v == null) return;
    var bh = (s.v - lo) / (max - lo || 1) * (h - padB - padT);
    var x = padL + i*bw + bw*0.18, y = h - padB - bh;
    out += '<rect x="'+x+'" y="'+y+'" width="'+(bw*0.64)+'" height="'+Math.max(bh,1.5)+'" fill="'+color+'" opacity="'+(i===series.length-1?1:0.45)+'" rx="1.5"><title>'+esc(s.x)+': '+esc(opts.fmt?opts.fmt(s.v):s.v)+'</title></rect>';
    if (series.length <= 14 || i%2===0 || i===series.length-1)
      out += '<text x="'+(padL+i*bw+bw/2)+'" y="'+(h-6)+'" font-size="10.5" fill="var(--ink3)" text-anchor="middle">'+esc(/^\d{4}$/.test(String(s.x)) ? String(s.x).slice(2)+"'" : String(s.x))+'</text>';
    if (i===series.length-1 || i===0 || s.v===max){
      var lx = Math.min(Math.max(padL+i*bw+bw/2, 30), w-30);
      out += '<text x="'+lx+'" y="'+(y-5)+'" font-size="10.5" font-weight="700" fill="var(--ink)" text-anchor="middle">'+esc(opts.fmt?opts.fmt(s.v):s.v)+'</text>';
    }
  });
  out += '</svg>';
  return out;
}
function lineChart(series, opts){ // [{x,v}]
  opts = opts || {};
  var h = opts.h || 130, w = 560, padL = 36, padR = 36, padB = 20, padT = 16;
  var pts = series.filter(function(s){return s.v!=null;});
  if (pts.length < 2) return '<div class="muted">데이터가 없어요.</div>';
  var vals = pts.map(function(s){return s.v;});
  var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
  var span = (max-min) || 1;
  var xw = (w-padL-padR) / (series.length-1);
  function X(i){ return padL + i*xw; }
  function Y(v){ return padT + (1 - (v-min)/span) * (h-padT-padB); }
  var d = '';
  series.forEach(function(s,i){ if (s.v==null) return; d += (d?' L':'M') + X(i).toFixed(1) + ' ' + Y(s.v).toFixed(1); });
  var out = '<svg class="chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(opts.label||'추이')+'">';
  out += '<path d="'+d+'" fill="none" stroke="'+(opts.color||'var(--accent)')+'" stroke-width="2.5"/>';
  series.forEach(function(s,i){
    if (s.v==null) return;
    out += '<circle cx="'+X(i)+'" cy="'+Y(s.v)+'" r="3.5" fill="'+(opts.color||'var(--accent)')+'"><title>'+esc(s.x)+': '+esc(opts.fmt?opts.fmt(s.v):s.v)+'</title></circle>';
    out += '<text x="'+X(i)+'" y="'+(h-4)+'" font-size="10.5" fill="var(--ink3)" text-anchor="middle">'+esc(s.x)+'</text>';
    out += '<text x="'+X(i)+'" y="'+(Y(s.v)-8)+'" font-size="10.5" font-weight="700" fill="var(--ink)" text-anchor="middle">'+esc(opts.fmt?opts.fmt(s.v):s.v)+'</text>';
  });
  out += '</svg>';
  return out;
}
function stackBar(items, total, colors){ // [{nm, amt}]
  var out = '<div class="bar" role="img" aria-label="구성비">';
  items.forEach(function(it, i){
    var p = total ? (it.amt/total*100) : 0;
    if (p < 0.4) return;
    out += '<i style="width:'+p.toFixed(2)+'%; background:'+colors[i%colors.length]+'" title="'+esc(it.nm)+' '+p.toFixed(1)+'%"></i>';
  });
  out += '</div>';
  return out;
}
var SRC_COLORS = ['#2456E8','#0F9D6B','#F0A828','#8B5CF6','#EC4899','#14B8A6','#F97316','#64748B'];

/* ---------- 순위(동급 비교) ---------- */
function sidoRank(metric){ // metric: sk -> value. returns {rank map, n}
  var arr = [];
  Object.keys(D.sido).forEach(function(sk){ var v = metric(D.sido[sk], sk); if (v!=null && !isNaN(v)) arr.push([sk, v]); });
  arr.sort(function(a,b){ return b[1]-a[1]; });
  var m = {}; arr.forEach(function(x,i){ m[x[0]] = i+1; });
  return {m:m, n:arr.length};
}

/* ---------- 홈 ---------- */
function fmtN(n){ return (n==null||isNaN(n))?'—':Number(n).toLocaleString(); }
function guLink(key){
  var sido=key.split('|')[0], nm=key.split('|')[1];
  var cd=Object.keys(D.basic).filter(function(c){return D.basic[c].sido===sido&&D.basic[c].name===nm;})[0];
  return cd? '<a class="lk" style="color:var(--accent)" href="#/gu/'+cd+'">'+esc(sido+' '+nm)+'</a>' : esc(sido+' '+nm);
}
function fullNm(b){
  if (!b) return '';
  if (b.sido && b.name) return b.sido+' '+b.name;
  return b.full||'';
}
function iga(w){
  w = String(w).replace(/\(.*?\)\s*$/,'').trim();
  var ch = w.charCodeAt(w.length-1);
  if (ch>=0xAC00 && ch<=0xD7A3) return ((ch-0xAC00)%28)?'이':'가';
  return '가';
}
function kpiCard(tag, num, tone, lab, href){
  var c = tone==='neg'?'var(--neg)':(tone==='pos'?'var(--pos)':'var(--accent)');
  var h = '<'+(href?'a href="'+href+'"':'div')+' class="kpi">';
  h += '<div class="ktag">'+esc(tag)+'</div>';
  h += '<div class="knum" style="color:'+c+'">'+num+'</div>';
  h += '<div class="klab">'+lab+'</div>';
  h += '</'+(href?'a':'div')+'>';
  return h;
}
function insightCard(tag, head, body, href, tone){
  var c = tone==='neg'?'var(--neg)':(tone==='pos'?'var(--pos)':'var(--accent)');
  var h = '<'+(href?'a href="'+href+'"':'div')+' class="rule-card icard" style="display:block; border-top:2px solid '+c+'">';
  h += '<div class="muted itag">'+esc(tag)+'</div>';
  h += '<div class="ihead">'+head+'</div>';
  h += '<div class="muted ibody">'+body+'</div>';
  h += '</'+(href?'a':'div')+'>';
  return h;
}
function avatar(gov, size){
  var sz = size||44;
  if (gov.photo) return '<img class="ava" src="'+esc(gov.photo)+'" alt="'+esc(gov.name)+' 사진" width="'+sz+'" height="'+sz+'" loading="lazy" style="width:'+sz+'px; height:'+sz+'px">';
  return '<span class="ava noimg" style="width:'+sz+'px; height:'+sz+'px; font-size:'+Math.round(sz*0.42)+'px" aria-hidden="true">'+esc(gov.name.charAt(0))+'</span>';
}
function sparkline(vals, w, h, color){
  var v=vals.filter(function(x){return x!=null;});
  if (v.length<2) return '';
  var mn=Math.min.apply(null,v), mx=Math.max.apply(null,v), sp=(mx-mn)||1;
  var d='', n=vals.length;
  vals.forEach(function(x,k){ if(x==null) return;
    var px=(k/(n-1))*(w-2)+1, py=h-1-((x-mn)/sp)*(h-3);
    d+=(d?'L':'M')+px.toFixed(1)+' '+py.toFixed(1);
  });
  var last=vals[vals.length-1], lx=w-1, ly=h-1-((last-mn)/sp)*(h-3);
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true" style="vertical-align:middle"><path d="'+d+'" fill="none" stroke="'+(color||'var(--accent)')+'" stroke-width="1.6"/><circle cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" r="2" fill="'+(color||'var(--accent)')+'"/></svg>';
}
function gauge(pctv, color){
  var p=Math.max(0,Math.min(100,pctv||0));
  return '<div class="bar" style="height:6px; margin-top:4px"><i style="width:'+p.toFixed(1)+'%; background:'+(color||'var(--accent)')+'"></i></div>';
}
function miniMap(){
  if (!window.__MAP__) return '';
  var M=window.__MAP__, idx=buildMapIdx();
  var out='<svg id="homeMap" viewBox="'+M.vb.join(' ')+'" role="img" aria-label="전국 세금 성적표 지도" style="width:100%; height:100%; flex:1; min-height:0; display:block">';
  out+='<g id="hmFill">';
  idx.forEach(function(x,k){
    var g=x.b&&x.b.report&&x.b.report.grade;
    var off = HOME_GRADE && g!==HOME_GRADE;
    var f = off ? '#9A958D' : (g?GRADE_FILL[g]:'#C4BFB8');
    var op = off ? 0.3 : (g?0.95:0.45);
    out+='<path class="mn" data-i="'+k+'" d="'+x.u.d+'" fill="'+f+'" opacity="'+op+'"'+(off?'':' stroke-width="0.8"')+'></path>';
  });
  out+='</g><g>';
  M.sido.forEach(function(s2){ out+='<path class="sd" d="'+s2.d+'"></path>'; });
  out+='</g><g id="hmLbS">';
  M.sido.forEach(function(s2){ out+='<text x="'+s2.lb[0]+'" y="'+s2.lb[1]+'" text-anchor="middle">'+esc(s2.s)+'</text>'; });
  out+='</g><g id="hmLbM"></g></svg>';
  return out;
}
var HOME_GRADE = null, HOME_VB = null;
function bindHomeMap(){
  var svg = document.getElementById('homeMap'); if (!svg || !window.__MAP__) return;
  var idx = buildMapIdx();
  var VB0 = window.__MAP__.vb.slice();
  var cur = (HOME_VB && HOME_VB.length===4) ? HOME_VB.slice() : VB0.slice();
  var lbS = svg.querySelector('#hmLbS'), lbM = svg.querySelector('#hmLbM');
  function setVB(vb){
    cur = vb; HOME_VB = vb.slice();
    svg.setAttribute('viewBox', vb.join(' '));
    var w = svg.clientWidth || 460;
    var u = vb[2] / w, k = vb[2] / VB0[2];
    if (lbS) lbS.querySelectorAll('text').forEach(function(t){
      t.style.fontSize = (13*u).toFixed(4);
      t.style.strokeWidth = (2.6*u).toFixed(4);
      t.style.opacity = k < 0.25 ? 0 : Math.min(1, (k-0.12)*2);
    });
    if (lbM){
      var frag = '';
      if (k < 0.55) idx.forEach(function(x){
        var wpx = x.u.bb[2] / u;
        if (wpx < 52) return;
        if (x.u.lb[0] < vb[0] || x.u.lb[0] > vb[0]+vb[2] || x.u.lb[1] < vb[1] || x.u.lb[1] > vb[1]+vb[3]) return;
        var g = x.b && x.b.report && x.b.report.grade;
        frag += '<text x="'+x.u.lb[0]+'" y="'+x.u.lb[1]+'" text-anchor="middle" style="font-size:'+(10.5*u).toFixed(4)+'; stroke-width:'+(2*u).toFixed(4)+'; font-weight:600">'+esc(x.u.n)+'</text>';
      });
      lbM.innerHTML = frag;
    }
  }
  function zoom(f, cx, cy){
    var nw = cur[2]*f;
    if (nw < VB0[2]*0.04 || nw > VB0[2]*1.2) return;
    var nh = cur[3]*f;
    if (cx==null){ cx = cur[0]+cur[2]/2; cy = cur[1]+cur[3]/2; setVB([cx-nw/2, cy-nh/2, nw, nh]); return; }
    setVB([cx-(cx-cur[0])*f, cy-(cy-cur[1])*f, nw, nh]);
  }
  svg.addEventListener('wheel', function(e){
    e.preventDefault();
    var r = svg.getBoundingClientRect();
    var mx = cur[0] + (e.clientX-r.left)/r.width*cur[2];
    var my = cur[1] + (e.clientY-r.top)/r.height*cur[3];
    zoom(e.deltaY>0 ? 1.18 : 1/1.18, mx, my);
  }, {passive:false});
  var drag = null;
  svg.addEventListener('pointerdown', function(e){
    drag = {x:e.clientX, y:e.clientY, vb:cur.slice(), target:e.target.closest&&e.target.closest('path.mn'), moved:false, id:e.pointerId};
  });
  svg.addEventListener('pointermove', function(e){
    if (!drag) return;
    var dx=e.clientX-drag.x, dy=e.clientY-drag.y;
    if (!drag.moved && Math.hypot(dx,dy) > 4){ drag.moved=true; try{ svg.setPointerCapture(drag.id); }catch(err){} svg.style.cursor='grabbing'; }
    if (drag.moved){
      var u = drag.vb[2]/(svg.clientWidth||460);
      setVB([drag.vb[0]-dx*u, drag.vb[1]-dy*u, drag.vb[2], drag.vb[3]]);
    }
  });
  svg.addEventListener('pointerup', function(){
    if (drag && !drag.moved && drag.target){
      var x = idx[+drag.target.dataset.i];
      location.hash = x.cd ? '#/gu/'+x.cd : '#/sido/'+x.govKey;
    }
    svg.style.cursor='pointer'; drag=null;
  });
  svg.addEventListener('pointercancel', function(){ drag=null; svg.style.cursor='pointer'; });
  svg.addEventListener('keydown', function(e){
    if (e.key!=='Enter' && e.key!==' ') return;
    var p=e.target.closest&&e.target.closest('path.mn'); if(!p) return;
    e.preventDefault();
    var x=idx[+p.dataset.i];
    location.hash = x.cd ? '#/gu/'+x.cd : '#/sido/'+x.govKey;
  });
  var zb = document.getElementById('hmZoom');
  if (zb) zb.addEventListener('click', function(e){
    var b=e.target.closest('button'); if(!b) return;
    e.preventDefault();
    if (b.dataset.hz==='in') zoom(1/1.4);
    else if (b.dataset.hz==='out') zoom(1.4);
    else { HOME_VB=null; setVB(VB0.slice()); }
  });
  requestAnimationFrame(function(){ setVB(cur.slice()); });
}
function expandGrade(btn){
  var box = btn.parentNode;
  var rows = box.querySelectorAll('.lbmore');
  for (var i=0;i<rows.length;i++) rows[i].className = rows[i].className.replace(' lbmore','');
  box.className += ' expanded';
  btn.parentNode.removeChild(btn);
}
function setHomeGrade(g){ HOME_GRADE = (HOME_GRADE===g)? null : g; renderHome(); var el=document.getElementById('gradeBox'); if (el) el.scrollIntoView({block:'start'}); }
function fillSidoBiz(N){
  var agg = {};
  Object.keys(N.units).forEach(function(k){
    var sd = k.split('|')[0], f = N.units[k].cats['일반음식점'];
    if (!f) return;
    var a = agg[sd] || (agg[sd] = {open:0, o:0, x:0});
    a.open += f.open; a.o += (+f.ob['2025']||0); a.x += (+f.cb['2025']||0);
  });
  var els = document.querySelectorAll('.bizmini');
  for (var i=0;i<els.length;i++){
    var el = els[i];
    var keys = (el.getAttribute('data-sido')||'').split(',');
    var t = {open:0,o:0,x:0};
    keys.forEach(function(kk){ var a=agg[kk]; if(a){ t.open+=a.open; t.o+=a.o; t.x+=a.x; } });
    if (!t.open){ el.innerHTML=''; continue; }
    var net = t.o - t.x, mx = Math.max(t.o, t.x) || 1;
    var h2 = '<div class="bizhead"><span>🍽️ 음식점</span><b class="tn">'+fmtN(t.open)+'곳</b></div>';
    var tot = t.o + t.x || 1;
    h2 += '<div class="duobar" title="2025년 개업 '+fmtN(t.o)+'곳 · 폐업 '+fmtN(t.x)+'곳">';
    h2 += '<i class="op" style="width:'+(t.o/tot*100).toFixed(1)+'%"></i><i class="cl" style="width:'+(t.x/tot*100).toFixed(1)+'%"></i></div>';
    h2 += '<div class="duokey"><span class="pos">개업 '+fmtN(t.o)+'</span><b class="'+(net>=0?'pos':'neg')+'">'+(net>0?'▲ +':'▼ ')+fmtN(net)+'</b><span class="neg">폐업 '+fmtN(t.x)+'</span></div>';
    h2 += '<div class="hotrow brandrow"><span>🔥 뜨는 업종</span><b>—</b></div>';
    el.innerHTML = h2;
  }
  var natC = catAggScope(N, null);
  var rows2 = document.querySelectorAll('.bizmini .brandrow');
  for (var j=0;j<rows2.length;j++){
    var row = rows2[j];
    var keys2 = (row.parentNode.getAttribute('data-sido')||'').split(',');
    var locC = catAggScope(N, function(k){ return keys2.indexOf(k.split('|')[0])>=0; });
    var best=null;
    Object.keys(locC).forEach(function(c){
      var lo=locC[c], nr=natC[c];
      if (!nr || lo.open < 120) return;
      var d = lo.rate - nr.rate;
      if (!best || d > best.d) best = {c:c, d:d, rate:lo.rate};
    });
    var bEl = row.getElementsByTagName('b')[0];
    if (bEl) bEl.innerHTML = best ? catEmo(best.c)+' '+esc(best.c)+' <span class="pos">+'+best.d.toFixed(1)+'%p</span>' : '—';
  }
}
function renderHome(){
  document.title = '우리동네 이야기 — 세금·예산·상권·안전 공공데이터 리포트';
  var B = Object.keys(D.basic).map(function(cd){ return Object.assign({cd:cd}, D.basic[cd]); });
  var withRep = B.filter(function(b){ return b.report && b.report.grade; });
  var dist = {A:0,B:0,C:0,D:0}; withRep.forEach(function(b){ dist[b.report.grade]++; });
  var pledgeN = D.govs.reduce(function(a,g){ return a+((g.pledges||[]).length); }, 0);
  var pcats = {}; D.govs.forEach(function(g){ (g.pledges||[]).forEach(function(p){ pcats[p.cat]=(pcats[p.cat]||0)+1; }); });
  var h = '';

  /* 1. 히어로 */
  h += '<section class="hero">';
  h += '<h1>내 동네, 숫자로 보면<br>어떤 곳일까요?</h1>';
  h += '<p class="lead">세금은 잘 걷히고 있는지, 우리 지역 단체장은 무얼 약속했는지, 가게는 늘고 있는지 줄고 있는지. 전국 '+fmtN(withRep.length)+'개 시·군·구를 같은 잣대로 비교해 드려요.</p>';
  h += '<div class="searchbox"><span class="ico">🔍</span><input id="q" placeholder="우리 동네 이름을 넣어보세요 (예: 수원시, 마포구)" autocomplete="off" aria-label="지역 검색"><div class="suggest" id="sg" hidden role="listbox" aria-live="polite" aria-label="검색 제안"></div></div>';
  h += '<div class="quick"><a href="#/tax">📊 우리 동네 세금 등급</a><a href="#/spot">🏪 이 자리엔 뭐가 있었지?</a><a href="#/brand">🏷️ 우리 동네 1등 브랜드</a><a href="#/compare">⚖️ 두 지역 비교</a></div>';
  h += '</section>';

  /* 2. 데이터 인사이트 (지도 위) */
  var byCh = withRep.filter(function(b){return b.report.chRatio!=null;}).sort(function(a,b){return a.report.chRatio-b.report.chRatio;});
  var byG = withRep.filter(function(b){return b.report.growth!=null;}).sort(function(a,b){return b.report.growth-a.report.growth;});
  var wp = B.filter(function(b){return b.pcSeries&&b.pcSeries[2014]&&b.pcSeries[2026];}).map(function(b){ b.dp=(b.pcSeries[2026].pop/b.pcSeries[2014].pop-1)*100; return b; });
  var pu = wp.slice().sort(function(a,b){return b.dp-a.dp;}), pd2 = wp.slice().sort(function(a,b){return a.dp-b.dp;});
  var S = Object.keys(D.sido).map(function(k){ return Object.assign({k:k}, D.sido[k]); });
  var festa = S.filter(function(s){return s.wallet&&s.wallet.festa;}).sort(function(a,b){return b.wallet.festa.rt-a.wallet.festa.rt;});
  var trip = S.filter(function(s){return s.wallet&&s.wallet.trip&&s.wallet.trip.prev22;}).map(function(s){ return {k:s.k, d:(s.wallet.trip.amt/s.wallet.trip.prev22.amt-1)*100, amt:s.wallet.trip.amt}; }).sort(function(a,b){return b.d-a.d;});
  var cdOf = function(b){ return '#/gu/'+b.cd; };
  var chHi = byCh[byCh.length-1];
  h += '<section><h2>데이터 인사이트</h2><div class="kpirow" id="insights">';
  h += kpiCard('인구', '+'+pu[0].dp.toFixed(0)+'%', 'pos', '<b>'+esc(pu[0].name)+'</b> 12년 인구 증가 · 전국 1위', cdOf(pu[0]));
  h += kpiCard('세금 체납', (chHi.report.chRatio/byCh[0].report.chRatio).toFixed(0)+'배', 'neg', '<b>'+esc(byCh[0].name)+'</b> '+byCh[0].report.chRatio.toFixed(2)+'% vs <b>'+esc(chHi.name)+'</b> '+chHi.report.chRatio.toFixed(1)+'%', cdOf(chHi));
  h += kpiCard('단체장의 지갑', '+'+trip[0].d.toFixed(0)+'%', 'neg', '<b>'+esc(trip[0].k)+'</b> 국외여비 4년 증가 · 2026 편성', '#/sido/'+(trip[0].k==='광주'||trip[0].k==='전남'?'전남광주':trip[0].k));
  h += '<div class="kpi kload" id="kNet"><div class="ktag">상권</div><div class="knum">·</div><div class="klab muted">불러오는 중</div></div>';
  h += '<div class="kpi kload" id="kUp"><div class="ktag">업종</div><div class="knum">·</div><div class="klab muted">불러오는 중</div></div>';
  h += '<div class="kpi kload" id="kDn"><div class="ktag">업종</div><div class="knum">·</div><div class="klab muted">불러오는 중</div></div>';
  h += '</div></section>';

  /* 3. 세금 성적표 + 지도 */
  var GMEAN = {A:'재정이 튼튼해요', B:'무난한 편이에요', C:'조금 아쉬워요', D:'도움이 필요해요'};
  h += '<section id="gradeBox"><div class="sechead"><div><h2><span class="emo">📊</span>우리 동네 세금 성적표</h2><p class="lead" style="font-size:14.5px">재정자립도 · 체납 · 세수 성장, 세 가지를 같은 유형끼리 비교해 등급을 매겼어요. 등급을 누르면 그 동네만 골라 볼 수 있어요.</p></div><a class="footnote-btn" href="#/tax">큰 지도로 보기 →</a></div>';
  h += '<div class="taxrow">';
  h += '<div class="rule-card taxleft">';
  h += '<div class="gdhead"><span>등급 분포</span><b class="tn">'+fmtN(withRep.length)+'곳</b></div>';
  h += '<div class="gdbar" role="group" aria-label="등급 분포">';
  ['A','B','C','D'].forEach(function(g){
    var pv = dist[g]/withRep.length*100, on = HOME_GRADE===g, dim = HOME_GRADE && !on;
    h += '<button class="gseg'+(on?' on':'')+(dim?' dim':'')+'" style="width:'+pv.toFixed(2)+'%; background:'+GRADE_FILL[g]+'" onclick="setHomeGrade(\''+(on?'':g)+'\')" aria-pressed="'+(on?'true':'false')+'" aria-label="'+g+'등급 '+dist[g]+'곳 보기"><i>'+g+'</i></button>';
  });
  h += '</div>';
  h += '<div class="glegend">';
  ['A','B','C','D'].forEach(function(g){
    var pv = dist[g]/withRep.length*100, on = HOME_GRADE===g;
    h += '<button class="gitem'+(on?' on':'')+'" style="--gc:'+GRADE_FILL[g]+'" onclick="setHomeGrade(\''+(on?'':g)+'\')" aria-pressed="'+(on?'true':'false')+'">';
    h += '<b class="gl">'+g+'</b>';
    h += '<span class="gn tn">'+dist[g]+'<i>곳</i><u>· '+pv.toFixed(0)+'%</u></span>';
    h += '<span class="gd">'+GMEAN[g]+'</span></button>';
  });
  h += '</div>';
  h += '<div class="filterlist" style="flex:1; min-height:0; overflow-y:auto; margin-top:12px">';
  if (HOME_GRADE){
    var hits = withRep.filter(function(b){ return b.report.grade===HOME_GRADE; })
      .sort(function(a,b){ return b.report.score-a.report.score; });
    h += '<div class="callout" style="padding:9px 12px; margin-bottom:10px; font-size:12.5px; display:flex; justify-content:space-between; align-items:center"><span><b style="color:'+GRADE_FILL[HOME_GRADE]+'">'+HOME_GRADE+'등급</b> '+hits.length+'곳 · 점수 높은 순</span><button class="footnote-btn" onclick="setHomeGrade(null)">전체 보기 ✕</button></div>';
    var SHOWN = 10;
    hits.forEach(function(b, ix){
      h += '<a href="#/gu/'+b.cd+'" class="lbrow'+(ix>=SHOWN?' lbmore':'')+'"><span class="lbr tn">'+(ix+1)+'</span><span class="lbn">'+esc(b.sido)+' '+esc(b.name)+'</span>';
      h += '<span class="lbb"><i style="width:'+b.report.score.toFixed(0)+'%; background:'+GRADE_FILL[HOME_GRADE]+'"></i></span>';
      h += '<b class="tn lbv">'+b.report.score.toFixed(0)+'</b></a>';
    });
    if (hits.length > SHOWN){
      h += '<button class="lbmorebtn" onclick="expandGrade(this)">나머지 '+(hits.length-SHOWN)+'곳 더보기</button>';
    }
  } else {
    var rank = withRep.slice().sort(function(a,b){ return b.report.score-a.report.score; });
    h += '<div class="lbhead"><span class="lbdot" style="background:'+GRADE_FILL.A+'"></span>잘 걷고 잘 버티는 곳<em>상위 4</em></div>';
    rank.slice(0,4).forEach(function(b,ix){
      h += '<a href="#/gu/'+b.cd+'" class="lbrow"><span class="lbr">'+(ix+1)+'</span><span class="lbn">'+esc(b.sido)+' '+esc(b.name)+'</span>';
      h += '<span class="lbb"><i style="width:'+b.report.score.toFixed(0)+'%; background:'+GRADE_FILL[b.report.grade]+'"></i></span>';
      h += '<b class="tn lbv">'+b.report.score.toFixed(0)+'</b></a>';
    });
    h += '<div class="lbhead" style="margin-top:14px"><span class="lbdot" style="background:'+GRADE_FILL.D+'"></span>도움이 가장 필요한 곳<em>하위 4</em></div>';
    rank.slice(-4).reverse().forEach(function(b){
      h += '<a href="#/gu/'+b.cd+'" class="lbrow"><span class="lbr">·</span><span class="lbn">'+esc(b.sido)+' '+esc(b.name)+'</span>';
      h += '<span class="lbb"><i style="width:'+Math.max(b.report.score,2).toFixed(0)+'%; background:'+GRADE_FILL[b.report.grade]+'"></i></span>';
      h += '<b class="tn lbv">'+b.report.score.toFixed(0)+'</b></a>';
    });
  }
  h += '</div>';
  h += '<button class="footnote-btn" style="margin-top:10px; align-self:flex-start" onclick="var e=document.getElementById(\'gnote\'); e.hidden=!e.hidden">❓ 등급은 어떻게 매기나요</button>';
  h += '<div class="fine" id="gnote" hidden>'+esc(D.meta.notes.grade)+'</div>';
  h += '</div>';
  h += '<div class="rule-card taxright"><div class="maptop"><span class="map-jump" id="hmZoom"><button data-hz="in" aria-label="지도 확대">+</button><button data-hz="out" aria-label="지도 축소">−</button><button data-hz="reset" aria-label="전체 보기">전국</button></span><span class="muted" style="font-size:12px">'+(HOME_GRADE?'<b style="color:'+GRADE_FILL[HOME_GRADE]+'">'+HOME_GRADE+'등급</b>만 표시 중':'지도를 누르면 그 동네로 가요')+'</span></div>'+miniMap()+'</div>';
  h += '</div></section>';

  /* 5+6. 민선 9기 광역 16곳 (공약 구성 + 카드) */
  var order = ['강원','경기','경남','경북','대구','대전','부산','서울','세종','울산','인천','전남광주','전북','제주','충남','충북'];
  var pcTot = Object.keys(pcats).reduce(function(a,k){return a+pcats[k];},0);
  var PC_ORDER = ['경제일자리','행정안전','복지돌봄','교통인프라','주거부동산','환경문화'];
  h += '<section><div class="sechead"><div><h2><span class="emo">🏛️</span>우리지역 공약과 경제생활</h2><p class="lead" style="font-size:14.5px">우리 시·도지사가 무얼 약속했고, 동네 가게는 늘고 있는지 한 장에 담았어요. 카드를 누르면 공약 전문과 출처가 나와요.</p></div></div>';
  h += '<div class="rule-card" style="margin-bottom:12px"><div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px"><b style="font-size:14px">📋 16개 시·도가 약속한 것 <span class="muted" style="font-weight:500">공약 '+pledgeN+'건</span></b><span class="muted tn" style="font-size:12px">막대를 보면 어느 분야에 힘을 실었는지 보여요</span></div>';
  h += '<div class="bar" style="height:18px; margin-top:8px">';
  PC_ORDER.forEach(function(k,i2){ if(!pcats[k]) return; h += '<i style="width:'+(pcats[k]/pcTot*100).toFixed(1)+'%; background:'+SRC_COLORS[i2%SRC_COLORS.length]+'" title="'+k+' '+pcats[k]+'건"></i>'; });
  h += '</div><div class="legend-g tn" style="margin-top:7px">';
  PC_ORDER.forEach(function(k,i2){ if(!pcats[k]) return; h += '<span><i style="background:'+SRC_COLORS[i2%SRC_COLORS.length]+'"></i>'+esc(k)+' '+pcats[k]+'건</span>'; });
  h += '<span class="muted" style="margin-left:auto">경제·일자리가 '+Math.round((pcats['경제일자리']||0)/pcTot*100)+'%로 최다</span></div></div>';
  var jarAll = order.map(function(k){ var g=D.govs.filter(function(x){return x.key===k;})[0]; if(!g) return null;
    var s0=D.sido[(g.lofinKeys||[k])[0]]; return s0&&s0.jarip[2025]?(s0.jarip[2025].r2!=null?s0.jarip[2025].r2:s0.jarip[2025].r1):null; }).filter(function(x){return x!=null;});
  var jarMax = Math.max.apply(null, jarAll);
  h += '<div class="grid g4">';
  order.forEach(function(k){
    var gov = D.govs.filter(function(g){ return g.key===k; })[0]; if (!gov) return;
    var lks = gov.lofinKeys || [k];
    var s0 = D.sido[lks[0]];
    var budget = lks.reduce(function(a,lk){ return a + (D.sido[lk]&&D.sido[lk].budget26 ? D.sido[lk].budget26.total : 0); }, 0);
    var jarip = s0 && s0.jarip[2025] ? (s0.jarip[2025].r2!=null?s0.jarip[2025].r2:s0.jarip[2025].r1) : null;
    var taxSeries = [2017,2018,2019,2020,2021,2022,2023,2024].map(function(y){
      return lks.reduce(function(a,lk){ var t=D.sido[lk]&&D.sido[lk].tax?D.sido[lk].tax[y]:null; return t?a+t:a; },0) || null; });
    var t24=taxSeries[7], t19=taxSeries[2];
    var gr = (t24&&t19)? (Math.pow(t24/t19,1/5)-1)*100 : null;
    var pc26 = s0 && s0.pc && s0.pc[2026] ? s0.pc[2026].pc : null;
    var rep = s0 && s0.report;
    var pn = (gov.pledges||[]).length;
    h += '<a class="sido-card" href="#/sido/'+k+'">';
    h += '<div class="nm">'+esc(k)+(rep&&rep.grade?' <span class="gradepill" style="background:'+GRADE_FILL[rep.grade]+'">'+rep.grade+'</span>':'')+'<span class="pbadge">📋 공약 '+pn+'</span></div>';
    h += '<div class="gv">'+avatar(gov,38)+'<div><b>'+esc(gov.name)+'</b><br><span class="tag" style="font-size:11px; padding:1px 7px; margin-top:2px">'+esc(gov.party)+'</span></div></div>';
    h += '<div class="mrow"><span class="ml">자립도</span><span class="mb"><i style="width:'+(jarip/jarMax*100).toFixed(0)+'%; background:'+GRADE_FILL[(rep&&rep.grade)||'C']+'"></i></span><b class="mv tn">'+pct(jarip)+'</b></div>';
    h += '<div class="mrow"><span class="ml">지방세</span><span class="mspark">'+sparkline(taxSeries,60,16,'var(--accent)')+'</span><b class="mv tn '+(gr>=0?'pos':'neg')+'">'+(gr!=null?(gr>0?'+':'')+gr.toFixed(1)+'%':'—')+'</b></div>';
    h += '<div class="duo"><div><span class="dk">2026 예산</span><b class="dv tn">'+fmtWon(budget)+'</b></div><div><span class="dk">1인당 세금</span><b class="dv tn">'+(pc26?fmtManFromChun(pc26):'—')+'</b></div></div>';
    h += '<div class="bizmini" data-sido="'+esc(lks.join(','))+'"><div class="skel" style="height:44px"></div></div>';
    h += '</a>';
  });
  h += '</div></section>';

  /* 7. 시군구 색인 */
  h += '<section><div class="sechead"><div><h2><span class="emo">🔎</span>내 동네 바로 가기</h2><p class="lead" style="font-size:14.5px">시·도를 펼치면 우리 동네가 나와요. 이름 옆 색은 세금 성적표 등급이에요.</p></div><div class="legend-g" style="font-size:12px">'+['A','B','C','D'].map(function(g){return '<span><i style="background:'+GRADE_FILL[g]+'"></i>'+g+'</span>';}).join('')+'</div></div>';
  var sidoOrder2 = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
  sidoOrder2.forEach(function(sk2){
    var kids2 = Object.keys(D.basic).filter(function(cd){ return D.basic[cd].sido===sk2; });
    if (!kids2.length) return;
    kids2.sort(function(a,b2){ return D.basic[a].name.localeCompare(D.basic[b2].name,'ko'); });
    var cnt = {A:0,B:0,C:0,D:0};
    kids2.forEach(function(cd){ var g=D.basic[cd].report&&D.basic[cd].report.grade; if(g) cnt[g]++; });
    h += '<details class="sidoacc"><summary><b>'+esc(SIDO_FULL[sk2]||sk2)+'</b><span class="muted tn">'+kids2.length+'곳</span><span class="minidist">';
    ['A','B','C','D'].forEach(function(g){ if(cnt[g]) h += '<i style="width:'+(cnt[g]/kids2.length*100).toFixed(0)+'%; background:'+GRADE_FILL[g]+'" title="'+g+' '+cnt[g]+'곳"></i>'; });
    h += '</span></summary><div class="chiprow" style="padding:10px 2px 4px">';
    kids2.forEach(function(cd){
      var bb2 = D.basic[cd], g2 = bb2.report&&bb2.report.grade;
      h += '<a class="chip" href="#/gu/'+cd+'">'+(g2?'<span class="gdot" style="background:'+GRADE_FILL[g2]+'"></span>':'')+esc(bb2.name)+'</a>';
    });
    h += '</div></details>';
  });
  h += '<p class="muted" style="margin-top:10px; font-size:13px">세종은 기초 지자체가 없고, 제주는 행정시(제주시·서귀포시)만 있어서 시·도 페이지에서 함께 보여드려요.</p></section>';

  APP.innerHTML = h;
  bindSearch();
  /* 미니맵 클릭 */
  bindHomeMap();
  loadNation().then(function(N){
    var units = Object.keys(N.units).map(function(k){ return Object.assign({k:k}, N.units[k]); });
    var net = units.map(function(u){ var f=u.cats['일반음식점']; return f?{k:u.k, net:(+f.ob['2025']||0)-(+f.cb['2025']||0)}:null; }).filter(Boolean).sort(function(a,b){return b.net-a.net;});
    var sv = units.filter(function(u){ return u.surv && u.surv.n>=300; }).sort(function(a,b){ return b.surv.s[5]-a.surv.s[5]; });
    var o25=0,x25=0; units.forEach(function(u){ var f=u.cats['일반음식점']; if(f){ o25+=(+f.ob['2025']||0); x25+=(+f.cb['2025']||0);} });
    var ca = catAggNation(N);
    var up1 = ca[0], dn1 = ca[ca.length-1];
    var swap = function(id, html){ var el=document.getElementById(id); if(!el) return; el.outerHTML = html; };
    swap('kNet', kpiCard('상권', fmtN(x25-o25)+'곳', 'neg', '2025년 전국 음식점 <b>순감</b> · 개업 '+fmtN(o25)+' vs 폐업 '+fmtN(x25), '#/spot'));
    swap('kUp', kpiCard('뜨는 업종', '+'+up1.rate.toFixed(1)+'%', 'pos', '<b>'+catEmo(up1.c)+' '+esc(up1.c)+'</b>'+iga(up1.c)+' 가장 빨리 늘어요 · 영업 중 '+fmtN(up1.open)+'곳', '#/spot'));
    swap('kDn', kpiCard('지는 업종', dn1.rate.toFixed(1)+'%', 'neg', '<b>'+catEmo(dn1.c)+' '+esc(dn1.c)+'</b>'+iga(dn1.c)+' 가장 빨리 사라져요 · '+fmtN(dn1.open)+'곳 남음', '#/spot'));
    fillSidoBiz(N);
  }).catch(function(){});
}

function bindSearch(){
  var q = document.getElementById('q'), sg = document.getElementById('sg');
  if (!q) return;
  var items = [];
  Object.keys(D.basic).forEach(function(cd){ var b = D.basic[cd]; items.push({t:b.sido+' '+b.name, s:'세금 이야기', href:'#/gu/'+cd}); });
  Object.keys(D.seoulCommerce.byCat['일반음식점'].gu).forEach(function(gu){ items.push({t:'서울 '+gu, s:'상권 이야기', href:'#/biz/'+gu}); });
  q.addEventListener('input', function(){
    var v = q.value.trim();
    if (!v){ sg.hidden = true; return; }
    var hit = items.filter(function(it){ return it.t.indexOf(v) >= 0; }).slice(0, 12);
    sg.innerHTML = hit.map(function(it){ return '<a href="'+it.href+'"><span>'+esc(it.t)+'</span><span class="muted">'+esc(it.s)+'</span></a>'; }).join('') || '<a><span class="muted">결과가 없어요</span></a>';
    sg.hidden = false;
  });
  document.addEventListener('click', function(e){ if (!sg.contains(e.target) && e.target!==q) sg.hidden = true; });
}

/* ---------- 광역 상세 ---------- */
function renderSido(key){
  var gov = D.govs.filter(function(g){ return g.key===key; })[0];
  if (!gov){ APP.innerHTML = '<div class="skel">해당 지역을 찾지 못했어요.</div>'; return; }
  var lks = gov.lofinKeys || [key];
  document.title = gov.region + ' — 우리동네 이야기';
  var h = '<div class="crumb"><a href="#">홈</a> › 광역 › '+esc(gov.region)+' · <a href="#/tax/'+(gov.lofinKeys?gov.lofinKeys[0]:gov.key)+'" style="color:var(--accent)">지도에서 보기 →</a></div>';
  h += '<section style="margin-top:8px"><h1>'+esc(gov.region)+'</h1>';
  h += '<div class="rule-card" style="margin-top:14px; display:flex; gap:24px; flex-wrap:wrap; align-items:center">';
  h += '<div style="display:flex; gap:14px; align-items:center">'+avatar(gov,64)+'<div><div style="font-size:12.5px; color:var(--ink3)">민선 9기 단체장</div><div style="font-size:22px; font-weight:800">'+esc(gov.name)+' '+partyTag(gov.party)+'</div>';
  h += '<div class="muted tn">2026-06-03 당선 (득표 '+pct(gov.vote,1)+') · 2026-07-01 취임'+(gov.note?' · '+esc(gov.note):'')+'</div></div></div>';
  h += '<div style="margin-left:auto; max-width:380px" class="muted">'+esc(D.meta.notes.budgetAuthor)+'</div>';
  h += '</div></section>';
  if (lks.length > 1){
    h += '<div class="rule-card" style="border-left:3px solid var(--accent)"><b>통합 안내</b> — '+esc(D.meta.mergeNote||D.meta.notes.merger)+' 아래 통계는 재정 데이터 원천을 따라 광주·전남을 나란히 보여드려요.</div>';
  }
  h += pledgeSection(gov);
  lks.forEach(function(lk){
    h += sidoBody(lk, lks.length>1 ? SIDO_FULL[lk] : null);
  });
  APP.innerHTML = h;
}

function sidoBody(sk, subTitle){
  var s = D.sido[sk];
  if (!s) return '';
  var h = '';
  if (subTitle) h += '<h1 style="font-size:20px; margin-top:36px; border-top:2px solid var(--ink); padding-top:20px">'+esc(subTitle)+'</h1>';

  /* 예산 이야기 */
  var b = s.budget26;
  h += '<section><h2><span class="emo">📐</span>예산 이야기 <small>2026년 본예산 기준</small></h2><div class="grid g2">';
  h += '<div class="rule-card"><div class="grid g2 tn">';
  h += '<div class="stat"><b>'+fmtWon(b?b.total:null)+'</b><span>2026 세입예산 총계</span></div>';
  var growth = (b && s.budget22total) ? ((b.total/s.budget22total-1)*100) : null;
  h += '<div class="stat"><b class="'+(growth>0?'pos':'neg')+'">'+(growth==null?'—':(growth>0?'+':'')+growth.toFixed(1)+'%')+'</b><span>2022 대비 증감</span></div>';
  h += '</div>';
  if (s.sources && s.sources.length){
    var totalSrc = s.sources.reduce(function(a,x){return a+x.amt;},0);
    var sorted = s.sources.slice().sort(function(a,b2){return b2.amt-a.amt;});
    h += '<div style="margin-top:14px">'+stackBar(sorted, totalSrc, SRC_COLORS);
    h += '<table style="margin-top:10px" class="tn"><tr><th>재원</th><th class="right">금액</th><th class="right">비중</th></tr>';
    sorted.forEach(function(x,i){
      h += '<tr><td><span style="display:inline-block;width:9px;height:9px;background:'+SRC_COLORS[i%SRC_COLORS.length]+';margin-right:7px;border-radius:2px"></span>'+esc(x.nm)+'</td><td class="right">'+fmtWon(x.amt)+'</td><td class="right">'+pct(x.amt/totalSrc*100)+'</td></tr>';
    });
    h += '</table></div>';
  }
  h += '</div>';
  var jr = s.jarip, jrYears = [2013,2016,2019,2022,2025];
  h += '<div class="rule-card"><h3>재정자립도 추이</h3><div class="muted" style="margin-bottom:8px">전체 살림에서 지방세·세외수입 등 스스로 버는 돈의 비율이에요.</div>';
  h += lineChart(jrYears.map(function(y){ return {x:String(y).slice(2)+"'", v: jr[y] ? (jr[y].r2!=null?jr[y].r2:jr[y].r1) : null}; }), {fmt:function(v){return v.toFixed(1)+'%';}, label:'재정자립도 추이'});
  h += '<div class="fine">2016년부터는 세입과목 개편후 산식, 2013년은 개편전 산식이라 직접 비교엔 약간의 단차가 있어요. 예산(최종예산) 기준.</div></div>';
  h += '</div></section>';

  /* 세금 이야기 */
  var years = [2017,2018,2019,2020,2021,2022,2023,2024];
  h += '<section><h2><span class="emo">💰</span>세금 이야기 <small>결산 확정치 · 2017~2024</small></h2>';
  h += reportCard(s.report, s.chenap, '광역 17곳');
  h += '<div class="grid g2">';
  h += '<div class="rule-card"><h3>지방세 징수액 추이</h3>';
  h += barLine(years.map(function(y){ return {x:y, v:s.tax[y]}; }), {fmt:fmtWon, zero:false, label:'지방세 징수액'});
  var d1 = s.tax[2024] && s.tax[2023] ? (s.tax[2024]/s.tax[2023]-1)*100 : null;
  h += '<div class="muted tn" style="margin-top:6px">2024년 '+fmtWon(s.tax[2024])+' · 전년 대비 '+(d1==null?'—':(d1>0?'+':'')+d1.toFixed(1)+'%')+'</div></div>';
  h += '<div class="rule-card"><h3>징수율과 1인당 부담</h3><table class="tn"><tr><th>지표</th><th class="right">2014</th><th class="right">2019</th><th class="right">2024</th></tr>';
  var r = s.rate||{};
  h += '<tr><td>지방세 징수율</td><td class="right">'+pct(r[2014]&&r[2014].rate)+'</td><td class="right">'+pct(r[2019]&&r[2019].rate)+'</td><td class="right"><b>'+pct(r[2024]&&r[2024].rate)+'</b></td></tr>';
  h += '</table><table class="tn" style="margin-top:10px"><tr><th>지표</th><th class="right">2014</th><th class="right">2018</th><th class="right">2022</th><th class="right">2026</th></tr>';
  var p = s.pc||{};
  h += '<tr><td>주민 1인당 지방세</td>'+[2014,2018,2022,2026].map(function(y){ return '<td class="right">'+(p[y]?fmtManFromChun(p[y].pc):'—')+'</td>'; }).join('')+'</tr>';
  h += '</table><div class="fine">징수율 = 수납액 ÷ 결정액 (결산). 1인당 부담액은 지방세액 ÷ 전년말 주민등록인구, 2026년은 예산 기준이에요.</div></div>';
  h += '</div></section>';

  /* 단체장의 지갑 */
  h += walletSection(s, sk);

  /* 기초 지자체 목록 */
  var kids = Object.keys(D.basic).filter(function(cd){ return D.basic[cd].sido===sk; });
  if (kids.length){
    kids.sort(function(a,b2){ return D.basic[a].name.localeCompare(D.basic[b2].name, 'ko'); });
    var mm = {jar:[null,null], ch:[null,null], gr:[null,null], pc:[null,null]};
    function upd(k,v){ if(v==null) return; var a=mm[k]; if(a[0]==null||v<a[0])a[0]=v; if(a[1]==null||v>a[1])a[1]=v; }
    kids.forEach(function(cd){ var b=D.basic[cd], r=b.report||{};
      upd('jar', b.jarip25); upd('ch', r.chRatio); upd('gr', r.growth); upd('pc', b.pc26?b.pc26.pc:null); });
    function norm(k,v,inv){
      var a=mm[k]; if(v==null||a[0]==null) return 0;
      var sp=(a[1]-a[0])||1, t=(v-a[0])/sp;
      return Math.round((inv?1-t:t)*100);
    }
    h += '<section><h2><span class="emo">🏘️</span>'+esc(sk)+'의 시·군·구 <small>가나다순 · '+kids.length+'곳 · 막대는 '+esc(sk)+' 안에서 견준 값</small></h2>';
    h += '<div class="gulist">';
    kids.forEach(function(cd){
      var bb = D.basic[cd], rp = bb.report || {};
      var g = rp.grade, col = g ? GRADE_FILL[g] : 'var(--ink3)';
      var sc = rp.score!=null ? rp.score : null;
      h += '<a class="gurow" href="#/gu/'+cd+'">';
      h += '<div class="gutop">';
      h += '<span class="gugrade" style="background:'+col+'">'+(g||'-')+'</span>';
      h += '<span class="gunm">'+esc(bb.name)+'</span>';
      h += '<span class="guscore"><i style="width:'+(sc!=null?sc.toFixed(0):0)+'%; background:'+col+'"></i></span>';
      h += '<b class="guv tn">'+(sc!=null?sc.toFixed(0):'—')+'</b>';
      h += '</div><div class="gumini">';
      [['자립도', pct(bb.jarip25), norm('jar', bb.jarip25, false), 'var(--accent)'],
       ['체납', rp.chRatio!=null?rp.chRatio.toFixed(1)+'%':'—', norm('ch', rp.chRatio, true), 'var(--neg)'],
       ['세수성장', rp.growth!=null?(rp.growth>0?'+':'')+rp.growth.toFixed(1)+'%':'—', norm('gr', rp.growth, false), 'var(--pos)'],
       ['1인당', bb.pc26?fmtManFromChun(bb.pc26.pc):'—', norm('pc', bb.pc26?bb.pc26.pc:null, false), 'var(--ink3)']
      ].forEach(function(m){
        h += '<span class="gum"><em>'+m[0]+'</em><b class="tn">'+m[1]+'</b><span class="gumb"><i style="width:'+m[2]+'%; background:'+m[3]+'"></i></span></span>';
      });
      h += '</div></a>';
    });
    h += '</div><p class="fine">등급과 점수는 세금 성적표 기준이에요(같은 유형끼리 3지표 백분위 평균). 막대는 '+esc(sk)+' 안에서만 견준 상대값이라 다른 시·도와는 비교하지 마세요. 체납은 낮을수록 막대가 길어요.</p>'+(sk==='서울'?'<p class="muted" style="margin-top:10px">서울 자치구는 <b>상권 이야기</b>도 있어요 — 구 페이지에서 이어져요.</p>':'')+'</section>';
  }
  return h;
}

function walletSection(s, sk){
  var w = s.wallet || {};
  var rkGiwan = sidoRank(function(x){ return x.wallet&&x.wallet.giwan ? x.wallet.giwan.chief : null; });
  var rkFesta = sidoRank(function(x){ return x.wallet&&x.wallet.festa ? x.wallet.festa.rt : null; });
  var rkTrip  = sidoRank(function(x){ return x.wallet&&x.wallet.trip ? x.wallet.trip.amt : null; });
  var h = '<section><h2><span class="emo">👛</span>단체장의 지갑 <small>2026년 예산 편성 기준 · 동급(광역 17곳) 비교</small></h2><div class="grid g3">';
  if (w.giwan){
    var gPrev = w.giwan.prev ? ((w.giwan.chief/w.giwan.prev.chief-1)*100) : null;
    h += '<div class="rule-card tn"><h3>기관운영 업무추진비</h3>';
    h += '<div class="stat" style="margin-top:8px"><b>'+fmtWon(w.giwan.chief)+'</b><span>단체장 몫 편성액 · 광역 '+rkGiwan.n+'곳 중 '+(rkGiwan.m[sk]||'—')+'위</span></div>';
    h += '<div class="row" style="display:flex;justify-content:space-between;border-top:1px dashed var(--rule2);margin-top:10px;padding-top:6px;font-size:12.5px"><span>부단체장 몫</span><b>'+fmtWon(w.giwan.vice)+'</b></div>';
    h += '<div style="display:flex;justify-content:space-between;font-size:12.5px"><span>편성 총액 / 한도</span><b>'+fmtWon(w.giwan.total)+' / '+fmtWon(w.giwan.limit)+'</b></div>';
    h += '<div style="display:flex;justify-content:space-between;font-size:12.5px"><span>2023 대비 단체장 몫</span><b class="'+(gPrev>0?'neg':'pos')+'">'+(gPrev==null?'—':(gPrev>0?'+':'')+gPrev.toFixed(1)+'%')+'</b></div></div>';
  }
  if (w.festa){
    h += '<div class="rule-card tn"><h3>행사·축제 경비</h3>';
    h += '<div class="stat" style="margin-top:8px"><b>'+fmtWon(w.festa.amt)+'</b><span>세출 대비 '+pct(w.festa.rt,2)+' · 비율 '+rkFesta.n+'곳 중 '+(rkFesta.m[sk]||'—')+'위</span></div>';
    h += '<table style="margin-top:10px"><tr><th>연도</th><th class="right">편성액</th><th class="right">비율</th></tr>';
    if (w.festa.prev18) h += '<tr><td>2018</td><td class="right">'+fmtWon(w.festa.prev18.amt)+'</td><td class="right">'+pct(w.festa.prev18.rt,2)+'</td></tr>';
    if (w.festa.prev22) h += '<tr><td>2022</td><td class="right">'+fmtWon(w.festa.prev22.amt)+'</td><td class="right">'+pct(w.festa.prev22.rt,2)+'</td></tr>';
    h += '<tr class="hl"><td>2026</td><td class="right">'+fmtWon(w.festa.amt)+'</td><td class="right">'+pct(w.festa.rt,2)+'</td></tr></table></div>';
  }
  if (w.trip || w.cash){
    h += '<div class="rule-card tn">';
    if (w.trip){
      var tPrev = w.trip.prev22 ? ((w.trip.amt/w.trip.prev22.amt-1)*100) : null;
      h += '<h3>국외여비</h3><div class="stat" style="margin-top:8px"><b>'+fmtWon(w.trip.amt)+'</b><span>총액 '+rkTrip.n+'곳 중 '+(rkTrip.m[sk]||'—')+'위 · 2022 대비 '+(tPrev==null?'—':(tPrev>0?'+':'')+tPrev.toFixed(0)+'%')+'</span></div>';
    }
    if (w.cash){
      h += '<h3 style="margin-top:14px">현금성 복지 (자체)</h3><div class="stat" style="margin-top:6px"><b>'+fmtWon(w.cash.amt)+'</b><span>세출 대비 '+pct(w.cash.rt,2)+'</span></div>';
    }
    h += '</div>';
  }
  h += '</div>';
  h += '<details class="metric"><summary>이 숫자들의 정의를 알려드려요</summary><div class="body">'
    + '· 전부 <b>2026년 본예산 편성액</b>이에요. 실제 집행액(결산)은 2027년에 확정돼요.<br>'
    + '· 기관운영 업무추진비의 "단체장 몫"은 단체장/부단체장/실국장 몫이 따로 공시된 값이에요.<br>'
    + '· 행사·축제 경비 비율의 분모는 세출예산액이에요. 국외여비 = 국외업무여비 + 국제화여비.<br>'
    + '· 현금성 복지는 301-03 사회보장적수혜금(지방재원) 통계목 기준 — 지자체가 조례 등으로 자체 지급하는 현금성 지원이에요.<br>'
    + '· 편성은 2025년 말 전임 집행부(민선 8기)가 했고, 현 단체장은 집행을 맡아요.</div></details>';
  h += '</section>';
  return h;
}

/* ---------- 기초 상세 ---------- */
function renderGu(cd){
  var b = D.basic[cd];
  if (!b){ APP.innerHTML = '<div class="skel">해당 지역을 찾지 못했어요.</div>'; return; }
  document.title = fullNm(b) + ' — 우리동네 이야기';
  var type = /구$/.test(b.name) ? '구' : (/군$/.test(b.name) ? '군' : '시');
  var peers = Object.keys(D.basic).filter(function(k){ var n = D.basic[k].name; return (type==='구'&&/구$/.test(n))||(type==='군'&&/군$/.test(n))||(type==='시'&&/시$/.test(n)); });
  function pctileOf(getter){
    var mine = getter(b); if (mine==null) return null;
    var vals = peers.map(function(k){ return getter(D.basic[k]); }).filter(function(v){ return v!=null; }).sort(function(a,b2){return b2-a;});
    var idx = vals.findIndex(function(v){ return v<=mine; });
    return {rank: idx<0?vals.length:idx+1, n: vals.length};
  }
  var sidoKey = b.sido;
  var govKey = (sidoKey==='광주'||sidoKey==='전남') ? '전남광주' : sidoKey;
  var h = '<div class="crumb"><a href="#">홈</a> › <a href="#/sido/'+govKey+'">'+esc(SIDO_FULL[sidoKey]||sidoKey)+'</a> › '+esc(b.name)+'</div>';
  h += '<section style="margin-top:8px"><h1>'+esc(fullNm(b))+'</h1><p class="muted">같은 유형('+type+') '+peers.length+'곳끼리 비교해요 — 광역·시·군·구는 재정 구조가 달라 섞어서 줄 세우지 않아요.</p></section>';

  var years = [2017,2018,2019,2020,2021,2022,2023,2024];
  var jrP = pctileOf(function(x){ return x.jarip25; });
  var pcP = pctileOf(function(x){ return x.pc26 ? x.pc26.pc : null; });
  h += '<section><h2><span class="emo">💰</span>세금 이야기 <small>결산 2017~2024 · 예산 2026</small></h2>';
  h += reportCard(b.report, b.chenap, b.report && b.report.peerType ? '같은 '+b.report.peerType+' '+b.report.peerN+'곳' : '');
  h += '<div class="grid g2">';
  h += '<div class="rule-card"><h3>지방세 징수액 추이</h3>'+barLine(years.map(function(y){ return {x:y, v:b.tax[y]}; }), {fmt:fmtWon, label:'지방세 징수액'});
  var dd = b.tax[2024]&&b.tax[2023] ? (b.tax[2024]/b.tax[2023]-1)*100 : null;
  h += '<div class="muted tn" style="margin-top:6px">2024년 '+fmtWon(b.tax[2024])+' · 전년 대비 '+(dd==null?'—':(dd>0?'+':'')+dd.toFixed(1)+'%')+'</div></div>';
  h += '<div class="rule-card tn"><h3>지금 위치</h3>';
  h += '<div class="grid g2" style="margin-top:8px">';
  h += '<div class="stat"><b>'+pct(b.jarip25)+'</b><span>재정자립도(2025) · '+(jrP?type+' '+jrP.n+'곳 중 '+jrP.rank+'위':'')+'</span></div>';
  h += '<div class="stat"><b>'+(b.pc26?fmtManFromChun(b.pc26.pc):'—')+'</b><span>1인당 지방세(2026 예산) · '+(pcP?type+' '+pcP.n+'곳 중 '+pcP.rank+'위':'')+'</span></div>';
  h += '</div>';
  h += '<table style="margin-top:12px"><tr><th>자립도 추이</th>'+[2013,2016,2019,2022,2025].map(function(y){return '<th class="right">'+String(y).slice(2)+"'</th>";}).join('')+'</tr>';
  h += '<tr><td class="muted">개편후 산식</td>'+[2013,2016,2019,2022,2025].map(function(y){ var v = b.jaripSeries[y]; return '<td class="right">'+pct(v?(v.r2!=null?v.r2:v.r1):null)+'</td>'; }).join('')+'</tr></table></div>';
  h += '</div></section>';

  /* 동네 이야기 더: 인구 + 위치 산점도 */
  var pcs = b.pcSeries||{};
  var popYears = [2014,2018,2022,2026].filter(function(y){ return pcs[y]&&pcs[y].pop; });
  if (popYears.length >= 2){
    var p0 = pcs[popYears[0]].pop, p1 = pcs[popYears[popYears.length-1]].pop;
    var dPop = (p1/p0-1)*100;
    h += '<section><h2><span class="emo">👥</span>사람 이야기 <small>주민등록인구 기준</small></h2><div class="grid g2">';
    h += '<div class="rule-card"><h3>인구 추이</h3>'+lineChart(popYears.map(function(y){ return {x:String(y).slice(2)+"'", v: pcs[y].pop}; }), {fmt:function(v){ return v>=1e6?(v/1e6).toFixed(2)+'백만':Math.round(v/1e4)+'만'; }, label:'인구 추이'});
    h += '<div class="muted tn" style="margin-top:6px">'+popYears[0]+'년 대비 <b class="'+(dPop>=0?'pos':'neg')+'">'+(dPop>0?'+':'')+dPop.toFixed(1)+'%</b> · 현재 '+p1.toLocaleString()+'명</div>';
    h += '<div class="fine">인구가 줄면 같은 살림을 더 적은 사람이 나눠 지게 돼요 — 1인당 부담과 함께 보세요.</div></div>';
    h += '<div class="rule-card"><h3>동급 속 위치 <span class="muted" style="font-weight:400">자립도 × 1인당 지방세</span></h3>'+scatterPeers(b)+'<div class="fine">같은 유형('+esc(b.report&&b.report.peerType||'')+') 전체를 회색 점으로, 이 동네를 파란 점으로 표시했어요.</div></div>';
    h += '</div></section>';
  }

  var w = b.wallet||{};
  if (w.giwan || w.festa){
    h += '<section><h2><span class="emo">👛</span>단체장의 지갑 <small>2026 예산 편성 · 같은 '+type+' 유형끼리 비교</small></h2><div class="grid g3">';
    if (w.giwan){
      var gp = pctileOf(function(x){ return x.wallet&&x.wallet.giwan?x.wallet.giwan.chief:null; });
      h += '<div class="rule-card tn"><h3>기관운영 업무추진비</h3><div class="stat" style="margin-top:8px"><b>'+fmtWon(w.giwan.chief)+'</b><span>단체장 몫 · '+(gp?type+' '+gp.n+'곳 중 '+gp.rank+'위':'')+'</span></div>';
      h += '<div style="display:flex;justify-content:space-between;font-size:12.5px;border-top:1px dashed var(--rule2);margin-top:10px;padding-top:6px"><span>편성 총액/한도</span><b>'+fmtWon(w.giwan.total)+' / '+fmtWon(w.giwan.limit)+'</b></div></div>';
    }
    if (w.festa){
      var fp = pctileOf(function(x){ return x.wallet&&x.wallet.festa?x.wallet.festa.rt:null; });
      h += '<div class="rule-card tn"><h3>행사·축제 경비</h3><div class="stat" style="margin-top:8px"><b>'+fmtWon(w.festa.amt)+'</b><span>세출 대비 '+pct(w.festa.rt,2)+' · '+(fp?'비율 '+type+' '+fp.n+'곳 중 '+fp.rank+'위':'')+'</span></div>';
      if (w.festa.prev22) h += '<div style="display:flex;justify-content:space-between;font-size:12.5px;border-top:1px dashed var(--rule2);margin-top:10px;padding-top:6px"><span>2022 편성액</span><b>'+fmtWon(w.festa.prev22.amt)+'</b></div>';
      h += '</div>';
    }
    if (w.sichaek){
      h += '<div class="rule-card tn"><h3>시책추진 업무추진비</h3><div class="stat" style="margin-top:8px"><b>'+fmtWon(w.sichaek.total)+'</b><span>기준액 대비 '+pct(w.sichaek.rt,1)+'</span></div>'
        + (w.sichaek.prev?'<div style="display:flex;justify-content:space-between;font-size:12.5px;border-top:1px dashed var(--rule2);margin-top:10px;padding-top:6px"><span>2023 편성액</span><b>'+fmtWon(w.sichaek.prev.total)+'</b></div>':'')+'</div>';
    }
    h += '</div><details class="metric"><summary>이 숫자들의 정의를 알려드려요</summary><div class="body">전부 2026년 본예산 편성액이에요. 단체장 몫은 따로 공시된 값이고, 행사·축제 비율의 분모는 세출예산액이에요. 편성 주체는 2025년 말의 전임 집행부예요.</div></details></section>';
  }

  /* 비교함 + 공유 */
  h += '<section><div style="display:flex; gap:10px; flex-wrap:wrap">';
  h += '<button class="footnote-btn" style="border:1.5px solid var(--accent); padding:9px 16px; border-radius:4px; font-size:13.5px; font-weight:600" onclick="addCmp(\''+cd+'\')">⊕ 비교함에 담기</button>';
  h += '<button class="footnote-btn" style="border:1.5px solid var(--rule); padding:9px 16px; border-radius:4px; font-size:13.5px; font-weight:600; color:var(--ink2)" onclick="copySummary(\''+cd+'\')">우리 동네 3줄 요약 복사</button>';
  h += '<span id="cmpMsg" class="muted" style="align-self:center"></span>';
  h += '</div></section>';

  /* 가게 흥망사 — 이 페이지에 인라인 */
  h += '<div id="bizBox"><div class="skel" style="padding:28px 0">가게 데이터를 불러오는 중이에요…</div></div>';

  APP.innerHTML = h;
  var bizKey = b.sido+'|'+b.name;
  loadNation().then(function(N){
    var u = N.units[bizKey];
    var box = document.getElementById('bizBox');
    if (!box) return;
    if (!u){ box.innerHTML = '<p class="muted">이 지역은 상권 데이터가 아직 없어요.</p>'; return; }
    box.innerHTML = bizSectionsHTML(u, bizKey, {cd:cd});
    bindBizSections(u, bizKey);
  }).catch(function(){
    var box = document.getElementById('bizBox');
    if (box) box.innerHTML = '<p class="muted">상권 데이터는 로컬 서버나 호스팅 환경에서만 불러와져요.</p>';
  });
}

/* ---------- 상권(서울 구) [레거시: 라우터 미사용] ---------- */
function renderBiz(gu){
  var C = D.seoulCommerce;
  if (!C.byCat['일반음식점'].gu[gu]){ APP.innerHTML = '<div class="skel">서울 자치구만 상권 이야기를 제공해요.</div>'; return; }
  document.title = '서울 '+gu+' 상권 이야기 — 우리동네 이야기';
  var guCd = Object.keys(D.basic).filter(function(cd){ return D.basic[cd].sido==='서울' && D.basic[cd].name===gu; })[0];
  var h = '<div class="crumb"><a href="#">홈</a> › <a href="#/sido/서울">서울특별시</a> › '+(guCd?'<a href="#/gu/'+guCd+'">'+esc(gu)+'</a>':esc(gu))+' › 상권</div>';
  h += '<section style="margin-top:8px"><h1>서울 '+esc(gu)+' 상권 이야기</h1><p class="muted">인허가 개업·폐업 전 이력으로 계산했어요. 사장님이 바뀌어도 인허가가 유지되면 같은 가게로 세요.</p></section>';

  var cats = ['일반음식점','카페·휴게음식점','제과점','미용실','헬스장','당구장','세탁소','담배소매(편의점 프록시)','숙박업'];
  h += '<section><h2><span class="emo">📇</span>업종별 현황과 수명 <small>영업 중 · 폐업 중위 영업기간</small></h2><div class="rule-card"><table class="tn"><tr><th>업종</th><th class="right">영업 중</th><th class="right">2025 개업</th><th class="right">2025 폐업</th><th class="right">폐업까지 중위</th><th class="right">서울 5년 생존율*</th></tr>';
  cats.forEach(function(c){
    var g = C.byCat[c] && C.byCat[c].gu[gu]; if (!g) return;
    var coh = C.byCat[c].cohort1920;
    h += '<tr><td>'+catLabel(c)+'</td><td class="right">'+g.open.toLocaleString()+'</td><td class="right">'+(g.openByYear[2025]||0).toLocaleString()+'</td><td class="right">'+(g.closeByYear[2025]||0).toLocaleString()+'</td><td class="right">'+(g.medianLifeM?Math.round(g.medianLifeM/12*10)/10+'년':'—')+'</td><td class="right">'+(coh&&coh.s5!=null?pct(coh.s5):'—')+'</td></tr>';
  });
  h += '</table><div class="fine">* 생존율은 서울 전체 2019~2020년 개업 코호트가 5년을 버틴 비율이에요(구 단위가 아니라 서울 기준). 중위 영업기간은 이미 폐업한 가게들 기준이라 살아있는 가게가 길게 버틸수록 실제 수명은 이보다 길어요.</div></div></section>';

  /* 요즘 뜨고 지는 업종 */
  var catsAll = ['일반음식점','카페·휴게음식점','제과점','미용실','헬스장','당구장','세탁소','담배소매(편의점 프록시)','숙박업'];
  var trend2 = catsAll.map(function(c){
    var g2 = C.byCat[c] && C.byCat[c].gu[gu]; if (!g2) return null;
    var net25 = (g2.openByYear[2025]||0) - (g2.closeByYear[2025]||0);
    var net19 = (g2.openByYear[2019]||0) - (g2.closeByYear[2019]||0);
    return {c:c, net25:net25, o:g2.openByYear[2025]||0, x:g2.closeByYear[2025]||0, net19:net19};
  }).filter(Boolean).sort(function(a,b2){ return b2.net25-a.net25; });
  if (trend2.length){
    h += '<section><h2><span class="emo">🔥</span>요즘 뜨고 지는 업종 <small>2025년 순증감(개업−폐업) · '+esc(gu)+'</small></h2><div class="rule-card"><table class="tn"><tr><th>업종</th><th class="right">2025 개업</th><th class="right">2025 폐업</th><th class="right">순증감</th><th class="right">2019 순증감</th></tr>';
    trend2.forEach(function(t){
      h += '<tr><td>'+esc(t.c)+'</td><td class="right">'+t.o.toLocaleString()+'</td><td class="right">'+t.x.toLocaleString()+'</td><td class="right"><b class="'+(t.net25>=0?'pos':'neg')+'">'+(t.net25>0?'+':'')+t.net25.toLocaleString()+'</b></td><td class="right muted">'+(t.net19>0?'+':'')+t.net19.toLocaleString()+'</td></tr>';
    });
    h += '</table><div class="fine">순증감 = 그 해 개업 신고 − 폐업 신고. 코로나 이전 평상시였던 2019년과 나란히 놓았어요.</div></div></section>';
  }

  var food = C.byCat['일반음식점'].gu[gu];
  var yrs = []; for (var y=2015;y<=2026;y++) yrs.push(y);
  h += '<section><h2><span class="emo">🍽️</span>음식점은 늘까 줄까 <small>'+esc(gu)+' · 연도별</small></h2><div class="grid g2">';
  h += '<div class="rule-card"><h3>개업</h3>'+barLine(yrs.map(function(y2){ return {x:y2, v:food.openByYear[y2]||0}; }), {fmt:function(v){return v+'곳';}, zero:true, label:'개업'})+'</div>';
  h += '<div class="rule-card"><h3>폐업</h3>'+barLine(yrs.map(function(y2){ return {x:y2, v:food.closeByYear[y2]||0}; }), {fmt:function(v){return v+'곳';}, zero:true, color:'#B3261E', label:'폐업'})+'</div>';
  h += '</div><p class="fine">2026년은 8월 중순까지 집계예요. 개업 연도는 인허가일 기준, 폐업 연도는 폐업 신고일 기준이에요.</p></section>';

  var svGu = D.seoulSurv && D.seoulSurv[gu];
  if (svGu){
    h += '<section><h2><span class="emo">📉</span>몇 년이나 버틸까 <small>'+esc(gu)+' 음식점·카페 · 2019~2020 개업 '+svGu.n.toLocaleString()+'곳 추적</small></h2><div class="grid g2">';
    h += '<div class="rule-card">'+lineChart(svGu.s.map(function(v,i){ return {x:i+'년', v:v}; }), {fmt:function(v){return v.toFixed(0)+'%';}, label:'생존곡선', color:'#9a3412'});
    h += '<div class="fine">개업 후 n년을 넘긴 비율이에요. 영업 중 가게는 관측중단 처리.</div></div>';
    h += '<a class="rule-card" href="#/spot/'+gu+'" style="display:flex; flex-direction:column; justify-content:center"><h3 class="lk">그 자리, 뭐가 있었지? →</h3><p class="muted" style="margin-top:6px">'+esc(gu)+'의 주소를 검색하면 그 자리의 업소 연대기와 자리 위험도를 보여드려요.</p></a>';
    h += '</div></section>';
  }
  var churn = C.topChurn[gu]||[];
  if (churn.length){
    h += '<section><h2><span class="emo">🚪</span>주인이 자주 바뀐 자리 <small>같은 자리에서 가게가 가장 많이 바뀐 곳</small></h2><div class="grid g3">';
    churn.forEach(function(a){
      h += '<div class="rule-card"><div style="font-weight:700; font-size:13.5px">'+esc(a.addr.replace('서울특별시 ',''))+'</div><div class="muted tn" style="margin:2px 0 12px">여기서만 '+a.n+'번 명멸했어요</div><div class="timeline">';
      a.timeline.slice().reverse().slice(0,6).forEach(function(t){
        var alive = !t.cl;
        h += '<div class="ev'+(alive?'':' dead')+'"><div class="what">'+esc(t.nm||'(상호 미기재)')+'<span class="st '+(alive?'live':'dead')+'">'+(alive?'영업 중':'폐업')+'</span></div>';
        h += '<div class="when tn">'+esc(t.up||t.cat)+' · '+esc(t.op||'?')+(t.cl?' → '+esc(t.cl):'')+'</div></div>';
      });
      h += '</div></div>';
    });
    h += '</div><p class="fine">지번주소 기준으로 층·호를 지운 뒤 묶었어요. 큰 건물은 여러 가게가 같은 주소를 쓸 수 있어 "한 점포"가 아니라 "한 지번"의 기록이에요.</p></section>';
  }
  APP.innerHTML = h;
}

/* ---------- 단체장의 약속 (핵심 공약) ---------- */
var PLEDGE_CATS = ['경제일자리','주거부동산','교통인프라','복지돌봄','환경문화','행정안전'];
var PLEDGE_ICON = {경제일자리:'경제·일자리', 주거부동산:'주거·부동산', 교통인프라:'교통·인프라', 복지돌봄:'복지·돌봄', 환경문화:'환경·문화', 행정안전:'행정·안전'};
function pledgeSection(gov){
  if (!gov.pledges || !gov.pledges.length) return '';
  var h = '<section><h2><span class="emo">📋</span>단체장의 약속 <small>2026 선거 핵심 공약 · 전 항목 출처 연결</small></h2>';
  if (gov.pledgeNote) h += '<div class="rule-card" style="border-left:3px solid #a16207; margin-bottom:12px"><b>그 후 이야기</b> — '+esc(gov.pledgeNote)+'</div>';
  h += '<div class="grid g3">';
  PLEDGE_CATS.forEach(function(cat){
    var ps = gov.pledges.filter(function(p){ return p.cat===cat; });
    if (!ps.length) return;
    h += '<div class="rule-card"><h3 style="border-bottom:1px solid var(--rule); padding-bottom:7px; margin-bottom:4px">'+esc(PLEDGE_ICON[cat]||cat)+'</h3>';
    ps.forEach(function(p){
      h += '<div style="padding:8px 0; border-bottom:1px dashed var(--rule2); font-size:13.5px; line-height:1.55">';
      if (p.top) h += '<span class="tag" style="border-color:var(--accent); color:var(--accent); margin-right:6px">1호·대표</span>';
      h += esc(p.text);
      if (p.src) h += ' <a href="'+esc(p.src)+'" target="_blank" rel="noopener" class="muted" style="font-size:11.5px; white-space:nowrap" title="출처 기사">출처↗</a>';
      h += '</div>';
    });
    h += '</div>';
  });
  h += '</div>';
  h += '<p class="fine">'+esc(D.meta.notes.pledge)+(gov.pledgeConf==='부분검증'?' 이 지역은 취임 후 핵심과제 보도 기준이라 "부분검증"으로 표시해요.':'')+'</p>';
  h += '</section>';
  return h;
}

/* ---------- 성적표 카드 ---------- */
function reportCard(rep, chen, peerLabel){
  if (!rep || !rep.grade) return '';
  var gc = GRADE_FILL[rep.grade];
  var h = '<div class="rule-card" style="margin-bottom:12px"><div style="display:flex; gap:20px; flex-wrap:wrap; align-items:center">';
  h += '<div style="text-align:center; border:2px solid '+gc+'; border-radius:4px; padding:8px 18px"><div style="font-size:30px; font-weight:800; color:'+gc+'; line-height:1.1">'+rep.grade+'</div><div class="muted tn">'+rep.score+'점 / 100</div></div>';
  h += '<div class="grid g3 tn" style="flex:1; min-width:280px">';
  h += '<div class="stat"><b>'+pct(rep.jarip)+'</b><span>재정자립도 (2025)</span></div>';
  h += '<div class="stat"><b>'+pct(rep.chRatio)+'</b><span>체납 잔액 비율 (2024)</span></div>';
  h += '<div class="stat"><b class="'+(rep.growth>=0?'pos':'neg')+'">'+(rep.growth==null?'—':(rep.growth>0?'+':'')+rep.growth.toFixed(1)+'%')+'</b><span>지방세 5년 연평균 성장</span></div>';
  h += '</div></div>';
  if (chen){
    h += '<table class="tn" style="margin-top:12px"><tr><th>지방세 체납누계액</th><th class="right">2016</th><th class="right">2020</th><th class="right">2024</th></tr>';
    h += '<tr><td class="muted">결산 기준</td><td class="right">'+fmtWon(chen[2016])+'</td><td class="right">'+fmtWon(chen[2020])+'</td><td class="right"><b>'+fmtWon(chen[2024])+'</b></td></tr></table>';
  }
  h += '<div class="fine">'+esc(D.meta.notes.grade)+' 비교집단: '+esc(peerLabel)+'. '+esc(D.meta.notes.chenap)+'</div></div>';
  return h;
}

/* ---------- 그 자리, 뭐가 있었지? ---------- */
var ADDR_CACHE = {};
function loadAddr(gu){
  if (ADDR_CACHE[gu]) return Promise.resolve(ADDR_CACHE[gu]);
  return fetch('addr/'+encodeURIComponent(gu)+'.json?v=2').then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){ ADDR_CACHE[gu]=j; return j; });
}
function spotRisk(recs, gu){
  var closed = recs.filter(function(r){return r.x;});
  var lifes = closed.map(function(r){ return (new Date(r.x)-new Date(r.o))/2629800000; }).filter(function(m){return m>0;});
  var med = lifes.length? lifes.sort(function(a,b){return a-b;})[Math.floor(lifes.length/2)] : null;
  var sv = D.seoulSurv[gu] ? D.seoulSurv[gu].s[5] : 45;
  var score = 35 + Math.min(recs.length-2,8)*6 + (med!=null? Math.max(0,(40-med))*0.7 : 0) + (45-sv)*0.6;
  score = Math.max(5, Math.min(95, Math.round(score)));
  return {score:score, med:med, n:recs.length};
}
function renderSpot(param){
  document.title = '그 자리, 뭐가 있었지? — 우리동네 이야기';
  var gus = Object.keys(D.seoulCommerce.byCat['일반음식점'].gu).sort(function(a,b){return a.localeCompare(b,'ko');});
  var gu = param && decodeURIComponent(param);
  var h = '<div class="crumb"><a href="#">홈</a> › 그 자리, 뭐가 있었지?</div>';
  h += '<section style="margin-top:8px"><h1>🏪 이 자리엔 뭐가 있었지?</h1><p class="lead">한 자리에 어떤 가게들이 거쳐 갔는지 순서대로 보여드려요. 지역을 고르고 동 이름이나 가게 이름을 넣어보세요.</p>';
  h += '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:14px">';
  gus.forEach(function(g){ h += '<a class="tag" style="font-size:13px; padding:6px 12px; '+(g===gu?'background:var(--ink); color:var(--bg); border-color:var(--ink)':'')+'" href="#/spot/'+g+'">'+g+'</a>'; });
  h += '</div></section><div id="spotBody">'+(gu?'<div class="skel">'+esc(gu)+' 주소를 불러오는 중이에요…</div>':'')+'</div>';
  APP.innerHTML = h;
  if (!gu){
    var exGu = '마포구', ex = (D.seoulCommerce.topChurn[exGu]||[])[0];
    if (ex){
      var eh = '<section><h2><span class="emo">💡</span>이런 걸 보여드려요 <small>예시 · '+esc(exGu)+' 최다 교체 주소</small></h2><div class="rule-card" style="max-width:560px">';
      eh += '<b style="font-size:14.5px">'+esc(ex.addr.replace('서울특별시 ',''))+'</b><div class="muted tn" style="margin:2px 0 12px">여기서만 '+ex.n+'번 명멸했어요</div><div class="timeline">';
      ex.timeline.slice().reverse().slice(0,4).forEach(function(t){
        var alive2 = !t.cl;
        eh += '<div class="ev'+(alive2?'':' dead')+'"><div class="what">'+esc(t.nm||'(상호 미기재)')+'<span class="st '+(alive2?'live':'dead')+'">'+(alive2?'영업 중':'폐업')+'</span></div><div class="when tn">'+esc(t.up||t.cat)+' · '+esc(t.op||'?')+(t.cl?' → '+esc(t.cl):'')+'</div></div>';
      });
      eh += '</div><p class="muted" style="margin-top:8px">↑ 위 구 버튼을 누르면 여러분 동네 주소로 이걸 찾을 수 있어요.</p></div></section>';
      document.getElementById('spotBody').innerHTML = eh;
    }
    return;
  }
  loadAddr(gu).then(function(book){
    var keys = Object.keys(book);
    var body = document.getElementById('spotBody');
    var bh = '<section><h2>'+esc(gu)+' <small>기록 있는 주소 '+keys.length.toLocaleString()+'곳</small></h2>';
    bh += '<input class="search" id="spotQ" placeholder="동·번지나 가게 이름 (예: 서교동 357, 연남동, 국밥)" autocomplete="off">';
    bh += '<div id="spotList" style="margin-top:12px" role="region" aria-live="polite" aria-label="주소 검색 결과"></div></section>';
    body.innerHTML = bh;
    var q = document.getElementById('spotQ'), list = document.getElementById('spotList');
    function show(qs){
      if (!qs || qs.length<2){ list.innerHTML = '<p class="muted">두 글자 이상 입력하면 찾아드려요.</p>'; return; }
      var hits = [];
      for (var i=0;i<keys.length;i++){
        var k = keys[i];
        if (k.indexOf(qs)>=0){ hits.push(k); continue; }
        var recs = book[k];
        for (var j2=0;j2<recs.length;j2++){ if ((recs[j2].nm||'').indexOf(qs)>=0){ hits.push(k); break; } }
      }
      if (!hits.length){ list.innerHTML = '<p class="muted">결과가 없어요. 지번 주소(동+번지) 기준이라 도로명으로는 안 찾아질 수 있어요.</p>'; return; }
      var lh = '<p class="muted tn" style="margin-bottom:10px">총 <b>'+hits.length.toLocaleString()+'곳</b> 일치'+(hits.length>30?' · 앞 30곳만 보여드려요 — 동 이름이나 번지를 더 붙여 좁혀보세요':'')+'</p><div class="grid g2">';
      hits.slice(0,30).forEach(function(k){
        var recs = book[k].slice().sort(function(a,b){return (a.o||'').localeCompare(b.o||'');});
        var risk = spotRisk(recs, gu);
        var alive = recs.filter(function(r){return r.a;});
        lh += '<div class="rule-card"><div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px">';
        lh += '<div><b style="font-size:14.5px">'+esc(k)+'</b><div class="muted tn">기록 '+risk.n+'개 · 영업 중 '+alive.length+'곳'+(risk.med!=null?' · 폐업까지 중위 '+Math.round(risk.med)+'개월':'')+'</div></div>';
        lh += '<div style="text-align:center; border:1.5px solid '+(risk.score>=60?'var(--neg)':risk.score>=40?'#a16207':'var(--pos)')+'; border-radius:4px; padding:3px 10px; flex-shrink:0"><b class="tn" style="color:'+(risk.score>=60?'var(--neg)':risk.score>=40?'#a16207':'var(--pos)')+'">'+risk.score+'</b><div style="font-size:10.5px" class="muted">자리 위험도</div></div></div>';
        lh += '<div class="timeline" style="margin-top:12px">';
        recs.slice().reverse().slice(0,8).forEach(function(t){
          lh += '<div class="ev'+(t.a?'':' dead')+'"><div class="what">'+esc(t.nm||'(상호 미기재)')+'<span class="st '+(t.a?'live':'dead')+'">'+(t.a?'영업 중':'폐업')+'</span></div>';
          lh += '<div class="when tn">'+esc(t.u||t.c)+' · '+esc(t.o||'?')+(t.x?' → '+esc(t.x):'')+'</div></div>';
        });
        lh += '</div></div>';
      });
      lh += '</div><p class="fine">자리 위험도는 교체 횟수·폐업 속도·동네 생존율을 합성한 참고용 지표예요. 사장님이 바뀌어도 인허가가 유지되면 같은 가게로 세지요. 큰 건물은 여러 가게가 한 지번을 써요.</p>';
      list.innerHTML = lh;
    }
    q.addEventListener('input', function(){ show(q.value.trim()); });
    show('');
    var sv = D.seoulSurv[gu];
    if (sv){
      var sh2 = '<section><h2><span class="emo">📉</span>'+esc(gu)+' 가게는 몇 년 버틸까 <small>2019~2020년 개업 '+sv.n.toLocaleString()+'곳 추적</small></h2><div class="rule-card" style="max-width:640px">';
      sh2 += lineChart(sv.s.map(function(v,i){ return {x:i+'년', v:v}; }), {fmt:function(v){return v.toFixed(0)+'%';}, label:'생존곡선', color:'#9a3412'});
      sh2 += '<div class="fine">인허가 기준 실측이에요. 영업 중인 가게는 관측중단으로 처리했어요.</div></div></section>';
      body.insertAdjacentHTML('beforeend', sh2);
    }
  }).catch(function(){
    document.getElementById('spotBody').innerHTML = '<div class="rule-card">주소 데이터는 로컬 서버나 호스팅 환경에서만 불러와져요 (file:// 직접 열기로는 이 기능만 제한돼요).</div>';
  });
}

/* ---------- 세금 성적표 · 지도 (도감 지도 스펙 이식) ---------- */
var GRADE_FILL = {A:'#0E9384', B:'#3E63DD', C:'#EE7A1E', D:'#D1495B'}; /* 청→황→적: 적록색약 대응 */
var MAPIDX = null;
function buildMapIdx(){
  if (MAPIDX) return MAPIDX;
  var ALIAS = {'인천|남구':'인천|미추홈구'}; // 2018 지도의 옛 이름
  var byKey = {};
  Object.keys(D.basic).forEach(function(cd){ var b=D.basic[cd]; byKey[b.sido+'|'+b.name]=cd; });
  MAPIDX = window.__MAP__.mun.map(function(u){
    var key = ALIAS[u.s+'|'+u.n] || (u.s+'|'+u.n);
    var cd = byKey[key] || null;
    var govKey = (u.s==='광주'||u.s==='전남') ? '전남광주' : u.s;
    return {u:u, cd:cd, b: cd?D.basic[cd]:null, govKey:govKey};
  });
  return MAPIDX;
}
function renderTax(zoomSido){
  document.title = '세금 성적표 지도 — 우리동네 이야기';
  var idx = buildMapIdx();
  var h = '<section style="margin-top:18px"><h1>🗺️ 전국 세금 지도</h1>';
  h += '<p class="muted" style="margin:6px 0 14px">시·군·구 226곳을 동급끼리 채점한 등급이에요. 지도를 누르면 그 동네 페이지로 가요. 드래그로 이동(터치 동작), 휠이나 +/− 버튼으로 확대해요.</p>';
  h += '<div class="map-jump" id="mjump"><button data-zm="in" aria-label="확대">+</button><button data-zm="out" aria-label="축소">−</button><button data-z="">전국</button>';
  ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'].forEach(function(s2){ h += '<button data-z="'+s2+'">'+s2+'</button>'; });
  h += '</div>';
  h += '<div id="map-wrap"><svg id="map" role="img" aria-label="전국 시군구 세금 성적표 지도"></svg></div>';
  h += '<div class="legend-g tn"><span><i style="background:'+GRADE_FILL.A+'"></i>A (백분위 평균 75+)</span><span><i style="background:'+GRADE_FILL.B+'"></i>B (50+)</span><span><i style="background:'+GRADE_FILL.C+'"></i>C (25+)</span><span><i style="background:'+GRADE_FILL.D+'"></i>D</span><span><i style="background:#C4BFB8"></i>데이터 없음·광역직할</span><span class="muted">확대하면 시·군·구 이름이 보여요 · 등급은 색과 마우스오버로 확인해요</span></div>';
  h += '<details class="metric" style="margin-top:12px"><summary>등급은 어떻게 매기나요</summary><div class="body">'+esc(D.meta.notes.grade)+'<br>일반구(수원 장안구 등)는 모시 단위로 합쳐 칠했고, 군위군은 2023년 대구 편입을 반영했어요. 경계 데이터 출처는 페이지 맨 아래에 모아뒀어요.</div></details>';
  h += '</section>';
  APP.innerHTML = h;
  initMap(zoomSido ? decodeURIComponent(zoomSido) : null);
}
function initMap(zoomSido){
  var M = window.__MAP__, idx = buildMapIdx();
  var svg = document.getElementById('map'), tip = document.getElementById('gtip');
  var VB0 = M.vb.slice(), curVB = VB0.slice();
  function fitMap(){ var top = svg.getBoundingClientRect().top; var hpx = Math.max(380, window.innerHeight - top - 24); svg.style.height = hpx+'px'; }
  var parts = ['<g id="mFill">'];
  idx.forEach(function(x, i){
    var g = x.b && x.b.report && x.b.report.grade;
    var fill = g ? GRADE_FILL[g] : '#C4BFB8';
    var al = x.u.s+' '+x.u.n+(g?' 세금 성적표 '+g+'등급':'');
    parts.push('<path class="mn" data-i="'+i+'" d="'+x.u.d+'" fill="'+fill+'" opacity="'+(g?0.92:0.5)+'" tabindex="0" role="link" aria-label="'+esc(al)+'"></path>');
  });
  parts.push('</g><g id="mLine">');
  M.sido.forEach(function(s2){ parts.push('<path class="sd" d="'+s2.d+'"></path>'); });
  parts.push('</g><g id="mLbS">');
  M.sido.forEach(function(s2){ parts.push('<text x="'+s2.lb[0]+'" y="'+s2.lb[1]+'" text-anchor="middle">'+esc(s2.s)+'</text>'); });
  parts.push('</g><g id="mLbM"></g>');
  svg.innerHTML = parts.join('');
  var lbM = svg.querySelector('#mLbM');
  function setVB(vb){
    curVB = vb;
    svg.setAttribute('viewBox', vb.join(' '));
    var u = vb[2] / svg.clientWidth;
    var k = vb[2] / VB0[2];
    svg.querySelectorAll('#mLbS text').forEach(function(t){
      t.style.fontSize = (14.5*u).toFixed(4);
      t.style.strokeWidth = (3*u).toFixed(4);
      t.style.opacity = k < 0.22 ? 0 : Math.min(1, (k-0.1)*1.8);
    });
    var frag = '';
    idx.forEach(function(x){
      var wpx = x.u.bb[2] / u;
      if (wpx < 46) return;
      if (x.u.lb[0] < vb[0] || x.u.lb[0] > vb[0]+vb[2] || x.u.lb[1] < vb[1] || x.u.lb[1] > vb[1]+vb[3]) return;
      var fs = Math.min(12.5, 10.5 + (wpx-46)/60) * u;
      var gl2 = x.b && x.b.report && x.b.report.grade;
      frag += '<text x="'+x.u.lb[0]+'" y="'+x.u.lb[1]+'" text-anchor="middle" style="font-size:'+fs.toFixed(4)+'; stroke-width:'+(2.2*u).toFixed(4)+'; font-weight:600">'+esc(x.u.n)+'</text>';
    });
    lbM.innerHTML = frag;
  }
  function zoomTo(bb, pad){
    pad = pad==null ? 0.12 : pad;
    var px = bb[2]*pad, py = bb[3]*pad;
    var vb = [bb[0]-px, bb[1]-py, bb[2]+px*2, bb[3]+py*2];
    var ar = svg.clientWidth / svg.clientHeight, vbar = vb[2]/vb[3];
    if (vbar < ar){ var w2 = vb[3]*ar; vb[0] -= (w2-vb[2])/2; vb[2] = w2; }
    else { var h2 = vb[2]/ar; vb[1] -= (h2-vb[3])/2; vb[3] = h2; }
    setVB(vb);
  }
  function sidoBBox(sd){
    var xs=[],ys=[],xe=[],ye=[];
    idx.forEach(function(x){ if (x.u.s!==sd) return; xs.push(x.u.bb[0]); ys.push(x.u.bb[1]); xe.push(x.u.bb[0]+x.u.bb[2]); ye.push(x.u.bb[1]+x.u.bb[3]); });
    if (!xs.length) return null;
    var x0=Math.min.apply(null,xs), y0=Math.min.apply(null,ys);
    return [x0, y0, Math.max.apply(null,xe)-x0, Math.max.apply(null,ye)-y0];
  }
  fitMap();
  window.addEventListener('resize', function(){ fitMap(); setVB(curVB); });
  requestAnimationFrame(function(){
    if (zoomSido){ var bb = sidoBBox(zoomSido); if (bb){ zoomTo(bb); return; } }
    setVB(VB0.slice());
  });
  svg.addEventListener('pointermove', function(e){
    var p = e.target.closest && e.target.closest('path.mn');
    if (!p){ tip.style.display='none'; return; }
    var x = idx[+p.dataset.i];
    var g = x.b && x.b.report && x.b.report.grade;
    var showNm = (x.u.s==='인천'&&x.u.n==='남구')?'미추홈구':x.u.n;
    tip.innerHTML = '<b>'+esc(x.u.s)+' '+esc(showNm)+'</b>' + (x.b ? ' — '+(g?('등급 '+g):'등급 없음')+'<br>자립도 '+pct(x.b.jarip25)+' · 1인당 지방세 '+(x.b.pc26?fmtManFromChun(x.b.pc26.pc):'—') : '<br>행정시·직할 — 광역 페이지로 이동');
    tip.style.display='block';
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var lx = e.clientX+14, ly = e.clientY+14;
    if (lx+tw > window.innerWidth-8) lx = e.clientX-tw-10;
    if (ly+th > window.innerHeight-8) ly = e.clientY-th-10;
    tip.style.left = lx+'px'; tip.style.top = ly+'px';
  });
  svg.addEventListener('pointerleave', function(){ tip.style.display='none'; });
  window.addEventListener('blur', function(){ tip.style.display='none'; });
  var drag = null;
  svg.addEventListener('pointerdown', function(e){
    drag = {x:e.clientX, y:e.clientY, vb:curVB.slice(), target:e.target.closest&&e.target.closest('path.mn'), moved:false, id:e.pointerId};
  });
  svg.addEventListener('pointermove', function(e){
    if (!drag) return;
    var dx = e.clientX-drag.x, dy = e.clientY-drag.y;
    if (!drag.moved && Math.hypot(dx,dy) > 4){ drag.moved = true; try{ svg.setPointerCapture(drag.id); }catch(err){} svg.style.cursor='grabbing'; }
    if (drag.moved){
      var u = drag.vb[2]/svg.clientWidth;
      setVB([drag.vb[0]-dx*u, drag.vb[1]-dy*u, drag.vb[2], drag.vb[3]]);
    }
  });
  svg.addEventListener('pointerup', function(e){
    if (drag && !drag.moved && drag.target){
      tip.style.display='none';
      var x = idx[+drag.target.dataset.i];
      if (x.cd) location.hash = '#/gu/'+x.cd;
      else location.hash = '#/sido/'+x.govKey;
    }
    svg.style.cursor='grab'; drag = null;
  });
  svg.addEventListener('pointercancel', function(){ drag=null; svg.style.cursor='grab'; });
  svg.addEventListener('wheel', function(e){
    e.preventDefault();
    var f = e.deltaY > 0 ? 1.18 : 1/1.18;
    var nw = curVB[2]*f;
    if (nw < VB0[2]*0.03 || nw > VB0[2]*1.6) return;
    var r = svg.getBoundingClientRect();
    var mx = curVB[0] + (e.clientX-r.left)/r.width*curVB[2];
    var my = curVB[1] + (e.clientY-r.top)/r.height*curVB[3];
    var nh = curVB[3]*f;
    setVB([mx-(mx-curVB[0])*f, my-(my-curVB[1])*f, nw, nh]);
  }, {passive:false});
  document.getElementById('mjump').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.zm){
      var f = b.dataset.zm==='in' ? 1/1.35 : 1.35;
      var nw = curVB[2]*f; if (nw < VB0[2]*0.03 || nw > VB0[2]*1.6) return;
      var cx = curVB[0]+curVB[2]/2, cy = curVB[1]+curVB[3]/2;
      setVB([cx-nw/2, cy-curVB[3]*f/2, nw, curVB[3]*f]);
      return;
    }
    var z = b.dataset.z;
    if (z===''){ setVB(VB0.slice()); return; }
    var bb = sidoBBox(z); if (bb) zoomTo(bb);
  });
  svg.addEventListener('keydown', function(e){
    if (e.key!=='Enter' && e.key!==' ') return;
    var p = e.target.closest && e.target.closest('path.mn'); if (!p) return;
    e.preventDefault();
    var x = idx[+p.dataset.i];
    if (x.cd) location.hash = '#/gu/'+x.cd; else location.hash = '#/sido/'+x.govKey;
  });
}

/* ---------- 산점도 (동급 속 위치) ---------- */
function scatterPeers(b){
  var type = b.report && b.report.peerType; if (!type) return '<div class="muted">데이터가 없어요.</div>';
  var peers = Object.keys(D.basic).map(function(cd){ return D.basic[cd]; }).filter(function(x){ return x.report && x.report.peerType===type && x.jarip25!=null && x.pc26 && x.pc26.pc; });
  if (peers.length < 5) return '<div class="muted">데이터가 부족해요.</div>';
  var xs = peers.map(function(p){return p.jarip25;}), ys = peers.map(function(p){return p.pc26.pc;});
  var x0 = Math.min.apply(null,xs), x1 = Math.max.apply(null,xs);
  var y1 = Math.max.apply(null,ys);
  var W2=560, H2=200, pl=40, pb=24, pt=10, pr=12;
  function X(v){ return pl + (v-x0)/(x1-x0||1)*(W2-pl-pr); }
  function Y(v){ return pt + (1 - v/(y1||1))*(H2-pt-pb); }
  var out = '<svg class="chart" viewBox="0 0 '+W2+' '+H2+'" role="img" aria-label="동급 산점도">';
  out += '<line x1="'+pl+'" y1="'+(H2-pb)+'" x2="'+(W2-pr)+'" y2="'+(H2-pb)+'" stroke="var(--rule)"/>';
  out += '<line x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(H2-pb)+'" stroke="var(--rule)"/>';
  peers.forEach(function(p){
    var me = p===b || (p.full===b.full);
    if (me) return;
    out += '<circle cx="'+X(p.jarip25).toFixed(1)+'" cy="'+Y(p.pc26.pc).toFixed(1)+'" r="3" fill="var(--ink3)" opacity=".45"><title>'+esc(fullNm(p))+' — 자립도 '+p.jarip25+'% · 1인당 '+fmtManFromChun(p.pc26.pc)+'</title></circle>';
  });
  if (b.jarip25!=null && b.pc26) out += '<circle cx="'+X(b.jarip25).toFixed(1)+'" cy="'+Y(b.pc26.pc).toFixed(1)+'" r="6" fill="var(--accent)" stroke="var(--bg)" stroke-width="2"><title>'+esc(fullNm(b))+'</title></circle>';
  out += '<text x="'+(W2-pr)+'" y="'+(H2-8)+'" font-size="10.5" fill="var(--ink3)" text-anchor="end">재정자립도 →</text>';
  out += '<text x="'+(pl-6)+'" y="'+(pt+8)+'" font-size="10.5" fill="var(--ink3)" text-anchor="end">1인당↑</text>';
  out += '</svg>';
  return out;
}

/* ---------- 비교함 + 공유 ---------- */
function getCmp(){ try { return JSON.parse(localStorage.getItem('uri_cmp')||'[]'); } catch(e){ return []; } }
function setCmp(a){ localStorage.setItem('uri_cmp', JSON.stringify(a.slice(0,3))); updateCmpChip(); }
function addCmp(cd){
  var a = getCmp();
  if (a.indexOf(cd)>=0){ msgCmp('이미 비교함에 있어요'); location.hash='#/compare'; return; }
  if (a.length>=3){ msgCmp('비교함은 3곳까지예요 — 비교함에서 빼고 다시 담아주세요'); return; }
  a.push(cd); setCmp(a);
  msgCmp('담았어요 ('+a.length+'/3)'+(a.length>=2?' — 상단 비교함에서 보세요':''));
}
function msgCmp(t){ var el = document.getElementById('cmpMsg'); if (el) el.textContent = t; }
function updateCmpChip(){
  var nav = document.querySelector('nav.tabs .wrap'); if (!nav) return;
  var chip = document.getElementById('cmpChip');
  var n = getCmp().length;
  if (!n){ if (chip) chip.remove(); return; }
  if (!chip){ chip = document.createElement('a'); chip.id='cmpChip'; chip.href='#/compare'; chip.style.marginLeft='auto'; chip.style.color='var(--accent)'; nav.appendChild(chip); }
  chip.textContent = '비교함 '+n;
}
function summaryText(cd){
  var b = D.basic[cd]; if (!b) return '';
  var r = b.report||{};
  var l1 = b.sido+' '+b.name+' 세금 성적표: '+(r.grade||'—')+'등급 ('+(r.peerType||'')+' '+(r.peerN||'')+'곳 중 백분위 평균 '+(r.score!=null?r.score:'—')+'점)';
  var l2 = '재정자립도 '+pct(r.jarip)+' · 체납 잔액 비율 '+pct(r.chRatio)+' · 지방세 5년 성장 '+(r.growth!=null?(r.growth>0?'+':'')+r.growth.toFixed(1)+'%':'—');
  var l3 = '1인당 지방세 '+(b.pc26?fmtManFromChun(b.pc26.pc):'—')+' · 자세히: 우리동네 이야기 #/gu/'+cd;
  return l1+'\n'+l2+'\n'+l3;
}
function copySummary(cd){
  var t = summaryText(cd);
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ msgCmp('복사했어요 — 카톡에 붙여넣으면 돼요'); }, function(){ msgCmp('복사 실패'); });
}
function renderCompare(){
  document.title = '비교함 — 우리동네 이야기';
  var a = getCmp().filter(function(cd){ return D.basic[cd]; });
  var h = '<div class="crumb"><a href="#">홈</a> › 비교함</div>';
  h += '<section style="margin-top:8px"><h1>⚖️ 두 동네 나란히 보기</h1><p class="lead">동네 페이지에서 "비교함에 담기"를 누르면 최대 3곳까지 나란히 볼 수 있어요. 구와 군처럼 유형이 다르면 등급 기준도 달라요.</p></section>';
  if (!a.length){ h += '<div class="rule-card">아직 비어 있어요. 아무 동네나 검색해서 담아보세요.</div>'; APP.innerHTML = h; return; }
  var rows = [
    ['세금 성적표', function(b){ var r=b.report||{}; return r.grade?'<b style="color:'+GRADE_FILL[r.grade]+'">'+r.grade+'</b> ('+r.score+'점 · '+r.peerType+' 기준)':'—'; }],
    ['재정자립도 (2025)', function(b){ return pct(b.jarip25); }],
    ['체납 잔액 비율 (2024)', function(b){ return b.report?pct(b.report.chRatio):'—'; }],
    ['지방세 5년 성장', function(b){ var g=b.report&&b.report.growth; return g!=null?(g>0?'+':'')+g.toFixed(1)+'%':'—'; }],
    ['지방세 2024 결산', function(b){ return fmtWon(b.tax&&b.tax[2024]); }],
    ['1인당 지방세 (2026)', function(b){ return b.pc26?fmtManFromChun(b.pc26.pc):'—'; }],
    ['인구 (2026)', function(b){ return b.pc26&&b.pc26.pop?b.pc26.pop.toLocaleString()+'명':'—'; }],
    ['단체장 몷 업무추진비', function(b){ return b.wallet&&b.wallet.giwan?fmtWon(b.wallet.giwan.chief):'—'; }],
    ['행사·축제비 비율', function(b){ return b.wallet&&b.wallet.festa?pct(b.wallet.festa.rt,2):'—'; }],
    ['음식점 영업 중 (서울만)', function(b){ var g=b.sido==='서울'&&D.seoulCommerce.byCat['일반음식점'].gu[b.name]; return g?g.open.toLocaleString()+'곳':'—'; }]
  ];
  h += '<div class="rule-card" style="overflow-x:auto"><table class="tn"><tr><th style="min-width:130px">지표</th>';
  a.forEach(function(cd){ var b=D.basic[cd]; h += '<th class="right" style="min-width:110px"><a class="lk" href="#/gu/'+cd+'">'+esc(fullNm(b))+'</a><br><button class="footnote-btn" onclick="setCmp(getCmp().filter(function(x){return x!==\''+cd+'\'})); route();" style="font-size:11px; color:var(--neg)">빼기</button></th>'; });
  h += '</tr>';
  rows.forEach(function(row){ h += '<tr><td class="muted">'+row[0]+'</td>'+a.map(function(cd){ return '<td class="right">'+row[1](D.basic[cd])+'</td>'; }).join('')+'</tr>'; });
  h += '</table></div>';
  h += '<p class="fine">등급은 같은 유형(광역/시/군/구) 안에서만 매겨져요. 금액 지표는 규모 차이가 커서 인구·1인당 지표와 교차해 보세요.</p>';
  APP.innerHTML = h;
}


/* ---------- 전국 상권 데이터 로더 ---------- */
var NATION=null, BRANDS=null, ADDR2={};
function loadNation(){ if (NATION) return Promise.resolve(NATION);
  if (window.__PRE__ && window.__PRE__.nation){ NATION=window.__PRE__.nation; return Promise.resolve(NATION); }
  return fetch('commerce-nation.json?v=3').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){NATION=j;return j;}); }
var BRAND_REGION=null;
function loadBrandRegion(){ if (BRAND_REGION) return Promise.resolve(BRAND_REGION);
  if (window.__PRE__ && window.__PRE__.brandRegion){ BRAND_REGION=window.__PRE__.brandRegion; return Promise.resolve(BRAND_REGION); }
  return fetch('brands-region.json?v=1').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){BRAND_REGION=j;return j;}); }
function loadBrands(){ if (BRANDS) return Promise.resolve(BRANDS);
  if (window.__PRE__ && window.__PRE__.brands){ BRANDS=window.__PRE__.brands; return Promise.resolve(BRANDS); }
  return fetch('brands.json?v=2').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){BRANDS=j;return j;}); }
var ADDR_CODE={'1':'일반음식점','2':'카페·휴게음식점','3':'제과점','4':'미용실','5':'숙박업','6':'즉석판매(반찬·떡집)'};
function loadAddr2(key){
  if (ADDR2[key]) return Promise.resolve(ADDR2[key]);
  return fetch('addr2/'+encodeURIComponent(key.replace('|','_'))+'.json?v=3').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
    Object.keys(j).forEach(function(a){
      var recs = j[a].map(function(r){
        return {nm:r.n||r.nm||'', c:ADDR_CODE[r.c]||r.c||'', u:r.u||'', o:r.o||'', x:r.x||'', a:r.a?1:0};
      });
      // 같은 상호가 짧은 간격으로 재등록된 체인은 하나로 합쳐요 (임시·갱신 등록이 교체 횟수를 부풀리는 문제)
      recs.sort(function(p,q){ return (p.o||'').localeCompare(q.o||''); });
      var mm = function(ym){ if(!ym) return null; var t=ym.split('-'); return (+t[0])*12 + (+t[1]||1); };
      var merged = [], byName = {};
      recs.forEach(function(r){
        var prev = byName[r.nm];
        if (prev && r.nm){
          var gap = (mm(r.o)!=null && mm(prev.x)!=null) ? mm(r.o)-mm(prev.x) : (mm(r.o)!=null && mm(prev.o)!=null ? mm(r.o)-mm(prev.o) : null);
          if (gap!=null && gap <= 3){
            if (r.x && (!prev.x || r.x > prev.x)) prev.x = r.x;
            if (r.a) { prev.a = 1; prev.x = ''; }
            prev.merged = (prev.merged||1) + 1;
            return;
          }
        }
        merged.push(r); byName[r.nm] = r;
      });
      j[a] = merged;
    });
    ADDR2[key]=j; return j;
  });
}
function unitKeyOf(param){
  if (D.basic[param]) return D.basic[param].sido+'|'+D.basic[param].name;
  if (param && param.indexOf('|')>=0) return param;
  if (param && D.seoulCommerce.byCat['일반음식점'].gu[param]) return '서울|'+param; // 레거시 서울 구 이름
  return null;
}
function backCdOf(key){
  var sido=key.split('|')[0], nm=key.split('|')[1];
  var cd=Object.keys(D.basic).filter(function(c){return D.basic[c].sido===sido&&D.basic[c].name===nm;})[0];
  return cd||null;
}



var CAT_EMO = {"DVD·비디오방": "📼", "PC방": "🖥️", "간판·광고업": "🪧", "겨울스포츠시설": "⛷️", "골프연습장": "🏌️", "골프장": "⛳", "공연장": "🎭", "관광식당": "🍽️", "관광펜션": "🏡", "관광호텔": "🏨", "구내식당": "🍱", "노래방": "🎤", "농어촌민박": "🌾", "단란주점": "🍻", "담배소매(편의점 프록시)": "🏪", "당구장": "🎱", "대형마트·백화점": "🏬", "도시민박(게스트하우스)": "🛏️", "동물병원": "🐾", "동물생산업(번식장)": "🐕", "동물약국": "💊", "동물카페·전시": "🐇", "멀티방·복합게임장": "🕹️", "목욕탕·사우나": "🛁", "무도장·댄스학원": "💃", "미용실": "💇", "박물관·미술관": "🖼️", "반려동물 장묘": "🕊️", "병원": "🏥", "산후조리원": "🍼", "상조업": "🕯️", "성인게임장": "🎰", "세탁소": "🧺", "수영장": "🏊", "숙박업": "🛎️", "승마장": "🐎", "안경점": "👓", "안마·의료유사업": "💆", "애견미용": "✂️", "애견호텔·유치원": "🐩", "약국": "💊", "여행사": "✈️", "영화관": "🎬", "오락실": "👾", "요트장": "⛵", "유흥주점": "🍸", "의원": "🩺", "이발소": "💈", "인쇄소": "🖨️", "일반음식점": "🍚", "자판기": "🥤", "전통사찰": "🛕", "정육점": "🥩", "제과점": "🥐", "종량제봉투 판매소": "🗑️", "종합체육시설": "🏟️", "주유소": "⛽", "즉석판매(반찬·떡집)": "🍢", "직업소개소": "📋", "체육도장(태권도 등)": "🥋", "카페·휴게음식점": "☕", "캠핑장": "🏕️", "테마파크": "🎡", "펫샵": "🐶", "편의점 상비약": "🩹", "한옥체험": "🏯", "헬스장": "🏋️"};
function catEmo(c){ return CAT_EMO[c] || '🏬'; }
function catLabel(c){ return '<span class="cemo">'+catEmo(c)+'</span>'+esc(c); }
function catAggScope(N, pick){
  var agg={};
  Object.keys(N.units).forEach(function(k){
    if (pick && !pick(k)) return;
    var cs=N.units[k].cats;
    Object.keys(cs).forEach(function(c){
      var a=agg[c]||(agg[c]={open:0,o25:0,x25:0});
      a.open+=cs[c].open; a.o25+=(+cs[c].ob['2025']||0); a.x25+=(+cs[c].cb['2025']||0);
    });
  });
  var out={};
  Object.keys(agg).forEach(function(c){
    var a=agg[c], net=a.o25-a.x25;
    out[c]={c:c, open:a.open, o:a.o25, x:a.x25, net:net, rate: a.open? net/a.open*100 : 0};
  });
  return out;
}
function catAggNation(N){
  var agg={};
  Object.keys(N.units).forEach(function(k){
    var cs=N.units[k].cats;
    Object.keys(cs).forEach(function(c){
      var a=agg[c]||(agg[c]={open:0,o25:0,x25:0});
      a.open+=cs[c].open; a.o25+=(+cs[c].ob['2025']||0); a.x25+=(+cs[c].cb['2025']||0);
    });
  });
  return Object.keys(agg).map(function(c){
    var a=agg[c], net=a.o25-a.x25;
    return {c:c, open:a.open, o:a.o25, x:a.x25, net:net, rate: a.open? net/a.open*100 : 0};
  }).sort(function(p,q){ return q.rate-p.rate; });
}

/* ---------- 업종 그룹 (MECE) ---------- */
var CAT_GROUPS = [
  ['먹고 마시기', ['일반음식점','카페·휴게음식점','제과점','즉석판매(반찬·떡집)','정육점','구내식당','관광식당','단란주점','유흥주점']],
  ['몸과 건강', ['의원','병원','약국','안경점','산후조리원','안마·의료유사업','헬스장','체육도장(태권도 등)','수영장','골프연습장','당구장']],
  ['꾸미기와 생활', ['미용실','이발소','세탁소','목욕탕·사우나','주유소','대형마트·백화점','담배소매(편의점 프록시)','편의점 상비약','자판기','종량제봉투 판매소','인쇄소','간판·광고업','직업소개소','상조업']],
  ['놀기와 쉬기', ['PC방','노래방','오락실','성인게임장','멀티방·복합게임장','DVD·비디오방','무도장·댄스학원','영화관']],
  ['여행과 숙박', ['숙박업','관광호텔','도시민박(게스트하우스)','농어촌민박','관광펜션','한옥체험','캠핑장','여행사']],
  ['문화와 레저', ['박물관·미술관','공연장','테마파크','전통사찰','골프장','겨울스포츠시설','승마장','요트장','종합체육시설']],
  ['반려동물', ['동물병원','동물약국','애견미용','펫샵','애견호텔·유치원','동물카페·전시','동물생산업(번식장)','반려동물 장묘']]
];
function catRow(c, g){
  if (!g) return '';
  var o=+g.ob['2025']||0, x=+g.cb['2025']||0, net=o-x;
  var rate = g.open ? net/g.open*100 : null;
  return '<tr><td>'+catLabel(c)+'</td><td class="right">'+fmtN(g.open)+'</td><td class="right opt">'+fmtN(o)+'</td><td class="right opt">'+fmtN(x)+'</td>'
    +'<td class="right"><b class="'+(net>=0?'pos':'neg')+'">'+(net>0?'+':'')+fmtN(net)+'</b></td>'
    +'<td class="right '+(rate>=0?'pos':'neg')+'">'+(rate!=null?(rate>0?'+':'')+rate.toFixed(1)+'%':'—')+'</td>'
    +'<td class="right">'+(g.med?Math.round(g.med/12*10)/10+'년':'—')+'</td></tr>';
}
function catTable(u, list){
  var rows = list.map(function(c){ return catRow(c, u.cats[c]); }).filter(Boolean).join('');
  if (!rows) return '';
  return '<table class="tn"><tr><th>업종</th><th class="right">영업 중</th><th class="right opt">25개업</th><th class="right opt">25폐업</th><th class="right">순증감</th><th class="right">영업 중 대비</th><th class="right">폐업 중위</th></tr>'+rows+'</table>';
}

/* ---------- 상권 이야기 (전국) ---------- */
function bizSectionsHTML(u, key, opts){
  opts = opts || {};
  var nm=key.split('|')[1];
  var h = '';
  var upKeys = Object.keys(u.up||{});
  if (upKeys.length){
    h += '<section><h2><span class="emo">🍜</span>어떤 음식점이 많을까 <small>업태구분 · 영업 중 상위</small></h2><div class="rule-card" style="overflow-x:auto"><table class="tn"><tr><th>업태</th><th class="right">영업 중</th><th class="right">2025 개업</th><th class="right">2025 폐업</th><th class="right">순증감</th></tr>';
    upKeys.forEach(function(k){ var v=u.up[k]; var net=v.o25-v.x25;
      h += '<tr><td>'+esc(k)+'</td><td class="right">'+fmtN(v.open)+'</td><td class="right">'+v.o25+'</td><td class="right">'+v.x25+'</td><td class="right"><b class="'+(net>=0?'pos':'neg')+'">'+(net>0?'+':'')+net+'</b></td></tr>'; });
    h += '</table><div class="fine">치킨집은 주로 "호프/통닭"·"통닭(치킨)", 분식은 "분식" 업태로 신고돼요.</div></div></section>';
  }
  var haveCats = [];
  CAT_GROUPS.forEach(function(G){ G[1].forEach(function(c){ if (u.cats[c] && u.cats[c].open>0) haveCats.push(c); }); });
  if (haveCats.length){
    h += '<section><h2><span class="emo">🔄</span>새로 열고, 문 닫고 <small>업종을 골라 보세요</small></h2>';
    h += '<div style="margin-bottom:10px"><select id="trendSel" class="search" style="max-width:280px; padding:8px 12px; font-size:14px" aria-label="업종 선택">';
    haveCats.forEach(function(c){ h += '<option value="'+esc(c)+'"'+(c==='일반음식점'?' selected':'')+'>'+esc(c)+'</option>'; });
    h += '</select></div><div id="trendBox"></div></section>';
  }
  if (u.surv){
    h += '<section><h2><span class="emo">📉</span>몇 년이나 버틸까 <small>음식점·카페 · 2019~2020 개업 '+u.surv.n.toLocaleString()+'곳 추적</small></h2><div class="grid g2">';
    h += '<div class="rule-card">'+lineChart(u.surv.s.map(function(v,i){return {x:i+'년', v:v};}),{fmt:function(v){return v.toFixed(0)+'%';},label:'생존곡선',color:'#9a3412'})+'<div class="fine">표본 '+u.surv.n.toLocaleString()+'곳 · 개업 후 n년을 넘긴 비율이에요. 영업 중 가게는 관측중단 처리했고, 신뢰구간은 계산하지 않았습니다.'+(u.surv.n<300?' <b>표본이 300곳 미만이라 흔들릴 수 있어요.</b>':'')+'</div></div>';
    h += '<a class="rule-card" href="#/spot/'+encodeURIComponent(opts.cd||key)+'" style="display:flex; flex-direction:column; justify-content:center"><h3 class="lk">그 자리, 뭐가 있었지? →</h3><p class="muted" style="margin-top:6px">'+esc(nm)+'의 주소·가게 이름을 검색하면 그 자리의 업소 연대기와 자리 위험도를 보여드려요.</p></a>';
    h += '</div></section>';
  }
  h += '<div id="brandBox"></div>';
  h += '<div id="churnBox"></div>';
  h += '<section><h2><span class="emo">🏪</span>가게 흥망사 <small>인허가 데이터 · 기준 2026-08</small></h2>';
  h += '<p class="muted" style="margin:-6px 0 12px">개업·폐업 신고 전 이력으로 계산했어요. 사장님이 바뀌어도 인허가가 유지되면 같은 가게로 셉니다.</p>';
  CAT_GROUPS.forEach(function(G){
    var t = catTable(u, G[1]);
    if (!t) return;
    h += '<div class="rule-card" style="margin-bottom:10px; overflow-x:auto"><h3 style="border-bottom:2px solid var(--ink); padding-bottom:7px; margin-bottom:8px">'+esc(G[0])+'</h3>'+t+'</div>';
  });
  h += '<p class="fine">"영업 중 대비"는 2025년 순증감 ÷ 현재 영업 중 업소 수예요. 폐업 중위 기간은 이미 폐업한 업소 기준이라, 오래 버티는 중인 가게가 많을수록 실제 수명은 더 길어요.</p></section>';
  return h;
}
function bindBizSections(u, key){
  var sel = document.getElementById('trendSel');
  function drawTrend(){
    var c = sel ? sel.value : '일반음식점';
    var g = u.cats[c]; var box = document.getElementById('trendBox');
    if (!g || !box) return;
    var yrs=[]; for (var y=2015;y<=2026;y++) yrs.push(y);
    var th = '<div class="grid g2">';
    th += '<div class="rule-card"><h3>개업 <span class="muted" style="font-weight:400">'+esc(c)+'</span></h3>'+barLine(yrs.map(function(y2){return {x:y2, v:+g.ob[String(y2)]||0};}),{fmt:function(v){return v+'곳';},zero:true,label:'개업'})+'</div>';
    th += '<div class="rule-card"><h3>폐업 <span class="muted" style="font-weight:400">'+esc(c)+'</span></h3>'+barLine(yrs.map(function(y2){return {x:y2, v:+g.cb[String(y2)]||0};}),{fmt:function(v){return v+'곳';},zero:true,color:'#B3261E',label:'폐업'})+'</div>';
    th += '</div><p class="fine">2026년은 8월 중순까지의 부분 집계라 낮아 보여요. 개업은 인허가일, 폐업은 신고일 기준이에요.</p>';
    box.innerHTML = th;
  }
  if (sel) sel.addEventListener('change', drawTrend);
  drawTrend();
  loadBrandRegion().then(function(BR){
    var rows = BR.unitTop[key]; var bb = document.getElementById('brandBox');
    if (!rows || !rows.length || !bb) return;
    var max = rows[0][1];
    var bh = '<section><h2><span class="emo">🏷️</span>이 동네 브랜드 <small>영업 중 인허가 건수 기준 · 상위 '+rows.length+'개</small></h2><div class="rule-card">';
    rows.forEach(function(r){
      var w = (r[1]/max*100).toFixed(1);
      bh += '<div style="display:flex; align-items:center; gap:10px; padding:5px 0; border-bottom:1px dashed var(--rule2)">';
      bh += '<a class="lk" href="#/brand/'+encodeURIComponent(r[0])+'" style="width:130px; font-size:13px; font-weight:600; flex-shrink:0">'+esc(r[0])+'</a>';
      bh += '<div class="bar" style="flex:1; height:14px"><i style="width:'+w+'%; background:var(--accent)"></i></div>';
      bh += '<b class="tn" style="width:52px; text-align:right; font-size:12.5px">'+fmtN(r[1])+'곳</b></div>';
    });
    bh += '<div class="fine">'+esc(BR.note)+' 브랜드 이름을 누르면 전국 분포를 볼 수 있어요.</div></div></section>';
    bb.innerHTML = bh;
  }).catch(function(){});
  loadAddr2(key).then(function(book){
    var arr=[];
    Object.keys(book).forEach(function(a){ if (book[a].length>=4) arr.push({addr:a, n:book[a].length, tl:book[a]}); });
    arr.sort(function(x,y){return y.n-x.n;});
    var cb = document.getElementById('churnBox');
    if (!arr.length || !cb) return;
    var ch = '<section><h2><span class="emo">🚪</span>주인이 자주 바뀐 자리 <small>같은 자리에서 가게가 가장 많이 바뀐 곳</small></h2><div class="grid g3">';
    arr.slice(0,3).forEach(function(a){
      ch += '<div class="rule-card"><div style="font-weight:700; font-size:13.5px">'+esc(a.addr)+'</div><div class="muted tn" style="margin:2px 0 12px">기록 '+a.n+'개</div><div class="timeline">';
      a.tl.slice().sort(function(p,q){return (q.o||'').localeCompare(p.o||'');}).slice(0,6).forEach(function(t){
        ch += '<div class="ev'+(t.a?'':' dead')+'"><div class="what">'+esc(t.nm||'(상호 미기재)')+'<span class="st '+(t.a?'live':'dead')+'">'+(t.a?'영업 중':'폐업')+'</span>'+(t.merged?'<span class="muted" style="font-size:11px; margin-left:6px">재등록 '+t.merged+'회 합침</span>':'')+'</div><div class="when tn">'+esc(t.u||t.c)+' · '+esc(t.o||'?')+(t.x?' → '+esc(t.x):'')+'</div></div>';
      });
      ch += '</div></div>';
    });
    ch += '</div><p class="fine">지번 기준으로 층·호를 지워 묶었어요. 큰 건물은 여러 가게가 한 지번을 써요. 같은 상호가 짧은 간격으로 재등록된 건 하나로 합쳤어요.</p></section>';
    cb.innerHTML = ch;
  }).catch(function(){});
}
function renderBizN(param){
  var key = unitKeyOf(decodeURIComponent(param));
  if (!key){ APP.innerHTML = '<div class="skel">해당 지역을 찾지 못했어요.</div>'; return; }
  var cdB = backCdOf(key);
  if (cdB){ location.hash = '#/gu/'+cdB; return; }
  var sido=key.split('|')[0], nm=key.split('|')[1];
  document.title = sido+' '+nm+' 가게 흥망사 — 우리동네 이야기';
  APP.innerHTML = '<div class="skel">'+esc(nm)+' 가게 데이터를 불러오는 중이에요…</div>';
  loadNation().then(function(N){
    var u = N.units[key];
    if (!u){ APP.innerHTML = '<div class="skel">이 지역 상권 데이터가 없어요.</div>'; return; }
    var h = '<div class="crumb"><a href="#">홈</a> › '+esc(sido+' '+nm)+'</div>';
    h += '<section style="margin-top:8px"><h1>'+esc(sido)+' '+esc(nm)+'</h1></section>';
    h += bizSectionsHTML(u, key, {});
    APP.innerHTML = h;
    bindBizSections(u, key);
  }).catch(function(){ APP.innerHTML = '<div class="rule-card">상권 데이터는 로컬 서버나 호스팅 환경에서만 불러와져요.</div>'; });
}

function spotSido(s2){
  window.__spotSido = s2 || null;
  if (location.hash.indexOf('#/spot/') === 0){ location.hash = '#/spot'; }
  else { route(); }
}
function renderSpotN(param){
  document.title = '그 자리, 뭐가 있었지? — 우리동네 이야기';
  var key = param ? unitKeyOf(decodeURIComponent(param)) : null;
  var h = '<div class="crumb"><a href="#">홈</a> › 그 자리, 뭐가 있었지?</div>';
  h += '<section style="margin-top:8px"><h1>🏪 이 자리엔 뭐가 있었지?</h1><p class="lead">한 자리에 어떤 가게들이 거쳐 갔는지 순서대로 보여드려요. 지역을 고르고 동 이름이나 가게 이름을 넣어보세요.</p>';
  var sidoOrder3 = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
  var selSido = key ? key.split('|')[0] : (window.__spotSido||null);
  h += '<div class="chiprow" style="margin-top:16px">';
  sidoOrder3.forEach(function(s2){ h += '<a class="chip'+(s2===selSido?' on':'')+'" onclick="spotSido(\''+s2+'\')">'+s2+'</a>'; });
  h += '</div>';
  if (selSido){
    var kids3 = Object.keys(D.basic).filter(function(c){return D.basic[c].sido===selSido;}).sort(function(a,b){return D.basic[a].name.localeCompare(D.basic[b].name,'ko');});
    var extras = selSido==='세종' ? ['세종|세종시'] : (selSido==='제주' ? ['제주|제주시','제주|서귀포시'] : []);
    h += '<div class="chiprow" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--rule2)">';
    kids3.forEach(function(c){ var k2=D.basic[c].sido+'|'+D.basic[c].name;
      h += '<a class="chip sm'+(key===k2?' on2':'')+'" href="#/spot/'+c+'">'+esc(D.basic[c].name)+'</a>'; });
    extras.forEach(function(k2){ h += '<a class="chip sm'+(key===k2?' on2':'')+'" href="#/spot/'+encodeURIComponent(k2)+'">'+esc(k2.split('|')[1])+'</a>'; });
    h += '</div>';
  }
  h += '</section><div id="spotBody">'+(key?'<div class="skel">주소를 불러오는 중이에요…</div>':'')+'</div>';
  APP.innerHTML = h;
  if (!key){
    var exGu='서울|마포구';
    loadAddr2(exGu).then(function(){}).catch(function(){});
    var ex=(D.seoulCommerce.topChurn['마포구']||[])[0];
    if (ex){
      var eh='<section><h2><span class="emo">💡</span>이런 걸 보여드려요 <small>예시 · 서울 마포구 최다 교체 주소</small></h2><div class="rule-card" style="max-width:560px">';
      eh+='<b style="font-size:14.5px">'+esc(ex.addr.replace('서울특별시 ',''))+'</b><div class="muted tn" style="margin:2px 0 12px">여기서만 '+ex.n+'번 명멸했어요</div><div class="timeline">';
      ex.timeline.slice().reverse().slice(0,4).forEach(function(t){ var al2=!t.cl;
        eh+='<div class="ev'+(al2?'':' dead')+'"><div class="what">'+esc(t.nm||'(상호 미기재)')+'<span class="st '+(al2?'live':'dead')+'">'+(al2?'영업 중':'폐업')+'</span></div><div class="when tn">'+esc(t.up||t.cat)+' · '+esc(t.op||'?')+(t.cl?' → '+esc(t.cl):'')+'</div></div>'; });
      eh+='</div><p class="muted" style="margin-top:8px">↑ 지역을 고르면 여러분 동네 주소로 이걸 찾을 수 있어요. 전국 브랜드 순위는 <a class="lk" href="#/brand" style="color:var(--accent)">브랜드 이야기 →</a></p></div></section>';
      eh+='<div id="natCat"></div>';
      document.getElementById('spotBody').innerHTML=eh;
      loadNation().then(function(N){
        var nat = catAggScope(N, null);
        var scopeName = selSido ? selSido : null;
        var loc = scopeName ? catAggScope(N, function(k){ return k.split('|')[0]===scopeName; }) : null;
        var src = loc || nat;
        var rows = Object.keys(src).map(function(c){ return src[c]; }).sort(function(p,q){ return q.rate-p.rate; });
        var title = scopeName ? esc(scopeName)+' 업종 흥망' : '전국 업종 흥망';
        var sub = scopeName ? '2025년 순증감 ÷ 영업 중 · 전국과 비교' : '37개 업종 · 2025년 순증감 ÷ 영업 중';
        var nh='<section><h2>'+title+' <small>'+sub+'</small></h2>';
        if (!scopeName) nh += '<p class="muted" style="margin:-6px 0 10px">위에서 지역을 고르면 그 지역 숫자와 전국 평균을 나란히 볼 수 있어요.</p>';
        nh += '<div class="rule-card" style="overflow-x:auto"><table class="tn"><tr><th>업종</th><th class="right">영업 중</th><th class="right opt">2025 개업</th><th class="right opt">2025 폐업</th><th class="right">순증감</th><th class="right">'+(scopeName?esc(scopeName):'전국')+' 증감률</th>'+(scopeName?'<th class="right opt">전국</th><th class="right">차이</th>':'')+'</tr>';
        rows.forEach(function(r){
          nh+='<tr><td>'+catLabel(r.c)+'</td><td class="right">'+fmtN(r.open)+'</td><td class="right opt">'+fmtN(r.o)+'</td><td class="right opt">'+fmtN(r.x)+'</td><td class="right"><b class="'+(r.net>=0?'pos':'neg')+'">'+(r.net>0?'+':'')+fmtN(r.net)+'</b></td>';
          var rw = Math.min(Math.abs(r.rate),50)/50*100;
          nh+='<td><div class="tbar mini"><span class="track"><i style="width:'+rw.toFixed(0)+'%; background:'+(r.rate>=0?'var(--pos)':'var(--neg)')+'"></i></span><b class="tbv tn '+(r.rate>=0?'pos':'neg')+'">'+(r.rate>0?'+':'')+r.rate.toFixed(1)+'%</b></div></td>';
          if (scopeName){
            var nr = nat[r.c] ? nat[r.c].rate : null;
            var diff = (nr!=null) ? r.rate-nr : null;
            nh+='<td class="right muted opt">'+(nr!=null?(nr>0?'+':'')+nr.toFixed(1)+'%':'—')+'</td>';
            var dcls = (diff==null||Math.abs(diff)<0.05)?'muted':(diff>0?'pos':'neg');
            var dtxt = (diff==null)?'—':(Math.abs(diff)<0.05?'비슷해요':(diff>0?'+':'')+diff.toFixed(1)+'%p');
            nh+='<td class="right"><b class="'+dcls+'">'+dtxt+'</b></td>';
          }
          nh+='</tr>';
        });
        nh+='</table><div class="fine">인허가 신고 기준이에요. 편의점은 담배소매 인허가를 프록시로 썼고, 한 매장이 여러 업종 인허가를 가질 수 있어요.'+(scopeName?' "차이"는 '+esc(scopeName)+' 증감률에서 전국 증감률을 뺀 값(%p)이라, 양수면 전국 평균보다 잘 버티는 업종이에요.':'')+'</div></div></section>';
        document.getElementById('natCat').innerHTML=nh;
      }).catch(function(){});
    }
    return;
  }
  var sido=key.split('|')[0], nm=key.split('|')[1];
  Promise.all([loadAddr2(key), loadNation().catch(function(){return null;})]).then(function(res){
    var book=res[0], N=res[1];
    var keys=Object.keys(book);
    var body=document.getElementById('spotBody');
    var bh='<section><h2>'+esc(sido)+' '+esc(nm)+' <small>기록 있는 주소 '+keys.length.toLocaleString()+'곳</small></h2>';
    bh+='<input class="search" id="spotQ" placeholder="동·번지나 가게 이름 (예: OO동 123, 국밥)" autocomplete="off">';
    bh+='<div id="spotList" style="margin-top:12px" role="region" aria-live="polite" aria-label="주소 검색 결과"></div></section>';
    body.innerHTML=bh;
    var q=document.getElementById('spotQ'), list=document.getElementById('spotList');
    var survGu = N && N.units[key] && N.units[key].surv;
    function riskOf(recs){
      var closed=recs.filter(function(r){return r.x;});
      var lifes=closed.map(function(r){return (new Date(r.x)-new Date(r.o))/2629800000;}).filter(function(m2){return m2>0;});
      var med=lifes.length?lifes.sort(function(a,b){return a-b;})[Math.floor(lifes.length/2)]:null;
      var sv=survGu?survGu.s[5]:45;
      var sc=35+Math.min(recs.length-2,8)*6+(med!=null?Math.max(0,(40-med))*0.7:0)+(45-sv)*0.6;
      return {score:Math.max(5,Math.min(95,Math.round(sc))), med:med, n:recs.length};
    }
    function show(qs){
      if (!qs||qs.length<2){ list.innerHTML='<p class="muted">두 글자 이상 입력하면 찾아드려요.</p>'; return; }
      var hits=[];
      for (var i=0;i<keys.length;i++){
        var k=keys[i];
        if (k.indexOf(qs)>=0){ hits.push(k); continue; }
        var recs=book[k];
        for (var j2=0;j2<recs.length;j2++){ if ((recs[j2].nm||'').indexOf(qs)>=0){ hits.push(k); break; } }
      }
      if (!hits.length){ list.innerHTML='<p class="muted">결과가 없어요. 지번 주소(동·리+번지) 기준이라 도로명으로는 안 찾아질 수 있어요.</p>'; return; }
      var lh='<p class="muted tn" style="margin-bottom:10px">총 <b>'+hits.length.toLocaleString()+'곳</b> 일치'+(hits.length>30?' · 앞 30곳만 보여드려요':'')+'</p><div class="grid g2">';
      hits.slice(0,30).forEach(function(k){
        var recs=book[k].slice().sort(function(a,b){return (a.o||'').localeCompare(b.o||'');});
        var risk=riskOf(recs);
        var alive=recs.filter(function(r){return r.a;});
        lh+='<div class="rule-card"><div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px">';
        lh+='<div><b style="font-size:14.5px">'+esc(k)+'</b><div class="muted tn">기록 '+risk.n+'개 · 영업 중 '+alive.length+'곳'+(risk.med!=null?' · 폐업까지 중위 '+Math.round(risk.med)+'개월':'')+'</div></div>';
        lh+='<div style="text-align:center; border:1.5px solid '+(risk.score>=60?'var(--neg)':risk.score>=40?'#a16207':'var(--pos)')+'; border-radius:4px; padding:3px 10px; flex-shrink:0"><b class="tn" style="color:'+(risk.score>=60?'var(--neg)':risk.score>=40?'#a16207':'var(--pos)')+'">'+risk.score+'</b><div style="font-size:10.5px" class="muted">자리 위험도</div></div></div>';
        lh+='<div class="timeline" style="margin-top:12px">';
        recs.slice().reverse().slice(0,8).forEach(function(t){
          lh+='<div class="ev'+(t.a?'':' dead')+'"><div class="what">'+esc(t.nm||'(상호 미기재)')+'<span class="st '+(t.a?'live':'dead')+'">'+(t.a?'영업 중':'폐업')+'</span>'+(t.merged?'<span class="muted" style="font-size:11px; margin-left:6px">재등록 '+t.merged+'회 합침</span>':'')+'</div><div class="when tn">'+esc(t.u||t.c)+' · '+esc(t.o||'?')+(t.x?' → '+esc(t.x):'')+'</div></div>';
        });
        lh+='</div></div>';
      });
      lh+='</div><details class="metric" style="margin-top:12px"><summary>자리 위험도는 이렇게 계산했어요 (산식 전문)</summary><div class="body">'
        +'<code style="font-size:12px; display:block; padding:8px; background:var(--rule2); border-radius:4px; margin:6px 0">위험도 = 35 + min(교체횟수−2, 8)×6 + max(0, 40−폐업중위개월)×0.7 + (45 − 동네 5년생존율%)×0.6 &nbsp;→ 5~95로 자름</code>'
        +'· 교체횟수: 이 지번에 기록된 인허가 건수. 8건에서 상한을 둬 한 건물에 여러 가게가 있는 주소가 무조건 최고점이 되지 않게 했어요.<br>'
        +'· 폐업중위개월: 이 자리에서 <b>이미 폐업한</b> 업소들의 중위 영업기간. 영업 중인 가게는 빠져 있어 <b>실제보다 짧게 나오는 절단 편향</b>이 있어요.<br>'
        +'· 동네 생존율: 이 시군구의 2019~20년 개업 음식점·카페 5년 생존율(관측중단 반영).<br>'
        +'· <b>가중치는 저희가 정한 값이고 통계적으로 검증된 모형이 아니에요.</b> 순위 비교용 참고 지표로만 보세요. 인허가가 유지되면 사장님이 바뀌어도 같은 가게로 셉니다.</div></details>';
      list.innerHTML=lh;
    }
    q.addEventListener('input', function(){ show(q.value.trim()); });
    show('');
    if (survGu){
      var sh2='<section><h2><span class="emo">📉</span>'+esc(nm)+' 가게는 몇 년 버틸까 <small>2019~2020년 개업 '+survGu.n.toLocaleString()+'곳 추적</small></h2><div class="rule-card" style="max-width:640px">';
      sh2+=lineChart(survGu.s.map(function(v,i){return {x:i+'년', v:v};}),{fmt:function(v){return v.toFixed(0)+'%';},label:'생존곡선',color:'#9a3412'});
      sh2+='<div class="fine">인허가 기준 실측이에요. 영업 중 가게는 관측중단 처리.</div></div></section>';
      body.insertAdjacentHTML('beforeend', sh2);
    }
  }).catch(function(){
    document.getElementById('spotBody').innerHTML='<div class="rule-card">이 지역 주소 데이터가 없거나, 로컬 서버·호스팅 환경이 아니에요.</div>';
  });
}

/* ---------- 브랜드 이야기 ---------- */
function renderBrand(param){
  document.title = '브랜드 이야기 — 우리동네 이야기';
  if (param) return renderBrandOne(decodeURIComponent(param));
  APP.innerHTML = '<div class="skel">브랜드 데이터를 불러오는 중이에요…</div>';
  loadBrands().then(function(B){
    var h = '<div class="crumb"><a href="#">홈</a> › 브랜드 이야기</div>';
    h += '<section style="margin-top:8px"><h1>🏷️ 브랜드 지도</h1><p class="muted">같은 상호로 신고된 인허가를 모아 브랜드 규모를 추정했어요. '+esc(B.note)+'</p></section>';
    h += '<section><h2><span class="emo">👑</span>전국 브랜드 TOP 50 <small>영업 중 인허가 건수 기준</small></h2><div class="rule-card" style="overflow-x:auto"><table class="tn"><tr><th class="right">#</th><th>브랜드(상호)</th><th class="right">영업 중</th><th class="right opt">누적(폐업 포함)</th><th class="right">누적 대비 생존</th><th class="right opt">진출 시도</th></tr>';
    var bmax = B.top[0] ? B.top[0].open : 1;
    B.top.slice(0,50).forEach(function(b,i){
      var sv = b.total? (b.open/b.total*100) : null;
      var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
      h += '<tr><td class="right muted">'+medal+'</td><td><a class="lk" style="font-weight:700" href="#/brand/'+encodeURIComponent(b.nm)+'">'+esc(b.nm)+'</a></td>';
      h += '<td><div class="tbar"><span class="track"><i style="width:'+(b.open/bmax*100).toFixed(1)+'%; background:var(--accent)"></i></span><b class="tbv tn">'+b.open.toLocaleString()+'</b></div></td>';
      h += '<td class="right muted opt">'+b.total.toLocaleString()+'</td>';
      h += '<td><div class="tbar"><span class="track"><i style="width:'+(sv||0).toFixed(0)+'%; background:'+(sv>=60?'var(--pos)':sv<40?'var(--neg)':'var(--warn)')+'"></i></span><b class="tbv tn '+(sv>=60?'pos':sv<40?'neg':'')+'">'+(sv!=null?sv.toFixed(0)+'%':'—')+'</b></div></td>';
      h += '<td class="right opt">'+b.sidos+'곳</td></tr>';
    });
    h += '</table><div class="fine">"누적 대비 생존"은 역대 그 상호로 신고된 인허가 중 지금 영업 중인 비율이에요 — 브랜드의 나이가 많을수록 낮게 나오는 경향이 있으니 순위보다 참고로 보세요.</div></div></section>';
    APP.innerHTML = h;
  }).catch(function(){ APP.innerHTML = '<div class="rule-card">브랜드 데이터는 로컬 서버나 호스팅 환경에서만 불러와져요.</div>'; });
}

function renderBrandOne(nm){
  document.title = nm+' — 브랜드 이야기';
  APP.innerHTML = '<div class="skel">'+esc(nm)+' 지역 분포를 불러오는 중이에요…</div>';
  Promise.all([loadBrandRegion(), loadBrands()]).then(function(res){
    var BR=res[0], B=res[1];
    var d = BR.byBrand[nm];
    var meta = (B.top||[]).filter(function(x){ return x.nm===nm; })[0];
    var h = '<div class="crumb"><a href="#">홈</a> › <a href="#/brand">브랜드 이야기</a> › '+esc(nm)+'</div>';
    h += '<section style="margin-top:8px"><h1>'+esc(nm)+'</h1>';
    if (!d){ h += '<p class="muted">이 브랜드는 지역 분포 집계 대상(상위 120개)에 없어요.</p></section>'; APP.innerHTML=h; return; }
    h += '<div class="grid g4 tn" style="margin-top:12px">';
    h += '<div class="rule-card stat"><b>'+fmtN(d.total)+'곳</b><span>영업 중 (집계 기준)</span></div>';
    h += '<div class="rule-card stat"><b>'+d.sido.length+'개</b><span>진출 시도</span></div>';
    h += '<div class="rule-card stat"><b>'+esc(d.units[0][0].replace('|',' '))+'</b><span>가장 많은 시군구 ('+fmtN(d.units[0][1])+'곳)</span></div>';
    if (meta) h += '<div class="rule-card stat"><b>'+(meta.total?Math.round(meta.open/meta.total*100)+'%':'—')+'</b><span>누적 대비 생존</span></div>';
    h += '</div></section>';
    var smax = d.sido[0][1];
    h += '<section><h2><span class="emo">🗺️</span>어느 지역에 많을까</h2><div class="rule-card">';
    d.sido.forEach(function(r){
      h += '<div style="display:flex; align-items:center; gap:10px; padding:5px 0; border-bottom:1px dashed var(--rule2)">';
      h += '<span style="width:56px; font-size:13px; font-weight:600">'+esc(r[0])+'</span>';
      h += '<div class="bar" style="flex:1; height:14px"><i style="width:'+(r[1]/smax*100).toFixed(1)+'%; background:var(--accent)"></i></div>';
      h += '<b class="tn" style="width:52px; text-align:right; font-size:12.5px">'+fmtN(r[1])+'곳</b></div>';
    });
    h += '</div></section>';
    var umax = d.units[0][1];
    h += '<section><h2><span class="emo">🏆</span>가장 많은 동네 TOP 10</h2><div class="rule-card">';
    d.units.forEach(function(r){
      var cd = backCdOf(r[0]);
      h += '<div style="display:flex; align-items:center; gap:10px; padding:5px 0; border-bottom:1px dashed var(--rule2)">';
      h += (cd?'<a class="lk" href="#/gu/'+cd+'" style="width:130px; font-size:13px; font-weight:600">':'<span style="width:130px; font-size:13px; font-weight:600">')+esc(r[0].replace('|',' '))+(cd?'</a>':'</span>');
      h += '<div class="bar" style="flex:1; height:14px"><i style="width:'+(r[1]/umax*100).toFixed(1)+'%; background:#9a3412"></i></div>';
      h += '<b class="tn" style="width:52px; text-align:right; font-size:12.5px">'+fmtN(r[1])+'곳</b></div>';
    });
    h += '<div class="fine">'+esc(BR.note)+'</div></div></section>';
    APP.innerHTML = h;
  }).catch(function(){ APP.innerHTML = '<div class="rule-card">브랜드 데이터는 로컬 서버나 호스팅 환경에서만 불러와져요.</div>'; });
}

/* ---------- 푸터 ---------- */
function renderFoot(){
  var f = document.getElementById('foot');
  var h = '<b>데이터 출처와 기준시점</b><br>';
  D.meta.sources.forEach(function(s){ h += '· <a class="lk" href="'+s.url+'" target="_blank" rel="noopener">'+esc(s.name)+'</a> — '+esc(s.detail)+'<br>'; });
  h += '<br>'+esc(D.meta.notes.budgetAuthor)+'<br>';
  if (D.meta.notes.peers17) h += esc(D.meta.notes.peers17)+'<br>';
  if (D.meta.notes.photo) h += esc(D.meta.notes.photo)+'<br>';
  h += '결산(2017~2024)은 확정치, 2025~2026년 표기는 예산 기준이라는 점을 화면마다 밝혔어요. 이 페이지는 공공데이터를 재가공한 것으로, 원자료와 차이가 있으면 원자료가 우선이에요. · 빌드 '+esc(D.meta.builtAt);
  f.innerHTML = h;
}

/* ---------- 라우터 ---------- */
function route(){
  var hsh = decodeURIComponent(location.hash||'');
  var tipEl = document.getElementById('gtip');
  if (tipEl) tipEl.style.display = 'none';   // 지도 툴팁이 다음 화면까지 남는 문제 방지
  window.scrollTo(0,0);
  var m;
  var tab = 'home';
  if (hsh.indexOf('#/tax')===0) tab='tax'; else if (hsh.indexOf('#/spot')===0) tab='spot'; else if (hsh.indexOf('#/brand')===0) tab='brand'; else if (hsh.indexOf('#/biz')===0) tab='spot';
  document.querySelectorAll('nav.tabs a').forEach(function(a){ a.classList.toggle('on', a.dataset.tab===tab); });
  if ((m = hsh.match(/^#\/sido\/(.+)$/))) return renderSido(m[1]);
  if ((m = hsh.match(/^#\/gu\/(.+)$/))) return renderGu(m[1]);
  if ((m = hsh.match(/^#\/biz\/(.+)$/))) return renderBizN(m[1]);
  if ((m = hsh.match(/^#\/spot(?:\/(.+))?$/))) return renderSpotN(m[1]);
  if ((m = hsh.match(/^#\/tax(?:\/(.+))?$/))) return renderTax(m[1]);
  if (hsh.indexOf('#/compare')===0) return renderCompare();
  if ((m = hsh.match(/^#\/brand\/(.+)$/))) return renderBrand(m[1]);
  if (hsh.indexOf('#/brand')===0) return renderBrand();
  return renderHome();
}
window.addEventListener('hashchange', route);
renderFoot();
route();
updateCmpChip();
