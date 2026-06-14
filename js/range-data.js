/* ============ メインブキ 射程データ ============
   range: ゲーム内「射程」バー基準（0〜100）のおおよその参考値。
          チャージ系はフルチャージ、ワイパーはタメ斬り、ローラー／フデは
          縦振り・塗り射程など、そのブキの主たる間合いを採用した近似値。
   id は MAIN_WEAPONS（mains-data.js）と共通。
   ※ 公式の数値表記ではなく、対面距離の体感をそろえるための編集値。 */
const WEAPON_RANGE = {
 /* シューター */
 bold:14, wakaba:22, sharp:30, promodeler:22, sshooter:36, gal52:41,
 nzap:36, prime:47, gal96:50, jet:58, space:44, l3:31, h3:47, bottle:43,
 /* ブラスター */
 nova:18, hot:25, long:40, clash:18, rapid:50, relite:62, sblast:30,
 /* ローラー（縦振り／飛沫の届く距離）*/
 carbon:14, sroller:20, dynamo:30, variable:24, wide:17,
 /* チャージャー（フルチャージ）*/
 squiffer:60, scharger:85, liter:100, bamboo:75, soytuber:92, rpen:84,
 /* スロッシャー */
 bucket:38, hissen:28, screw:40, overflosher:62, explosher:70, mopplin:40,
 /* スピナー（最大チャージ）*/
 sspinner:44, barrel:58, hydra:63, kugel:55, nautilus:44, examiner:58,
 /* マニューバー */
 spattery:20, smaneuver:36, kelvin:50, dual:50, quad:30, gaen:22,
 /* シェルター（射撃の届く距離）*/
 para:25, camp:45, spy:30, s24:30,
 /* フデ（塗り進み＋振りの間合い）*/
 pablo:12, hokusai:14, vincent:18,
 /* ストリンガー（フルチャージ）*/
 tri:55, lact:50, fluid:58,
 /* ワイパー（タメ斬り）*/
 jim:53, drive:40, dental:45,
};

/* カテゴリごとに「射程」が指す主たる間合いのラベル */
const RANGE_KIND = {
 charger:"フルチャージ", stringer:"フルチャージ", splatling:"最大チャージ",
 splatana:"タメ斬り", roller:"縦振り", brush:"塗り＋振り", brella:"射撃",
};
const rangeKindOf = cat => RANGE_KIND[cat] || "メイン射撃";
