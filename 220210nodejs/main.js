// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
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

class BanSnapshot {
  constructor() {
    this.onBoard = this.createEmptyBoard();
    this.senteCaptured = [];
    this.goteCaptured = [];
  }

  putSenteOnBoard(suji, dan, code) {
    const i = this.sujiToArrayIndex(suji);
    const j = this.danToArrayIndex(dan);
    this.onBoard[i][j] = { code, owner: 'sente' };
    return this;
  }

  putGoteOnBoard(suji, dan, code) {
    const i = this.sujiToArrayIndex(suji);
    const j = this.danToArrayIndex(dan);
    this.onBoard[i][j] = { code, owner: 'gote' };
    return this;
  }

  addSenteCaptured(code) {
    this.senteCaptured.push({ code });
    return this;
  }

  addGoteCaptured(code) {
    this.goteCaptured.push({ code });
    return this;
  }

  createEmptyBoard() {
    const result = [];
    for (let i = 0; i < 9; i++) {
      result[i] = [];
      for (let j = 0; j < 9; j++) {
        result[i][j] = null;
      }
    }
    return result;
  }

  sujiToArrayIndex(suji) {
    return suji - 1;
  }

  danToArrayIndex(dan) {
    return dan - 1;
  }

  debug() {
    console.log(JSON.stringify(this.onBoard, null, '  '));
    console.log(JSON.stringify(this.senteCaptured, null, '  '));
    console.log(JSON.stringify(this.goteCaptured, null, '  '));
  }
}

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

function loadBanSnapshot(json) {
  const banSnapshot = new BanSnapshot();

  json['initial_koma']['on_board']['sente'].forEach((koma) => {
    banSnapshot.putSenteOnBoard(
      koma['suji'],
      koma['dan'],
      komaNameToCode(koma['name'], koma['nari']),
    );
  });

  json['initial_koma']['on_board']['gote'].forEach((koma) => {
    banSnapshot.putGoteOnBoard(
      koma['suji'],
      koma['dan'],
      komaNameToCode(koma['name'], koma['nari']),
    );
  });

  json['initial_koma']['captured']['sente'].forEach((item) =>
    banSnapshot.addSenteCaptured(komaNameToCode(item['name'], false)),
  );

  json['initial_koma']['captured']['gote'].forEach((item) =>
    banSnapshot.addGoteCaptured(komaNameToCode(item['name'], false)),
  );

  return banSnapshot;
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
