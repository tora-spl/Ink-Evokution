/* ============ ユーティリティ ============ */
const KIND_LABEL = {b:"強化", n:"弱体化", m:"強化＋弱体"};
const KIND_COLOR = {b:"#e8ff2e", n:"#a05cff", m:"#2ee6d6"};
const SRC_LABEL = {main:"メイン", sub:"サブ", spe:"スペシャル", sp:"SP"};
const SRC_JP2CLASS = {"メイン":"main", "サブ":"sub", "スペシャル":"spe", "SP":"sp"};
const fmtDate = s => s.replace(/-/g,".");
const cssVar = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const catOf = id => WEAPON_CLASSES.find(c=>c.id===id);

const stats = w => {
  const c = {b:0,n:0,m:0};
  w.changes.forEach(x=>c[x.k]++);
  return {total:w.changes.length, ...c};
};

/* 出典タグ付きの note を行ごとに描画 */
function renderNote(note){
  return note.split(" ／ ").map(seg=>{
    const m = seg.match(/^【(.+?)】([\s\S]*)$/);
    if(!m) return `<span class="d-srcline">${seg}</span>`;
    const cls = SRC_JP2CLASS[m[1]] || "";
    return `<span class="d-srcline"><span class="src-chip ${cls}">${m[1]}</span>${m[2]}</span>`;
  }).join("");
}

/* ============ ヒーロー統計 ============ */
(function(){
  const sum = KITS.reduce((a,w)=>a+w.changes.length,0);
  const top = KITS.slice().sort((a,b)=>b.changes.length-a.changes.length)[0];
  document.getElementById("statTotal").dataset.count = sum;
  document.getElementById("statWeapons").dataset.count = KITS.length;
  document.getElementById("statTop").textContent = top.name;
  document.getElementById("statTopCount").textContent = `最多調整 — ${top.changes.length}回`;
})();

/* ============ 出典の凡例 ============ */
document.getElementById("srcLegend").innerHTML =
  Object.entries(SRC_LABEL).map(([k,v])=>`<span class="src-chip ${k}">${v}</span>`).join("") +
  `<span style="font-size:.7rem;color:var(--text-dim);align-self:center">＝強化／弱体の出典</span>`;

/* ============ フィルタ（カテゴリ＋検索） ============ */
const filterEl = document.getElementById("catFilters");
const catCount = id => KITS.filter(w=>w.cat===id).length;
filterEl.innerHTML = `<button class="chip active" data-f="all">すべて (${KITS.length})</button>` +
  WEAPON_CLASSES.map(c=>`<button class="chip" data-f="${c.id}">${c.name} (${catCount(c.id)})</button>`).join("");

let curCat = "all";
const searchEl = document.getElementById("kitSearch");
function applyFilter(){
  const q = (searchEl.value||"").trim().toLowerCase();
  document.querySelectorAll(".kit-card").forEach(card=>{
    const okCat = curCat==="all" || card.dataset.cat===curCat;
    const okQ = !q || card.dataset.name.toLowerCase().includes(q);
    card.classList.toggle("hidden", !(okCat && okQ));
  });
}
filterEl.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click",()=>{
    filterEl.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    curCat = chip.dataset.f;
    applyFilter();
  });
});
searchEl.addEventListener("input", applyFilter);

/* ============ ブキカード ============ */
const gridEl = document.getElementById("kitGrid");
KITS.forEach(w=>{
  const cat = catOf(w.cat);
  const s = stats(w);
  const card = document.createElement("button");
  card.className = "wpn-card main-card kit-card";
  card.dataset.id = w.id;
  card.dataset.cat = w.cat;
  card.dataset.name = w.name;
  card.style.setProperty("--accent", cat.c);
  card.innerHTML = `
    <div class="wpn-img sm"><img src="${weaponImg(w.mainId)}" alt="${w.name}" loading="lazy" width="256" height="256"></div>
    <div class="wpn-en">${cat.name}</div>
    <div class="wpn-name">${w.name}</div>
    <div class="kit-loadout">サブ <b>${w.sub}</b><br>スペシャル <b>${w.spe}</b></div>
    <div class="kit-sp">必要ポイント <b>${w.sp}</b></div>
    <div class="wpn-count"><span class="num">${s.total}</span>回の調整</div>
    <div class="wpn-bar" role="img" aria-label="強化${s.b}回・両方${s.m}回・弱体化${s.n}回">
      <span class="seg b" style="flex:${s.b}"></span><span class="seg m" style="flex:${s.m}"></span><span class="seg n" style="flex:${s.n}"></span>
    </div>
    <div class="wpn-legend"><span class="b">↑${s.b}</span><span class="m">↕${s.m}</span><span class="n">↓${s.n}</span></div>`;
  card.addEventListener("click",()=>{ selectKit(w.id); document.getElementById("detail-sec").scrollIntoView({behavior:"smooth"}); });
  gridEl.appendChild(card);
});

/* ============ 調整回数ランキング TOP15 ============ */
Chart.defaults.color = cssVar("--text-dim");
Chart.defaults.borderColor = "rgba(168,159,214,.12)";
Chart.defaults.font.family = "'Hiragino Kaku Gothic ProN','Yu Gothic UI',sans-serif";

const ranked = KITS.map(w=>({w, s:stats(w)}))
  .sort((a,b)=>b.s.total-a.s.total || b.s.n-a.s.n).slice(0,15);
