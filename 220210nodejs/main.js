// 220210の目標：いったんテストコード無し・OOPなしで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

function createBanSnapshot(onBoard, senteCaptured, goteCaptured) {
  return {
    onBoard,
    senteCaptured,
    goteCaptured,
  };
}

function createEmptyBoard() {
  const result = [];
  for (let i = 0; i < 9; i++) {
    result[i] = [];
    for (let j = 0; j < 9; j++) {
      result[i][j] = null;
    }
  }
  return result;
}

const KOMA_FU = 'FU';
const KOMA_KYO = 'KYO';
const KOMA_KEI = 'KEI';
const KOMA_KAKU = 'KAKU';
const KOMA_HISHA = 'HISHA';
const KOMA_KIN = 'KIN';
const KOMA_GIN = 'GIN';
const KOMA_GYOKU = 'GYOKU';
const KOMA_TOKIN = 'TOKIN';
const KOMA_NARI_KYO = 'NARI_KYO';
const KOMA_NARI_KEI = 'NARI_KEI';
const KOMA_UMA = 'UMA';
const KOMA_RYU = 'RYU';
const KOMA_NARI_GIN = 'NARI_GIN';

const komaNameToCodeMap = Object.freeze({
  nari: {
    歩: KOMA_TOKIN,
    香: KOMA_NARI_KYO,
    桂: KOMA_NARI_KEI,
    角: KOMA_UMA,
    飛: KOMA_RYU,
    銀: KOMA_NARI_GIN,
  },
  narazu: {
    歩: KOMA_FU,
    香: KOMA_KYO,
    桂: KOMA_KEI,
    角: KOMA_KAKU,
    飛: KOMA_HISHA,
    金: KOMA_KIN,
    銀: KOMA_GIN,
    玉: KOMA_GYOKU,
  },
});

function komaNameToCode(name, nari) {
  const firstLevelKey = nari ? 'nari' : 'narazu';
  const value = komaNameToCodeMap[firstLevelKey][name];
  if (!value) {
    throw new Error(`${name}は未定義`);
  }
  return value;
}

function sujiToArrayIndex(suji) {
  return suji - 1;
}

function danToArrayIndex(dan) {
  return dan - 1;
}

function loadBanSnapshot(json) {
  const onBoard = createEmptyBoard();

  json['initial_koma']['on_board']['sente'].forEach((koma) => {
    onBoard[sujiToArrayIndex(koma['suji'])][danToArrayIndex(koma['dan'])] = {
      code: komaNameToCode(koma['name'], koma['nari']),
      owner: 'sente',
    };
  });

  json['initial_koma']['on_board']['gote'].forEach((koma) => {
    onBoard[sujiToArrayIndex(koma['suji'])][danToArrayIndex(koma['dan'])] = {
      code: komaNameToCode(koma['name'], koma['nari']),
      owner: 'sente',
    };
  });

  return createBanSnapshot(
    onBoard,
    json['initial_koma']['captured']['sente'].map((item) =>
      komaNameToCode(item['name'], false),
    ),
    json['initial_koma']['captured']['gote'].map((item) =>
      komaNameToCode(item['name'], false),
    ),
  );
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const ban = loadBanSnapshot(json);

  console.log(JSON.stringify(ban, null, '  '));

  // 作戦
  // banに状態を全て読み込む
  // banに対して「王手」となる操作を行う
  //   制約：その操作が王手であること、反則でないこと、
  // 王手が続いて最後に「詰み」となった場合、その「操作」の一覧を返却する
  //   「王手」が続かない場合はそれ以上探索しない
}
main();
