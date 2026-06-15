/* ============ データファイル読み込みヘルパー ============
   js/*-data.js はブラウザ向けに `const X = ...` で
   グローバルを定義する素のスクリプト。DOM 非依存なので、
   vm で同一コンテキストに評価し、必要な識別子を取り出す。 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const FILES = [
  "js/assets-data.js",
  "js/weapons-data.js",
  "js/mains-data.js",
  "js/range-data.js",
  "js/kits-data.js",
];
const EXPORTS = [
  "ASSET_PATHS", "weaponImg",
  "VER_DATES", "WEAPON_CLASSES", "WEAPON_CHANGES",
  "MAIN_WEAPONS",
  "WEAPON_RANGE", "RANGE_KIND", "rangeKindOf",
  "KIT_VER_DATES", "KITS",
];

function loadData() {
  const code =
    FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n") +
    `\n;globalThis.__exports = { ${EXPORTS.join(", ")} };`;
  const ctx = vm.createContext({ globalThis: {} });
  ctx.globalThis = ctx; // 自己参照で globalThis を解決可能に
  vm.runInContext(code, ctx, { filename: "data-bundle.js" });
  return ctx.__exports;
}

module.exports = { loadData };