new Chart(document.getElementById("chartRanking"),{
  type:"bar",
  data:{
    labels:ranked.map(r=>r.w.name),
    datasets:[
      {label:"強化", data:ranked.map(r=>r.s.b), backgroundColor:KIND_COLOR.b},
      {label:"強化＋弱体", data:ranked.map(r=>r.s.m), backgroundColor:KIND_COLOR.m},
      {label:"弱体化", data:ranked.map(r=>r.s.n), backgroundColor:KIND_COLOR.n},
    ]
  },
  options:{
    indexAxis:"y", responsive:true, maintainAspectRatio:false,
    plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:16}},
      tooltip:{callbacks:{footer:items=>`合計 ${ranked[items[0].dataIndex].s.total}回`}}},
    scales:{x:{stacked:true,ticks:{stepSize:1}}, y:{stacked:true}}
  }
});

/* ============ 詳細パネル ============ */
let trendChart = null;
function selectKit(id){
  const w = KITS.find(x=>x.id===id);
  const cat = catOf(w.cat);
  const s = stats(w);

  document.querySelectorAll(".kit-card").forEach(c=>c.classList.toggle("selected", c.dataset.id===id));

  const head = document.getElementById("detailHead");
  head.style.setProperty("--accent", cat.c);
  head.innerHTML = `
    <div class="d-icon img"><img src="${weaponImg(w.mainId)}" alt="${w.name}" width="256" height="256"></div>
    <div>
      <div class="d-en">${cat.en} — ${cat.name}</div>
      <h3 class="d-name">${w.name}の軌跡</h3>
      <div class="kit-meta">
        <span class="pill">サブ <b>${w.sub}</b></span>
        <span class="pill">スペシャル <b>${w.spe}</b></span>
        <span class="pill">必要ポイント <b>${w.sp}</b></span>
        <span class="pill">登場 <b>Ver. ${w.intro}</b></span>
      </div>
      <div class="d-tags">
        <span class="badge balance">調整 ${s.total}回</span>
        <span class="badge buff">強化 ${s.b}回</span>
        <span class="badge mix">強化＋弱体 ${s.m}回</span>
        <span class="badge nerf">弱体化 ${s.n}回</span>
      </div>
    </div>`;

  /* 調整収支チャート（強化+1 / 弱体-1 / 両方±0 の累積） */
  const allVers = Object.keys(KIT_VER_DATES).sort((a,b)=>KIT_VER_DATES[a].localeCompare(KIT_VER_DATES[b]));
  const changeMap = {};
  w.changes.forEach(x=>{ changeMap[x.v] = x; });
  let acc = 0;
  const points = allVers.map(v=>{
    const c = changeMap[v];
    if(c) acc += c.k==="b"?1:c.k==="n"?-1:0;
    return acc;
  });
  if(trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById("chartTrend"),{
    type:"line",
    data:{
      labels:allVers.map(v=>"v"+v),
      datasets:[{
        data:points, borderColor:cat.c, backgroundColor:cat.c+"22",
        fill:true, tension:0, stepped:false,
        pointRadius:allVers.map(v=>changeMap[v]?6:0),
        pointHoverRadius:allVers.map(v=>changeMap[v]?7:0),
        pointBackgroundColor:allVers.map(v=>changeMap[v]?KIND_COLOR[changeMap[v].k]:"transparent"),
        pointBorderColor:"transparent",
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{
        title:i=>{ const v=allVers[i[0].dataIndex]; return `Ver. ${v}（${fmtDate(KIT_VER_DATES[v])}）`; },
        label:i=>{ const c=changeMap[allVers[i.dataIndex]];
          return c?KIND_LABEL[c.k]:"調整なし"; },
        afterLabel:i=>{ const c=changeMap[allVers[i.dataIndex]];
          return c?c.note.replace(/【.+?】/g,"・").replace(/ ／ /g,"\n"):""; },
      }}},
      scales:{
        x:{type:"category",offset:false,grid:{offset:false},
           ticks:{autoSkip:false,maxRotation:60,minRotation:60,font:{size:10}}},
        y:{title:{display:true,text:"調整収支（強化+1 / 弱体-1）"},ticks:{stepSize:1}}
      }
    }
  });

  /* 年表 */
  const tl = document.getElementById("detailTimeline");
  tl.innerHTML = "";
  if(w.changes.length===0){
    tl.innerHTML = `<div class="d-row" style="opacity:.7">このブキは登場（Ver. ${w.intro}）以降、調整が入っていません。</div>`;
    return;
  }
  w.changes.slice().reverse().forEach(x=>{
    const row = document.createElement("div");
    row.className = `d-row k-${x.k}`;
    row.innerHTML = `
      <span class="d-ver">Ver. ${x.v}</span>
      <span class="d-date">${fmtDate(KIT_VER_DATES[x.v])}</span>
      <span class="d-kind">${x.k==="b"?"↑":x.k==="n"?"↓":"↕"} ${KIND_LABEL[x.k]}</span>
      <span class="d-note">${renderNote(x.note)}</span>`;
    tl.appendChild(row);
  });
}
selectKit((KITS.find(k=>k.name==="シャープマーカー")||KITS[0]).id);

/* ============ スクロール出現 & カウントアップ ============ */
const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("show"); io.unobserve(e.target);} });
},{threshold:.06});
document.querySelectorAll(".wpn-card,.chart-card").forEach(el=>io.observe(el));

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".stat .num[data-count]").forEach(el=>{
  const target = +el.dataset.count;
  if(!target) return;
  if(reduced || document.hidden){ el.textContent = target.toLocaleString(); return; }
  let t0=null;
  const tick = ts=>{
    if(!t0)t0=ts;
    const p = Math.min((ts-t0)/1400,1);
    el.textContent = Math.round(target*(1-Math.pow(1-p,3))).toLocaleString();
    if(p<1)requestAnimationFrame(tick);
  };
  setTimeout(()=>requestAnimationFrame(tick),500);
  setTimeout(()=>{ el.textContent = target.toLocaleString(); },2200);
});
