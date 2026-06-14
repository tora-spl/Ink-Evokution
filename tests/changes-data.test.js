const test = require("node:test");
const assert = require("node:assert/strict");
const { loadData } = require("./load-data.js");

const { VER_DATES, WEAPON_CLASSES, WEAPON_CHANGES, MAIN_WEAPONS } = loadData();

const KINDS = new Set(["b", "n", "m"]);
const classIds = new Set(WEAPON_CLASSES.map(c => c.id));
const verSet = new Set(Object.keys(VER_DATES));

test("調整データが読み込めている", () => {
  assert.ok(typeof VER_DATES === "object" && Object.keys(VER_DATES).length > 0);
  assert.ok(Array.isArray(WEAPON_CLASSES) && WEAPON_CLASSES.length > 0);
  assert.ok(typeof WEAPON_CHANGES === "object");
  assert.ok(Array.isArray(MAIN_WEAPONS) && MAIN_WEAPONS.length > 0);
});

test("WEAPON_CHANGES のキーはすべて実在のブキ種", () => {
  const bad = Object.keys(WEAPON_CHANGES).filter(k => !classIds.has(k));
  assert.equal(bad.length, 0, `不明なブキ種キー: ${bad.join(", ")}`);
});

test("WEAPON_CHANGES の各エントリが整合している（v は VER_DATES に存在 / k は b,n,m / note 非空）", () => {
  const errs = [];
  for (const [cls, list] of Object.entries(WEAPON_CHANGES)) {
    for (const c of list) {
      if (!verSet.has(c.v)) errs.push(`${cls}: 未定義バージョン ${c.v}`);
      if (!KINDS.has(c.k)) errs.push(`${cls} ${c.v}: 不正な k=${c.k}`);
      if (!c.note || !String(c.note).trim()) errs.push(`${cls} ${c.v}: note が空`);
    }
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});

test("MAIN_WEAPONS の各エントリが整合している（cat 実在 / v は VER_DATES に存在 / k は b,n,m / note 非空）", () => {
  const errs = [];
  for (const w of MAIN_WEAPONS) {
    if (!classIds.has(w.cat)) errs.push(`${w.id}: 不明な cat=${w.cat}`);
    for (const c of w.changes) {
      if (!verSet.has(c.v)) errs.push(`${w.id}: 未定義バージョン ${c.v}`);
      if (!KINDS.has(c.k)) errs.push(`${w.id} ${c.v}: 不正な k=${c.k}`);
      if (!c.note || !String(c.note).trim()) errs.push(`${w.id} ${c.v}: note が空`);
    }
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});

test("各ブキの調整履歴は日付の昇順で並んでいる", () => {
  const errs = [];
  for (const w of MAIN_WEAPONS) {
    const dates = w.changes.map(c => VER_DATES[c.v]);
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i - 1]) errs.push(`${w.id}: ${w.changes[i].v} が時系列順でない`);
    }
  }
  assert.equal(errs.length, 0, errs.join(" / "));
});

test("VER_DATES の各バージョンは少なくとも1件の調整で参照されている（孤立バージョンなし）", () => {
  const used = new Set();
  Object.values(WEAPON_CHANGES).flat().forEach(c => used.add(c.v));
  MAIN_WEAPONS.flatMap(w => w.changes).forEach(c => used.add(c.v));
  const orphan = [...verSet].filter(v => !used.has(v));
  assert.equal(orphan.length, 0, `どの調整からも参照されないバージョン: ${orphan.join(", ")}`);
});

test("VER_DATES の日付は YYYY-MM-DD 形式", () => {
  for (const [v, d] of Object.entries(VER_DATES)) {
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/, `${v} の日付 ${d} が不正な形式`);
  }
});
