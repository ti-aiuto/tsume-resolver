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

class Koma {
  constructor(nari = false) {
    if (!this.canBeNari && nari) {
      throw new Error('nari不可');
    }
    this.nari = nari;
  }

  get label() {
    throw new Error('NotImplemented');
  }

  get canBeNari() {
    throw new Error('NotImplemented');
  }

  clone() {
    throw new Error('NotImplemented');
  }

  toJSON() {
    return {
      label: this.label,
      nari: this.nari,
    };
  }
}

class KomaFu extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    if (this.nari) {
      return KOMA_TOKIN;
    } else {
      return KOMA_FU;
    }
  }

  get canBeNari() {
    return true;
  }

  clone() {
    return new KomaFu(this.nari);
  }
}

class KomaKyo extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    if (this.nari) {
      return KOMA_NARI_KYO;
    } else {
      return KOMA_KYO;
    }
  }

  get canBeNari() {
    return true;
  }

  clone() {
    return new KomaKyo(this.nari);
  }
}

class KomaKei extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    if (this.nari) {
      return KOMA_NARI_KEI;
    } else {
      return KOMA_KEI;
    }
  }

  get canBeNari() {
    return true;
  }

  clone() {
    return new KomaKei(this.nari);
  }
}

class KomaKaku extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    if (this.nari) {
      return KOMA_UMA;
    } else {
      return KOMA_KAKU;
    }
  }

  get canBeNari() {
    return true;
  }

  clone() {
    return new KomaKaku(this.nari);
  }
}

class KomaHisha extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    if (this.nari) {
      return KOMA_RYU;
    } else {
      return KOMA_HISHA;
    }
  }

  get canBeNari() {
    return true;
  }

  clone() {
    return new KomaHisha(this.nari);
  }
}

class KomaKin extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    return KOMA_KIN;
  }

  get canBeNari() {
    return false;
  }

  clone() {
    return new KomaKin(this.nari);
  }
}

class KomaGin extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    if (this.nari) {
      return KOMA_NARI_GIN;
    } else {
      return KOMA_GIN;
    }
  }

  get canBeNari() {
    return true;
  }

  clone() {
    return new KomaGin(this.nari);
  }
}

class KomaGyoku extends Koma {
  constructor(nari) {
    super(nari);
  }

  get label() {
    return KOMA_GYOKU;
  }

  get canBeNari() {
    return false;
  }

  clone() {
    return new KomaGyoku(this.nari);
  }
}

function createKoma(name, nari) {
  if (name === '歩') {
    return new KomaFu(nari);
  } else if (name === '香') {
    return new KomaKyo(nari);
  } else if (name === '桂') {
    return new KomaKei(nari);
  } else if (name === '角') {
    return new KomaKaku(nari);
  } else if (name === '飛') {
    return new KomaHisha(nari);
  } else if (name === '金') {
    return new KomaKin(nari);
  } else if (name === '銀') {
    return new KomaGin(nari);
  } else if (name === '玉') {
    return new KomaGyoku(nari);
  } else {
    throw new Error(`${name}は未定義`);
  }
}

class BanSnapshot {
  constructor() {
    this.onBoard = this.createEmptyBoard();
    this.senteCaptured = [];
    this.goteCaptured = [];
  }

  putSenteOnBoard(suji, dan, koma) {
    const i = this.sujiToArrayIndex(suji);
    const j = this.danToArrayIndex(dan);
    this.onBoard[i][j] = { koma, owner: 'sente' };
    return this;
  }

  putGoteOnBoard(suji, dan, koma) {
    const i = this.sujiToArrayIndex(suji);
    const j = this.danToArrayIndex(dan);
    this.onBoard[i][j] = { koma, owner: 'gote' };
    return this;
  }

  addSenteCaptured(koma) {
    this.senteCaptured.push({ koma });
    return this;
  }

  addGoteCaptured(koma) {
    this.goteCaptured.push({ koma });
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
    console.log('onBoard', JSON.stringify(this.onBoard, null, '  '));
    console.log(
      'senteCaptured',
      JSON.stringify(this.senteCaptured, null, '  '),
    );
    console.log('goteCaptured', JSON.stringify(this.goteCaptured, null, '  '));
  }
}

function loadBanSnapshot(json) {
  const banSnapshot = new BanSnapshot();

  json['initial_koma']['on_board']['sente'].forEach((koma) => {
    banSnapshot.putSenteOnBoard(
      koma['suji'],
      koma['dan'],
      createKoma(koma['name'], koma['nari']),
    );
  });

  json['initial_koma']['on_board']['gote'].forEach((koma) => {
    banSnapshot.putGoteOnBoard(
      koma['suji'],
      koma['dan'],
      createKoma(koma['name'], koma['nari']),
    );
  });

  json['initial_koma']['captured']['sente'].forEach((koma) =>
    banSnapshot.addSenteCaptured(createKoma(koma['name'], false)),
  );

  json['initial_koma']['captured']['gote'].forEach((koma) =>
    banSnapshot.addGoteCaptured(createKoma(koma['name'], false)),
  );

  return banSnapshot;
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const ban = loadBanSnapshot(json);

  ban.debug();

  // 作戦
  // banに状態を全て読み込む
  // banに対して「王手」となる操作を行う
  //   制約：その操作が王手であること、反則でないこと、
  // 王手が続いて最後に「詰み」となった場合、その「操作」の一覧を返却する
  //   「王手」が続かない場合はそれ以上探索しない
}
main();
