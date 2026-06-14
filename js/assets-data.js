/* ============ 画像アセット マニフェスト ============
   画像出典: スプラトゥーン3 ゲーム内アセット（Leanny/splat3 ミラー経由）
   ブキ画像は assets/img/weapons/<id>.png （id は MAIN_WEAPONS と共通） */
const ASSET_PATHS = {
  weapons:"assets/img/weapons/",
  stages:"assets/img/stages/",
  gearpowers:"assets/img/gearpowers/",
};
const weaponImg = id => `${ASSET_PATHS.weapons}${id}.png`;

/* 対戦ステージ（assets/img/stages/<id>.png） */
const STAGES = [
 {id:"twist", name:"オヒョウ海運"},
 {id:"propeller", name:"カジキ空港"},
 {id:"pivot", name:"キンメダイ美術館"},
 {id:"bigslope", name:"クサヤ温泉"},
 {id:"manbou", name:"グランドバンカラアリーナ"},
 {id:"wave", name:"コンブトラック"},
 {id:"district", name:"ゴンズイ地区"},
 {id:"line", name:"ザトウマーケット"},
 {id:"carousel", name:"スメーシーワールド"},
 {id:"spider", name:"タカアシ経済特区"},
 {id:"section", name:"タラポートショッピングパーク"},
 {id:"nagasaki", name:"チョウザメ造船"},
 {id:"crank", name:"デカライン高架下"},
 {id:"scrap", name:"ナメロウ金属"},
 {id:"factory", name:"ナンプラー遺跡"},
 {id:"ruins", name:"ネギトロ炭鉱"},
 {id:"cross", name:"バイガイ亭"},
 {id:"jyoheki", name:"ヒラメが丘団地"},
 {id:"kaisou", name:"マサバ海峡大橋"},
 {id:"temple", name:"マテガイ放水路"},
 {id:"hiagari", name:"マヒマヒリゾート＆スパ"},
 {id:"pillar", name:"マンタマリア号"},
 {id:"yagara", name:"ヤガラ市場"},
 {id:"yunohana", name:"ユノハナ大渓谷"},
 {id:"autowalk", name:"リュウグウターミナル"},
 {id:"upland", name:"海女美術大学"},
];

/* ギアパワー（assets/img/gearpowers/<id>.png） */
const GEAR_POWERS = [
 {id:"action_up", name:"アクション強化"},
 {id:"squidmove_up", name:"イカダッシュ速度アップ"},
 {id:"squidmovespatter_reduction", name:"イカニンジャ"},
 {id:"subink_save", name:"インク効率アップ(サブ)"},
 {id:"mainink_save", name:"インク効率アップ(メイン)"},
 {id:"inkrecovery_up", name:"インク回復力アップ"},
 {id:"comeback", name:"カムバック"},
 {id:"subeffect_reduction", name:"サブ影響軽減"},
 {id:"subspec_up", name:"サブ性能アップ"},
 {id:"thermalink", name:"サーマルインク"},
 {id:"startallup", name:"スタートダッシュ"},
 {id:"superjumpsign_hide", name:"ステルスジャンプ"},
 {id:"specialincrease_up", name:"スペシャル増加量アップ"},
 {id:"specialspec_up", name:"スペシャル性能アップ"},
 {id:"respawnspecialgauge_save", name:"スペシャル減少量ダウン"},
 {id:"jumptime_save", name:"スーパージャンプ時間短縮"},
 {id:"humanmove_up", name:"ヒト移動速度アップ"},
 {id:"endallup", name:"ラストスパート"},
 {id:"deathmarking", name:"リベンジ"},
 {id:"somersaultlanding", name:"受け身術"},
 {id:"objecteffect_up", name:"対物攻撃力アップ"},
 {id:"exorcist", name:"復活ペナルティアップ"},
 {id:"respawntime_save", name:"復活時間短縮"},
 {id:"opinkeffect_reduction", name:"相手インク影響軽減"},
 {id:"exskilldouble", name:"追加ギアパワー倍化"},
 {id:"minorityup", name:"逆境強化"},
];
