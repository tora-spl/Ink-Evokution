const test = require("node:test");
const assert = require("node:assert/strict");
const { loadData } = require("./load-data.js");

const { KIT_VER_DATES, KITS, WEAPON_CLASSES, MAIN_WEAPONS } = loadData();

const KINDS = new Set(["b", "n", "m"]);
const SRCS = new Set(["main", "sub", "spe", "sp"]);
const classIds = new Set(WEAPON_CLASSES.map(c => c.id));
const mainIds = new Set(MAIN_WEAPONS.map(w => w.id));
const verSet = new Set(Object.keys(KIT_VER_DATES));

test("個別ブキデータが読み込めている", () => {
  assert.ok(typeof KIT_VER_DATES === "object" && Object.keys(KIT_VER_DATES).length > 0);
  assert.ok(Array.isArray(KITS) && KITS.length > 0);
});

test("KITS の各エントリの構造が正しい（id一意 / cat・mainId が実在 / 必須フィールド）", () => {
  const errs = [];
  const ids = new Set();
  for (const k of KITS) {
    if (ids.has(k.id)) errs.push(`重複ID: ${k.id}`);
    ids.add(k.id);
    if (!k.name) errs.push(`${k.id}: name 欠落`);
    if (!classIds.has(k.cat)) errs.push(`${k.id}: 不明な cat=${k.cat}`);
    if (!mainIds.has(k.mainId)) errs.push(`${k.id}: 不明な mainId=${k.mainId}`);
    if (!k.sub) errs.push(`${k.id}: sub 欠落`);
    if (!k.spe) errs.push(`${k.id}: spe 欠落`);
    if (typeof k.sp !== "number") errs.push(`${k.id}: sp が数値でない`);
    if (!k.intro) errs.push(`${k.id}: intro 欠落`);
    if (!Array.isArray(k.changes)) errs.push(`${k.id}: changes が配列でない`);
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});

test("レプリカ（ヒーロー/オクタ/オーダー）は除外されている", () => {
  const replicas = KITS.filter(k => k.name.includes("レプリカ")).map(k => k.name);
  assert.equal(replicas.length, 0, `レプリカが混入: ${replicas.join(", ")}`);
});

test("各調整イベントが整合している（v∈KIT_VER_DATES / k∈b,n,m / note非空 / s は有効な出典）", () => {
  const errs = [];
  for (const k of KITS) {
    for (const c of k.changes) {
      if (!verSet.has(c.v)) errs.push(`${k.id}: 未定義バージョン ${c.v}`);
      if (!KINDS.has(c.k)) errs.push(`${k.id} ${c.v}: 不正な k=${c.k}`);
      if (!c.note || !String(c.note).trim()) errs.push(`${k.id} ${c.v}: note が空`);
      if (!Array.isArray(c.s) || c.s.length === 0) errs.push(`${k.id} ${c.v}: s が空`);
      for (const s of (c.s || [])) if (!SRCS.has(s)) errs.push(`${k.id} ${c.v}: 不正な出典 ${s}`);
    }
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});

test("各ブキの調整履歴は日付の昇順", () => {
  const errs = [];
  for (const k of KITS) {
    const ds = k.changes.map(c => KIT_VER_DATES[c.v]);
    for (let i = 1; i < ds.length; i++) if (ds[i] < ds[i - 1]) errs.push(`${k.id}: ${k.changes[i].v} が時系列順でない`);
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});

test("KIT_VER_DATES の各バージョンは少なくとも1件の調整で参照されている", () => {
  const used = new Set();
  KITS.flatMap(k => k.changes).forEach(c => used.add(c.v));
  const orphan = [...verSet].filter(v => !used.has(v));
  assert.equal(orphan.length, 0, `孤立バージョン: ${orphan.join(", ")}`);
});

test("KIT_VER_DATES の日付は YYYY-MM-DD 形式", () => {
  for (const [v, d] of Object.entries(KIT_VER_DATES)) {
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/, `${v} の日付 ${d} が不正`);
  }
});

test("メイン由来の調整は、そのメインの軌跡(MAIN_WEAPONS)と整合する", () => {
  // 各キットの src=main の (version) は、対応する MAIN_WEAPONS[mainId] にも同じ version の変更が存在するはず
  const mainByVer = {};
  for (const w of MAIN_WEAPONS) mainByVer[w.id] = new Set(w.changes.map(c => c.v));
  const errs = [];
  for (const k of KITS) {
    for (const c of k.changes) {
      if (c.s.includes("main") && !(mainByVer[k.mainId] && mainByVer[k.mainId].has(c.v))) {
        errs.push(`${k.id} ${c.v}: メイン由来だが ${k.mainId} の軌跡に該当版なし`);
      }
    }
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});
