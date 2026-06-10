/* ============ データ ============ */
const VERSIONS = [
 {v:"1.1.0",d:"2022-09-08",t:"balance",n:"発売前日の初回更新。ローンチに向けた調整"},
 {v:"1.1.1",d:"2022-09-16",t:"patch",n:"不具合修正"},
 {v:"1.1.2",d:"2022-09-30",t:"patch",n:"不具合修正"},
 {v:"1.2.0",d:"2022-10-26",t:"balance",n:"初の本格バランス調整"},
 {v:"1.2.1",d:"2022-10-28",t:"patch",n:"不具合修正"},
 {v:"2.0.0",d:"2022-11-30",t:"major",n:"2022冬 Chill Season 開幕"},
 {v:"2.0.1",d:"2022-12-09",t:"patch",n:"不具合修正"},
 {v:"2.1.0",d:"2023-01-18",t:"balance",n:"バランス調整（メイン性能関連の引き上げ等）"},
 {v:"2.1.1",d:"2023-02-09",t:"patch",n:"不具合修正"},
 {v:"3.0.0",d:"2023-02-28",t:"major",n:"2023春 Fresh Season 開幕"},
 {v:"3.0.1",d:"2023-03-09",t:"patch",n:"不具合修正"},
 {v:"3.1.0",d:"2023-03-31",t:"balance",n:"バランス調整"},
 {v:"3.1.1",d:"2023-05-02",t:"patch",n:"不具合修正"},
 {v:"4.0.0",d:"2023-05-31",t:"major",n:"2023夏 Sizzle Season 開幕"},
 {v:"4.0.1",d:"2023-06-02",t:"patch",n:"不具合修正"},
 {v:"4.0.2",d:"2023-06-14",t:"patch",n:"不具合修正"},
 {v:"4.1.0",d:"2023-07-27",t:"balance",n:"バランス調整"},
 {v:"5.0.0",d:"2023-08-31",t:"major",n:"2023秋 Drizzle Season 開幕。スペシャル強化など"},
 {v:"5.0.1",d:"2023-09-15",t:"patch",n:"不具合修正"},
 {v:"5.1.0",d:"2023-10-18",t:"balance",n:"バランス調整"},
 {v:"5.2.0",d:"2023-11-16",t:"balance",n:"バランス調整"},
 {v:"6.0.0",d:"2023-11-30",t:"major",n:"2023冬 Chill Season 開幕"},
 {v:"6.0.1",d:"2023-12-08",t:"patch",n:"不具合修正"},
 {v:"6.0.2",d:"2023-12-22",t:"patch",n:"不具合修正"},
 {v:"6.1.0",d:"2024-01-25",t:"balance",n:"バランス調整"},
 {v:"7.0.0",d:"2024-02-22",t:"major",n:"2024春 Fresh Season 開幕"},
 {v:"7.1.0",d:"2024-03-22",t:"balance",n:"バランス調整"},
 {v:"7.2.0",d:"2024-04-18",t:"balance",n:"バランス調整"},
 {v:"8.0.0",d:"2024-05-31",t:"major",n:"2024夏 Sizzle Season 開幕"},
 {v:"8.1.0",d:"2024-07-18",t:"balance",n:"バランス調整"},
 {v:"9.0.0",d:"2024-08-30",t:"major",n:"2024秋 Drizzle Season 開幕（最終シーズン）"},
 {v:"9.1.0",d:"2024-09-12",t:"balance",n:"バランス調整。グランドフェス期"},
 {v:"9.2.0",d:"2024-11-21",t:"balance",n:"バランス調整"},
 {v:"9.3.0",d:"2025-03-13",t:"balance",n:"バランス調整"},
 {v:"10.0.0",d:"2025-06-12",t:"major",n:"大型更新。新ブキ追加・熟練度拡張など"},
 {v:"10.0.1",d:"2025-06-27",t:"patch",n:"不具合修正"},
 {v:"10.1.0",d:"2025-09-04",t:"balance",n:"バランス調整"},
 {v:"11.0.0",d:"2026-01-29",t:"major",n:"大型バランス改修。ブラスター強化・マッチメイク改善"},
 {v:"11.0.1",d:"2026-02-05",t:"patch",n:"不具合修正"},
 {v:"11.1.0",d:"2026-03-19",t:"balance",n:"バランス調整。得意距離の近いブキ同士で対戦しやすく"},
 {v:"11.2.0",d:"2026-06-11",t:"balance",n:"最新。ブラスター爆風を中間値へ再調整、Xマッチのチーム分け改善"},
];
const TYPE_LABEL = {major:"シーズン・大型", balance:"バランス調整", patch:"不具合修正"};

