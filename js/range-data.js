/* ============ メインブキ 射程データ ============
   value: 有効射程（実用・確定距離）の近似値。試し撃ち場の「ライン（メモリ）」で
          計測された各記事の射程値を突き合わせ、リッター4K（フルチャージ＝約6.2
          ライン）を 100 とした比例スケールに正規化したもの（最短のパブロ＝12）。
   計測の基準となる攻撃は RANGE_KIND を参照（チャージャー／ストリンガーはフル
   チャージ、スピナーは最大チャージ、ワイパーはタメ斬り＝縦斬り、ローラーは縦振り、
   ブラスターは直撃弾、マニューバーは立ち撃ち、フデは振り、シェルターはゲーム内射程）。
   id は MAIN_WEAPONS（mains-data.js）と共通。
   主な出典: アルテマ「武器の射程ランキング」、攻略大百科（gamepedia）、Game8、
   各ブキ攻略Wiki の射程比較（2026年6月時点）。公式の正確な数値表記ではない近似値。 */
const WEAPON_RANGE = {
 /* シューター */
 bold:23, wakaba:32, sharp:31, promodeler:32, sshooter:37, gal52:40,
 nzap:36, prime:50, gal96:53, jet:66, space:52, l3:45, h3:50, bottle:56,
 /* ブラスター（直撃弾の距離）*/
 nova:24, hot:32, long:45, clash:31, rapid:48, relite:58, sblast:44,
 /* ローラー（縦振り／飛沫の届く距離）*/
 carbon:16, sroller:21, dynamo:32, variable:24, wide:19,
 /* チャージャー（フルチャージ）*/
 squiffer:61, scharger:82, liter:100, bamboo:71, soytuber:70, rpen:81,
 /* スロッシャー */
 bucket:52, hissen:39, screw:47, overflosher:74, explosher:69, mopplin:50,
 /* スピナー（最大チャージ）*/
 sspinner:48, barrel:64, hydra:73, kugel:65, nautilus:53, examiner:56,
 /* マニューバー（立ち撃ち）*/
 spattery:26, smaneuver:35, kelvin:42, dual:48, quad:40, gaen:52,
 /* シェルター（射撃の届く距離）*/
 para:27, camp:40, spy:31, s24:35,
 /* フデ（振りの間合い）*/
 pablo:12, hokusai:15, vincent:29,
 /* ストリンガー（フルチャージ）*/
 tri:80, lact:54, fluid:64,
 /* ワイパー（タメ斬り）*/
 jim:72, drive:56, dental:59,
};

/* カテゴリごとに「射程」が指す主たる間合いのラベル */
const RANGE_KIND = {
 charger:"フルチャージ", stringer:"フルチャージ", splatling:"最大チャージ",
 splatana:"タメ斬り", roller:"縦振り", brush:"塗り＋振り", brella:"射撃",
 blaster:"直撃弾",
};
const rangeKindOf = cat => RANGE_KIND[cat] || "メイン射撃";
