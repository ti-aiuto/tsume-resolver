// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki2.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const KOMA_FU = '歩';
const KOMA_KYO = '香';
const KOMA_KEI = '桂';
const KOMA_KAKU = '角';
const KOMA_HISHA = '飛';
const KOMA_KIN = '金';
const KOMA_GIN = '銀';
const KOMA_GYOKU = '玉';
const KOMA_TOKIN = 'と金';
const KOMA_NARI_KYO = '成香';
const KOMA_NARI_KEI = '成桂';
const KOMA_UMA = '馬';
const KOMA_RYU = '竜';
const KOMA_NARI_GIN = '成銀';
const OWNER_SENTE = '先手';
const OWNER_GOTE = '後手';
const SUJI_OPTIONS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const DAN_OPTIONS = SUJI_OPTIONS;

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

  get canBecomeNari() {
    return this.canBeNari && !this.nari;
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
    if (!this.canBecomeNari) {
      throw new Error('nari不可');
    }
    const cloned = this.clone();
    cloned.nari = true;
    return cloned;
  }

  equals(other) {
    return this.label === other.label && this.nari === other.nari;
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

  pointsBetween(other) {
    const [sujiD, danD] = [this.sujiDistance(other), this.danDistance(other)];
    // 一マス移動の場合
    if (sujiD <= 1 && danD <= 1) {
      // 間のマスはない
      return [];
    } else if ((sujiD === 0 && danD > 0) || (sujiD > 0 && danD === 0)) {
      // 飛車・香車
      if (sujiD) {
        const sujiUnit = (other.suji - this.suji) / sujiD;
        const result = [];
        // 縦移動
        // 3マス先に移動だったら1, 2マス目を返してほしい
        for (let i = 1; i < sujiD; i++) {
          result.push(new BanPoint(this.suji + sujiUnit * i, this.dan));
        }
        return result;
      } else {
        const danUnit = (other.dan - this.dan) / danD;
        const result = [];
        // 横移動
        for (let j = 1; j < danD; j++) {
          result.push(new BanPoint(this.suji, this.dan + danUnit * j));
        }
        return result;
      }
    } else if (sujiD === danD) {
      // 角
      const sujiUnit = (other.suji - this.suji) / sujiD;
      const danUnit = (other.dan - this.dan) / danD;
      const result = [];
      for (let i = 1; i < Math.abs(sujiD); i++) {
        result.push(
          new BanPoint(this.suji + sujiUnit * i, this.dan + danUnit * i),
        );
      }
      return result;
    } else if (sujiD === 1 && danD === 2) {
      // 桂馬は間の駒を飛び越えてOK
      return [];
    } else {
      throw new Error(`想定外の移動パターン ${sujiD} ${danD}`);
    }
  }

  sujiDistance(other) {
    return Math.abs(this.suji - other.suji);
  }

  danDistance(other) {
    return Math.abs(this.dan - other.dan);
  }

  toString() {
    return `筋：${this.suji}, 段：${this.dan}`;
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
  findNextMovingOtes(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side.opposite();
    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = this.nextValidRangeBanPoints();

    // 自分の駒がいない点
    const notOccupyingPoints = nextValidRangeBanPoints.filter((banPoint) =>
      banSnapshot.canMoveToBanPointBySide(this.banPoint, banPoint, mySide),
    );

    // 移動してみて成る場合とならない場合のBanKomaを生成してみる
    const nextPossibleBanKomas = [];
    notOccupyingPoints.forEach((banPoint) =>
      nextPossibleBanKomas.push(...this.moveToBanPoint(banPoint)),
    );
    // そのBanKomaの移動先の点が敵玉の点と一致すること
    const nextOtePossibleBanKomas = nextPossibleBanKomas.filter((nextBanKoma) =>
      banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma),
    );

    if (nextOtePossibleBanKomas.length) {
      console.log(`${this.koma.label}を次へ移動：`);
      nextOtePossibleBanKomas.forEach((banKoma) => {
        console.log(banKoma.banPoint.toString());
      });
    }
  }

  findNextPuttingOtes(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side.opposite();

    const emptyBanPoints = banSnapshot.findEmptyPoints();
    const nextOtePossibleBanKomas = [];

    emptyBanPoints.forEach((banPoint) => {
      const nextBanKoma = new BanKoma(this.koma, mySide, banPoint);
      if (banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma)) {
        nextOtePossibleBanKomas.push(nextBanKoma);
      }
    });

    // TODO: ここで二歩をチェック

    if (nextOtePossibleBanKomas.length) {
      console.log(`${this.koma.label}を次に打つ：`);
      nextOtePossibleBanKomas.forEach((banKoma) => {
        console.log(banKoma.banPoint.toString());
      });
    }
  }

  // この駒が次に移動できる先
  nextValidRangeBanPoints() {
    const stepVectors = this.koma.possibleStepVectors();
    return stepVectors
      .map((stepVector) => this.banPoint.applyStepVencor(stepVector))
      .filter((item) => item);
  }

  moveToBanPoint(banPoint) {
    const result = [];
    if (this.koma.canBecomeNari) {
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

  canMoveToBanPointBySide(fromBanPoint, toBanPoint, banSide) {
    // 移動先に自分の駒があったら移動不可
    const destinationPointCheck = this.canPutAtBanPointBySide(
      toBanPoint,
      banSide,
    );
    if (!destinationPointCheck) {
      return false;
    }

    // 移動先までの間に自分・敵どちらかの駒があったら今回の行先には移動不可
    const pointsBetween = fromBanPoint.pointsBetween(toBanPoint);
    return pointsBetween.every(
      (pointBetween) => !this.findBanKomaByBanPoint(pointBetween),
    );
  }

  // 第一引数の駒の効きに第二引数の駒が入っているかどうか
  isInPownerOfMove(banKoma, otherBanKoma) {
    const gyokuInInPowerOfMove = banKoma
      .nextValidRangeBanPoints()
      .some((banPoint) => otherBanKoma.banPoint.equals(banPoint));
    if (!gyokuInInPowerOfMove) {
      return false;
    }

    // 中間に邪魔する駒がないか
    const pointsBetween = banKoma.banPoint.pointsBetween(otherBanKoma.banPoint);
    return pointsBetween.every(
      (pointBetween) => !this.findBanKomaByBanPoint(pointBetween),
    );
  }

  findBanKomaByBanPoint(banPoint) {
    return this.banKomas.find((banKoma) => banKoma.banPoint?.equals(banPoint));
  }

  findOnBoardBanKomasBySide(side) {
    return this.banKomas.filter(
      (banKoma) => banKoma.side.equals(side) && banKoma.isOnBoard,
    );
  }

  findDistictCapturedBanKomasBySide(side) {
    const result = [];
    const banKomas = this.banKomas.filter(
      (banKoma) => banKoma.side.equals(side) && banKoma.isCaptured,
    );
    banKomas.forEach((banKoma) => {
      if (!result.find((resultKoma) => resultKoma.koma.equals(banKoma.koma))) {
        result.push(banKoma);
      }
    });
    return result;
  }

  findGyokuBySide(side) {
    return this.banKomas.find(
      (item) => item.side.equals(side) && item.koma instanceof KomaGyoku,
    );
  }

  // 駒を打てる場所の一覧
  // 計算コスト高いため覚えておくことを推奨
  findEmptyPoints() {
    const result = [];
    SUJI_OPTIONS.forEach((suji) => {
      DAN_OPTIONS.forEach((dan) => {
        const banPoint = new BanPoint(suji, dan);
        if (!this.findBanKomaByBanPoint(banPoint)) {
          result.push(banPoint);
        }
      });
    });
    return Object.freeze(result);
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

  const myCapturedBanKomas = ban.findDistictCapturedBanKomasBySide(mySide);
  myCapturedBanKomas.forEach((myOnBoardBanKoma) => {
    myOnBoardBanKoma.findNextPuttingOtes(ban, enemyGyoku);
  });

  // 作戦
  // banに状態を全て読み込む
  // banに対して「王手」となる操作を行う
  //   制約：その操作が王手であること、反則でないこと、
  // 王手が続いて最後に「詰み」となった場合、その「操作」の一覧を返却する
  //   「王手」が続かない場合はそれ以上探索しない
}
main();
