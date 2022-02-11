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
const OWNER_SENTE = 'SENTE';
const OWNER_GOTE = 'GOTE';

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

  possibleStepVectors() {
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

  beNari() {
    if (!this.canBeNari) {
      throw new Error('nari不可');
    }
    const cloned = this.clone();
    cloned.nari = true;
    return cloned;
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

  possibleStepVectors() {
    if (this.nari) {
      return [
        [0, 1],
        [-1, 1],
        [1, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
    } else {
      return [[0, 1]];
    }
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

  possibleStepVectors() {
    if (this.nari) {
      return [
        [0, 1],
        [-1, 1],
        [1, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
    } else {
      return [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
      ];
    }
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

  possibleStepVectors() {
    if (this.nari) {
      return [
        [0, 1],
        [-1, 1],
        [1, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
    } else {
      return [
        [1, 2],
        [-1, 2],
      ];
    }
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

  possibleStepVectors() {
    const steps = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
      [8, 8],
      [1, -1],
      [2, -2],
      [3, -3],
      [4, -4],
      [5, -5],
      [6, -6],
      [7, -7],
      [8, -8],
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-4, 4],
      [-5, 5],
      [-6, 6],
      [-7, 7],
      [-8, 8],
      [-1, -1],
      [-2, -2],
      [-3, -3],
      [-4, -4],
      [-5, -5],
      [-6, -6],
      [-7, -7],
      [-8, -8],
    ];
    if (this.nari) {
      return [...steps, [0, 1], [0, -1], [-1, 0], [1, 0]];
    } else {
      return steps;
    }
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

  possibleStepVectors() {
    const steps = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [0, -1],
      [0, -2],
      [0, -3],
      [0, -4],
      [0, -5],
      [0, -6],
      [0, -7],
      [0, -8],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
      [-1, 0],
      [-2, 0],
      [-3, 0],
      [-4, 0],
      [-5, 0],
      [-6, 0],
      [-7, 0],
      [-8, 0],
    ];
    if (this.nari) {
      return [...steps, [-1, 1], [1, 1], [-1, -1], [1, -1]];
    } else {
      return steps;
    }
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

  possibleStepVectors() {
    return [
      [0, 1],
      [-1, 1],
      [1, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
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

  possibleStepVectors() {
    if (this.nari) {
      return [
        [0, 1],
        [-1, 1],
        [1, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
    } else {
      return [
        [0, 1],
        [-1, 1],
        [1, 1],
        [1, -1],
        [-1, -1],
      ];
    }
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

  possibleStepVectors() {
    return [
      [0, 1],
      [-1, 1],
      [1, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, -1],
      [-1, -1],
    ];
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

class BanPoint {
  constructor(suji, dan) {
    if (BanPoint.isValidSuji(suji)) {
      this.suji = suji;
    } else {
      throw new Error(`suji: ${suji}は不正な値`);
    }
    if (BanPoint.isValidDan(dan)) {
      this.dan = dan;
    } else {
      throw new Error(`dan: ${dan}は不正な値`);
    }
  }

  equals(banPoint) {
    return this.suji === banPoint.suji && this.dan === banPoint.dan;
  }

  applyStepVencor(vector) {
    const nextSuji = this.suji + vector[0];
    const nextDan = this.dan + vector[1];
    if (BanPoint.isValidSuji(nextSuji) && BanPoint.isValidDan(nextDan)) {
      return new BanPoint(nextSuji, nextDan);
    } else {
      return null;
    }
  }

  static isValidSuji(suji) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(suji);
  }

  static isValidDan(dan) {
    return this.isValidSuji(dan); // 同じロジックでOK
  }
}

class BanSide {
  constructor(side) {
    this.side = side;
  }

  equals(other) {
    return this.side === other.side;
  }

  opposite() {
    if (this.side === OWNER_SENTE) {
      return BanSide.createGoteSide();
    } else {
      return BanSide.createSenteSide();
    }
  }

  static createSenteSide() {
    return new BanSide(OWNER_SENTE);
  }

  static createGoteSide() {
    return new BanSide(OWNER_GOTE);
  }
}

class BanKoma {
  constructor(koma, side, banPoint) {
    this.koma = koma;
    this.side = side;
    this.banPoint = banPoint;
  }

  get isOnBoard() {
    return !!this.banPoint;
  }

  get isCaptured() {
    return !this.isOnBoard;
  }

  // その駒を動かして王手にできる手の配列(BanCommand[])を返す
  // TODO: 実装
  findNextMovingOtes(banSnapshot, gyokuBanKoma) {
    // 制約条件
    // 盤の範囲内であること
    // 盤に自分側の駒がないこと
    // その移動が王手であること
    //　成るかどうかは呼び出し側で決める
    // 二歩でないこと ← いったん無視
    //  歩で詰かどうかは呼び出し側でチェックする ← 一番最後に実装
    const mySide = gyokuBanKoma.side.opposite();

    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = this.nextValidRangeBanPoints();

    // 自分の駒がいない点
    const notOccupyingPoints = nextValidRangeBanPoints.filter((banPoint) =>
      banSnapshot.canPutAtBanPointBySide(banPoint, mySide),
    );

    // 移動してみて成る場合とならない場合のBanKomaを生成してみる
    const nextPossibleBanKomas = [];
    notOccupyingPoints.forEach((banPoint) =>
      nextPossibleBanKomas.push(...this.moveToBanPoint(banPoint)),
    );

    // そのBanKomaの移動先の点が敵玉の点と一致すること
    const nextOtePossibleBanKomas = nextPossibleBanKomas.filter((nextBanKoma) =>
      nextBanKoma.isInPownerOfMove(gyokuBanKoma),
    );

    console.log('王手');
    console.log(this);
    console.log(nextOtePossibleBanKomas);
  }

  findNextPuttingOtes() {
    // TODO: 実装する
  }

  // この駒が次に移動できる先
  nextValidRangeBanPoints() {
    const stepVectors = this.koma.possibleStepVectors();
    return stepVectors
      .map((stepVector) => this.banPoint.applyStepVencor(stepVector))
      .filter((item) => item);
  }

  // この駒の効きに引数の駒が入っているかどうか
  isInPownerOfMove(otherBanKoma) {
    return this.nextValidRangeBanPoints().some((banPoint) =>
      otherBanKoma.banPoint.equals(banPoint),
    );
  }

  moveToBanPoint(banPoint) {
    const result = [];
    if (this.koma.canBeNari) {
      result.push(new BanKoma(this.koma.beNari(), this.side, banPoint));
    }
    result.push(new BanKoma(this.koma, this.side, banPoint));
    return result;
  }
}

class BanSnapshot {
  constructor() {
    this.banKomas = [];
  }

  putSenteOnBoard(banPoint, koma) {
    if (this.findBanKomaByBanPoint(banPoint)) {
      new Error('既に駒が存在');
    }
    this.banKomas.push(new BanKoma(koma, BanSide.createSenteSide(), banPoint));
    return this;
  }

  putGoteOnBoard(banPoint, koma) {
    if (this.findBanKomaByBanPoint(banPoint)) {
      new Error('既に駒が存在');
    }
    this.banKomas.push(new BanKoma(koma, BanSide.createGoteSide(), banPoint));
    return this;
  }

  addSenteCaptured(koma) {
    this.banKomas.push(new BanKoma(koma, BanSide.createSenteSide()));
    return this;
  }

  addGoteCaptured(koma) {
    this.banKomas.push(new BanKoma(koma, BanSide.createGoteSide()));
    return this;
  }

  canPutAtBanPointBySide(banPoint, banSide) {
    const occupyingBanKoma = this.findBanKomaByBanPoint(banPoint);
    return !occupyingBanKoma || !occupyingBanKoma.side.equals(banSide);
  }

  findBanKomaByBanPoint(banPoint) {
    return this.banKomas.find((banKoma) => banKoma.banPoint?.equals(banPoint));
  }

  findOnBoardBanKomasBySide(side) {
    return this.banKomas.filter(
      (banKoma) => banKoma.side.equals(side) && banKoma.isOnBoard,
    );
  }

  findGyokuBySide(side) {
    return this.banKomas.find(
      (item) => item.side.equals(side) && item.koma instanceof KomaGyoku,
    );
  }

  debug() {
    console.log('banKomas', JSON.stringify(this.banKomas, null, '  '));
  }
}

function loadBanSnapshot(json) {
  const banSnapshot = new BanSnapshot();

  json['initial_koma']['on_board']['sente'].forEach((koma) => {
    banSnapshot.putSenteOnBoard(
      new BanPoint(koma['suji'], koma['dan']),
      createKoma(koma['name'], koma['nari']),
    );
  });

  json['initial_koma']['on_board']['gote'].forEach((koma) => {
    banSnapshot.putGoteOnBoard(
      new BanPoint(koma['suji'], koma['dan']),
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

  const mySide = BanSide.createSenteSide();
  const enemySide = mySide.opposite();

  const enemyGyoku = ban.findGyokuBySide(enemySide);
  console.log(enemyGyoku);

  const myOnBoardBanKomas = ban.findOnBoardBanKomasBySide(mySide);
  myOnBoardBanKomas.forEach((myOnBoardBanKoma) => {
    myOnBoardBanKoma.findNextMovingOtes(ban, enemyGyoku);
  });

  // 作戦
  // banに状態を全て読み込む
  // banに対して「王手」となる操作を行う
  //   制約：その操作が王手であること、反則でないこと、
  // 王手が続いて最後に「詰み」となった場合、その「操作」の一覧を返却する
  //   「王手」が続かない場合はそれ以上探索しない
}
main();