const SEASONS = [
 {ver:"1.0.0", name:"発売 — Splatoon 3", date:"2022.9.9", note:"バンカラ街、開幕。", c:"#ff5c8a"},
 {ver:"2.0.0", name:"2022冬 Chill Season", date:"2022.11.30", note:"初のシーズン更新。", c:"#2ee6d6"},
 {ver:"3.0.0", name:"2023春 Fresh Season", date:"2023.2.28", note:"春の新要素が追加。", c:"#e8ff2e"},
 {ver:"4.0.0", name:"2023夏 Sizzle Season", date:"2023.5.31", note:"夏シーズン開幕。", c:"#ff5c8a"},
 {ver:"5.0.0", name:"2023秋 Drizzle Season", date:"2023.8.31", note:"スペシャル強化が話題に。", c:"#a05cff"},
 {ver:"6.0.0", name:"2023冬 Chill Season", date:"2023.11.30", note:"2年目の冬。", c:"#2ee6d6"},
 {ver:"7.0.0", name:"2024春 Fresh Season", date:"2024.2.22", note:"春の調整ラッシュへ。", c:"#e8ff2e"},
 {ver:"8.0.0", name:"2024夏 Sizzle Season", date:"2024.5.31", note:"シーズン終盤戦。", c:"#ff5c8a"},
 {ver:"9.0.0", name:"2024秋 Drizzle Season", date:"2024.8.30", note:"最終シーズン。グランドフェスの季節。", c:"#a05cff"},
 {ver:"10.0.0", name:"バンカラコレクション期", date:"2025.6.12", note:"シーズン後の大型更新。新ブキ・熟練度拡張。", c:"#2ee6d6"},
 {ver:"11.0.0〜", name:"ロングラン運営期", date:"2026.1.29〜", note:"Switch 2世代も見据えたバランス改修フェーズ。", c:"#e8ff2e"},
];

const SP_CHANGES = [
 {n:"スクイックリンβ", b:190, a:180},
 {n:"R-PEN/5B", b:210, a:200},
 {n:"バケットスロッシャーデコ", b:180, a:170},
 {n:"イグザミナー・ヒュー", b:210, a:200},
 {n:"フルイドVカスタム", b:200, a:190},
 {n:".52ガロン", b:200, a:210},
 {n:"ノヴァブラスターネオ", b:190, a:200},
 {n:"ダイナモローラー", b:200, a:210},
 {n:"ダイナモローラーテスラ", b:180, a:190},
 {n:"バケットスロッシャー", b:210, a:220},
 {n:"モップリン", b:190, a:200},
];

/* ============ ユーティリティ ============ */
const day = 86400000;
const fmt = s => s.replace(/-/g,".");
const diffDays = (a,b) => Math.round((new Date(b)-new Date(a))/day);

/* ============ タイムライン描画 ============ */
const tlEl = document.getElementById("timeline");
VERSIONS.slice().reverse().forEach((u,i,arr)=>{
  const idx = VERSIONS.findIndex(x=>x.v===u.v);
  const gap = idx>0 ? diffDays(VERSIONS[idx-1].d, u.d) : null;
  const item = document.createElement("div");
  item.className = "tl-item";
  item.dataset.type = u.t;
  item.innerHTML = `
    <div class="tl-dot"></div>
    <div class="tl-card">
      <div class="tl-head">
        <span class="tl-ver">Ver. ${u.v}</span>
        <span class="tl-date">${fmt(u.d)}</span>
        <span class="badge ${u.t}">${TYPE_LABEL[u.t]}</span>
        ${gap!==null?`<span class="tl-gap">前回から ${gap}日</span>`:""}
      </div>
      <div class="tl-note">${u.n}</div>
    </div>`;
  tlEl.appendChild(item);
});

/* フィルタ */
document.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click",()=>{
    document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.f;
    document.querySelectorAll(".tl-item").forEach(it=>{
      it.classList.toggle("hidden", f!=="all" && it.dataset.type!==f);
    });
  });
});

/* ============ シーズンカード ============ */
const seasonEl = document.getElementById("seasons");
SEASONS.forEach(s=>{
  const c = document.createElement("div");
  c.className = "season-card";
  c.style.setProperty("--accent", s.c);
  c.innerHTML = `<div class="s-ver">Ver. ${s.ver}</div><div class="s-name">${s.name}</div><div class="s-date">${s.date}</div><div class="s-note">${s.note}</div>`;
  seasonEl.appendChild(c);
});

