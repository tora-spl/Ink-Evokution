const test = require("node:test");
const assert = require("node:assert/strict");
const { loadData } = require("./load-data.js");

const { MAIN_WEAPONS, WEAPON_CLASSES, WEAPON_RANGE, RANGE_KIND, rangeKindOf } = loadData();

test("射程データが読み込めている", () => {
  assert.ok(Array.isArray(MAIN_WEAPONS) && MAIN_WEAPONS.length > 0);
  assert.equal(typeof WEAPON_RANGE, "object");
  assert.equal(typeof rangeKindOf, "function");
});

test("全メインブキに射程データが定義されている", () => {
  const missing = MAIN_WEAPONS.filter(w => WEAPON_RANGE[w.id] == null).map(w => w.id);
  assert.equal(missing.length, 0, `射程が未定義のブキ: ${missing.join(", ")}`);
});

test("WEAPON_RANGE に未知のブキIDが混ざっていない", () => {
  const validIds = new Set(MAIN_WEAPONS.map(w => w.id));
  const unknown = Object.keys(WEAPON_RANGE).filter(id => !validIds.has(id));
  assert.equal(unknown.length, 0, `存在しないブキID: ${unknown.join(", ")}`);
});

test("射程値はすべて 0〜100 の数値", () => {
  for (const [id, v] of Object.entries(WEAPON_RANGE)) {
    assert.equal(typeof v, "number", `${id} の射程が数値でない`);
    assert.ok(Number.isFinite(v), `${id} の射程が有限でない`);
    assert.ok(v >= 0 && v <= 100, `${id} の射程 ${v} が 0〜100 の範囲外`);
  }
});

test("rangeKindOf は全カテゴリで非空ラベルを返す", () => {
  for (const c of WEAPON_CLASSES) {
    const label = rangeKindOf(c.id);
    assert.equal(typeof label, "string");
    assert.ok(label.length > 0, `${c.id} のラベルが空`);
  }
});

test("rangeKindOf はカテゴリ別ラベルとデフォルトを正しく返す", () => {
  // RANGE_KIND に定義のあるカテゴリはその値
  for (const [cat, label] of Object.entries(RANGE_KIND)) {
    assert.equal(rangeKindOf(cat), label);
  }
  // 未定義カテゴリはデフォルト「メイン射撃」
  assert.equal(rangeKindOf("shooter"), "メイン射撃");
  assert.equal(rangeKindOf("__unknown__"), "メイン射撃");
});

test("最長はリッター4K(100)・最短はパブロ(12)", () => {
  const sorted = MAIN_WEAPONS
    .map(w => ({ id: w.id, r: WEAPON_RANGE[w.id] }))
    .sort((a, b) => b.r - a.r);
  assert.equal(sorted[0].id, "liter");
  assert.equal(sorted[0].r, 100);
  assert.equal(sorted[sorted.length - 1].id, "pablo");
  assert.equal(sorted[sorted.length - 1].r, 12);
});
