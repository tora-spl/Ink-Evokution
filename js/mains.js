/* ============ ユーティリティ ============ */
const KIND_LABEL = {b:"強化", n:"弱体化", m:"強化＋弱体"};
const KIND_COLOR = {b:"#e8ff2e", n:"#a05cff", m:"#2ee6d6"};
const fmtDate = s => s.replace(/-/g,".");
const cssVar = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const catOf = id => WEAPON_CLASSES.find(c=>c.id===id);

const stats = w => {
  const c = {b:0,n:0,m:0};
  w.changes.forEach(x=>c[x.k]++);
  return {total:w.changes.length, ...c};
};

/* ============ ヒーロー統計 ============ */
(function(){
  const sum = MAIN_WEAPONS.reduce((a,w)=>a+w.changes.length,0);
  const top = MAIN_WEAPONS.slice().sort((a,b)=>b.changes.length-a.changes.length)[0];
  document.getElementById("statTotal").dataset.count = sum;
  document.getElementById("statWeapons").dataset.count = MAIN_WEAPONS.length;
  document.getElementById("statTop").textContent = top.name;
  document.getElementById("statTopCount").textContent = `最多調整 — ${top.changes.length}回`;
})();

/* ============ カテゴリフィルタ ============ */
const filterEl = document.getElementById("catFilters");
const catCount = id => MAIN_WEAPONS.filter(w=>w.cat===id).length;
filterEl.innerHTML = `<button class="chip active" data-f="all">すべて (${MAIN_WEAPONS.length})</button>` +
  WEAPON_CLASSES.map(c=>`<button class="chip" data-f="${c.id}">${c.name} (${catCount(c.id)})</button>`).join("");
filterEl.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click",()=>{
    filterEl.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.f;
    document.querySelectorAll(".main-card").forEach(card=>{
      card.classList.toggle("hidden", f!=="all" && card.dataset.cat!==f);
    });
  });
});

/* ============ ブキカード ============ */
const gridEl = document.getElementById("mainGrid");
MAIN_WEAPONS.forEach(w=>{
  const cat = catOf(w.cat);
  const s = stats(w);
  const card = document.createElement("button");
  card.className = "wpn-card main-card";
  card.dataset.id = w.id;
  card.dataset.cat = w.cat;
  card.style.setProperty("--accent", cat.c);
  card.innerHTML = `
    <div class="wpn-img sm"><img src="${weaponImg(w.id)}" alt="${w.name}" loading="lazy" width="256" height="256"></div>
    <div class="wpn-en">${cat.name}</div>
    <div class="wpn-name">${w.name}</div>
    <div class="main-kits">${w.kits.join(" / ")}</div>
    <div class="wpn-count"><span class="num">${s.total}</span>回の調整</div>
    <div class="wpn-bar" role="img" aria-label="強化${s.b}回・両方${s.m}回・弱体化${s.n}回">
      <span class="seg b" style="flex:${s.b}"></span><span class="seg m" style="flex:${s.m}"></span><span class="seg n" style="flex:${s.n}"></span>
    </div>
    <div class="wpn-legend"><span class="b">↑${s.b}</span><span class="m">↕${s.m}</span><span class="n">↓${s.n}</span></div>`;
  card.addEventListener("click",()=>{ selectWeapon(w.id); document.getElementById("detail-sec").scrollIntoView({behavior:"smooth"}); });
  gridEl.appendChild(card);
});

/* ============ 調整回数ランキング TOP15 ============ */
Chart.defaults.color = cssVar("--text-dim");
Chart.defaults.borderColor = "rgba(168,159,214,.12)";
Chart.defaults.font.family = "'Hiragino Kaku Gothic ProN','Yu Gothic UI',sans-serif";

const ranked = MAIN_WEAPONS.map(w=>({w, s:stats(w)}))
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
function selectWeapon(id){
  const w = MAIN_WEAPONS.find(x=>x.id===id);
  const cat = catOf(w.cat);
  const s = stats(w);

  document.querySelectorAll(".main-card").forEach(c=>c.classList.toggle("selected", c.dataset.id===id));

  const head = document.getElementById("detailHead");
  head.style.setProperty("--accent", cat.c);
  head.innerHTML = `
    <div class="d-icon img"><img src="${weaponImg(w.id)}" alt="${w.name}" width="256" height="256"></div>
    <div>
      <div class="d-en">${cat.en} — ${cat.name}</div>
      <h3 class="d-name">${w.name}の軌跡</h3>
      <p class="d-desc">同じメイン性能のブキ：${w.kits.join("、")}</p>
      <div class="d-tags">
        <span class="badge balance">調整 ${s.total}回</span>
        <span class="badge buff">強化 ${s.b}回</span>
        <span class="badge mix">強化＋弱体 ${s.m}回</span>
        <span class="badge nerf">弱体化 ${s.n}回</span>
      </div>
    </div>`;

  /* 調整収支チャート（強化+1 / 弱体-1 / 両方±0 の累積）
     全バージョンを軸に取り、調整のなかった期間はフラットなまま見せる */
  const allVers = Object.keys(VER_DATES).sort((a,b)=>VER_DATES[a].localeCompare(VER_DATES[b]));
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
        title:i=>{ const v=allVers[i[0].dataIndex]; return `Ver. ${v}（${fmtDate(VER_DATES[v])}）`; },
        label:i=>{ const c=changeMap[allVers[i.dataIndex]];
          return c?`${KIND_LABEL[c.k]} ｜ ${c.note}`:"調整なし"; },
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
  w.changes.slice().reverse().forEach(x=>{
    const row = document.createElement("div");
    row.className = `d-row k-${x.k}`;
    row.innerHTML = `
      <span class="d-ver">Ver. ${x.v}</span>
      <span class="d-date">${fmtDate(VER_DATES[x.v])}</span>
      <span class="d-kind">${x.k==="b"?"↑":x.k==="n"?"↓":"↕"} ${KIND_LABEL[x.k]}</span>
      <span class="d-note">${x.note}</span>`;
    tl.appendChild(row);
  });
}
selectWeapon("sshooter");

/* ============ スクロール出現 & カウントアップ ============ */
const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("show"); io.unobserve(e.target);} });
},{threshold:.06});
document.querySelectorAll(".wpn-card,.chart-card").forEach(el=>io.observe(el));

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".stat .num[data-count]").forEach(el=>{
  const target = +el.dataset.count;
  if(!target) return;
  // 非表示タブではタイマーが抑制されるため、アニメーションせず最終値を即表示
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