/* ============ SPポイント表 ============ */
const spEl = document.getElementById("spRows");
SP_CHANGES.forEach(s=>{
  const up = s.a < s.b; // 必要Pが減る = 強化
  const row = document.createElement("div");
  row.className = "sp-row";
  row.innerHTML = `<span class="name">${s.n}</span>
    <span class="sp-bar">${s.b}p <span class="arrow ${up?"up":"down"}">${up?"▼":"▲"}</span> <span class="${up?"up":"down"}">${s.a}p（${up?"強化":"弱体化"}）</span></span>`;
  spEl.appendChild(row);
});

/* ============ チャート ============ */
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
Chart.defaults.color = css("--text-dim");
Chart.defaults.borderColor = "rgba(168,159,214,.12)";
Chart.defaults.font.family = "'Hiragino Kaku Gothic ProN','Yu Gothic UI',sans-serif";

/* 間隔の推移 */
const intervals = VERSIONS.map((u,i)=> i===0?0:diffDays(VERSIONS[i-1].d,u.d));
new Chart(document.getElementById("chartInterval"),{
  type:"line",
  data:{
    labels:VERSIONS.map(u=>"v"+u.v),
    datasets:[{
      label:"前回からの日数",
      data:intervals,
      borderColor:css("--ink-c"),
      backgroundColor:"rgba(46,230,214,.12)",
      fill:true, tension:.35, pointRadius:VERSIONS.map(u=>u.t==="major"?6:3),
      pointBackgroundColor:VERSIONS.map(u=>u.t==="major"?css("--ink-a"):css("--ink-c")),
    }]
  },
  options:{
    responsive:true, maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{
      title:i=>"Ver. "+VERSIONS[i[0].dataIndex].v+"（"+fmt(VERSIONS[i[0].dataIndex].d)+"）",
      label:i=>"前回から "+i.parsed.y+"日 ｜ "+VERSIONS[i.dataIndex].n
    }}},
    scales:{x:{ticks:{maxRotation:60,autoSkip:true,maxTicksLimit:18}},y:{title:{display:true,text:"日数"}}}
  }
});

/* 年別回数 */
const years = {};
VERSIONS.forEach(u=>{const y=u.d.slice(0,4);years[y]=(years[y]||0)+1});
new Chart(document.getElementById("chartYear"),{
  type:"bar",
  data:{labels:Object.keys(years),datasets:[{
    data:Object.values(years),
    backgroundColor:[css("--ink-d"),css("--ink-a"),css("--ink-c"),css("--ink-b"),"#ffb340"],
    borderRadius:{topLeft:14,topRight:14}, borderSkipped:"bottom",
  }]},
  options:{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>i.parsed.y+"回の更新"}}},
    scales:{y:{ticks:{stepSize:2}}}}
});

/* 種類内訳 */
const counts = {major:0,balance:0,patch:0};
VERSIONS.forEach(u=>counts[u.t]++);
new Chart(document.getElementById("chartType"),{
  type:"doughnut",
  data:{labels:["シーズン・大型","バランス調整","不具合修正"],datasets:[{
    data:[counts.major,counts.balance,counts.patch],
    backgroundColor:[css("--ink-c"),css("--ink-a"),css("--ink-b")],
    borderColor:css("--card"), borderWidth:4, hoverOffset:10,
  }]},
  options:{responsive:true,maintainAspectRatio:false,cutout:"58%",
    plugins:{legend:{position:"bottom",labels:{padding:16,usePointStyle:true}}}}
});

/* ============ 次回予測 ============ */
(function(){
  const recent = VERSIONS.filter(u=>u.v.startsWith("11."));
  const gaps = recent.map(u=>{
    const i = VERSIONS.findIndex(x=>x.v===u.v);
    return diffDays(VERSIONS[i-1].d, u.d);
  });
  const avg = Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length);
  const next = new Date(new Date(VERSIONS.at(-1).d).getTime() + avg*day);
  const f = `${next.getFullYear()}年${next.getMonth()+1}月${next.getDate()}日ごろ？`;
  document.getElementById("nextGuess").textContent = f;
})();

/* ============ スクロール出現 & カウントアップ ============ */
const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("show"); io.unobserve(e.target);} });
},{threshold:.12});
document.querySelectorAll(".tl-item,.chart-card,.season-card").forEach(el=>io.observe(el));

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".stat .num").forEach(el=>{
  const target = +el.dataset.count;
  if(reduced){ el.textContent = target.toLocaleString(); return; }
  let t0=null;
  const tick = ts=>{
    if(!t0)t0=ts;
    const p = Math.min((ts-t0)/1400,1);
    el.textContent = Math.round(target*(1-Math.pow(1-p,3))).toLocaleString();
    if(p<1)requestAnimationFrame(tick);
  };
  setTimeout(()=>requestAnimationFrame(tick),500);
});
