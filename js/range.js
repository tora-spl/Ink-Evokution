/* ============ ユーティリティ ============ */
const catOf = id => WEAPON_CLASSES.find(c => c.id === id);

/* 射程データを持つメインブキだけを対象にまとめる */
const ITEMS = MAIN_WEAPONS
  .filter(w => WEAPON_RANGE[w.id] != null)
  .map(w => {
    const cat = catOf(w.cat);
    return { w, cat, range: WEAPON_RANGE[w.id], kind: rangeKindOf(w.cat) };
  });

/* ============ ヒーロー統計 ============ */
(function () {
  const sorted = ITEMS.slice().sort((a, b) => b.range - a.range);
  const max = sorted[0], min = sorted[sorted.length - 1];
  document.getElementById("statCount").dataset.count = ITEMS.length;
  document.getElementById("statMax").textContent = max.w.name;
  document.getElementById("statMaxV").textContent = `最長射程 — ${max.range}`;
  document.getElementById("statMin").textContent = min.w.name;
  document.getElementById("statMinV").textContent = `最短射程 — ${min.range}`;
})();

/* ============ 凡例（登場するブキ種の色） ============ */
(function () {
  const present = WEAPON_CLASSES.filter(c => ITEMS.some(it => it.w.cat === c.id));
  document.getElementById("rangeLegend").innerHTML = present.map(c =>
    `<span class="lg"><span class="dot" style="background:${c.c}"></span>${c.name}</span>`
  ).join("");
})();

/* ============ カテゴリフィルタ ============ */
const filterEl = document.getElementById("catFilters");
const catCount = id => ITEMS.filter(it => it.w.cat === id).length;
filterEl.innerHTML =
  `<button class="chip active" data-f="all">すべて (${ITEMS.length})</button>` +
  WEAPON_CLASSES.filter(c => catCount(c.id) > 0)
    .map(c => `<button class="chip" data-f="${c.id}">${c.name} (${catCount(c.id)})</button>`).join("");

let activeFilter = "all";
let activeSort = "desc";

filterEl.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    filterEl.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.f;
    render();
  });
});

/* ============ 並び替えトグル ============ */
const sortEl = document.querySelector(".sort-bar");
sortEl.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    sortEl.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeSort = chip.dataset.sort;
    render();
  });
});

/* ============ 一覧の描画 ============ */
const listEl = document.getElementById("rangeList");
const MAXV = Math.max(...ITEMS.map(i => i.range)); // バー幅の基準（=100運用だが安全側で実最大）

function sortItems(items) {
  const arr = items.slice();
  if (activeSort === "asc") arr.sort((a, b) => a.range - b.range || a.w.name.localeCompare(b.w.name));
  else arr.sort((a, b) => b.range - a.range || a.w.name.localeCompare(b.w.name));
  return arr;
}

function render() {
  const visible = sortItems(ITEMS.filter(it => activeFilter === "all" || it.w.cat === activeFilter));
  listEl.innerHTML = "";

  visible.forEach((it, i) => {
    const row = document.createElement("div");
    row.className = "range-row" + (i === 0 ? " top" : "");
    row.style.setProperty("--accent", it.cat.c);
    row.innerHTML = `
      <div class="range-rank">${i + 1}</div>
      <div class="range-thumb"><img src="${weaponImg(it.w.id)}" alt="${it.w.name}" loading="lazy" width="256" height="256"></div>
      <div class="range-meta">
        <div class="r-name">${it.w.name}</div>
        <div class="r-cat">${it.cat.en} <span class="r-kind">/ ${it.kind}</span></div>
      </div>
      <div class="range-track"><div class="range-fill" data-w="${(it.range / MAXV * 100).toFixed(1)}"></div></div>
      <div class="range-val">${it.range}<span class="u">RANGE</span></div>`;
    listEl.appendChild(row);
  });

  // 出現アニメーション＋バー伸長
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rows = listEl.querySelectorAll(".range-row");
  rows.forEach((row, i) => {
    const fill = row.querySelector(".range-fill");
    const w = fill.dataset.w + "%";
    if (reduced) { row.classList.add("show"); fill.style.width = w; return; }
    setTimeout(() => {
      row.classList.add("show");
      requestAnimationFrame(() => { fill.style.width = w; });
    }, Math.min(i * 22, 600));
  });
}

render();

/* ============ ヒーローのカウントアップ ============ */
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = document.getElementById("statCount");
  const target = +el.dataset.count;
  if (!target) return;
  if (reduced || document.hidden) { el.textContent = target.toLocaleString(); return; }
  let t0 = null;
  const tick = ts => {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  setTimeout(() => requestAnimationFrame(tick), 500);
  setTimeout(() => { el.textContent = target.toLocaleString(); }, 2200);
})();
