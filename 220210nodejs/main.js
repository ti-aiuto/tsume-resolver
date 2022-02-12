// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const KOMA_FU = ' 歩';
const KOMA_KYO = ' 香';
const KOMA_KEI = ' 桂';
const KOMA_KAKU = ' 角';
const KOMA_HISHA = ' 飛';
const KOMA_KIN = ' 金';
const KOMA_GIN = ' 銀';
const KOMA_GYOKU = ' 玉';
const KOMA_TOKIN = 'ﾄ金';
const KOMA_NARI_KYO = 'ﾄ香';
const KOMA_NARI_KEI = 'ﾄ桂';
const KOMA_UMA = ' 馬';
const KOMA_RYU = ' 竜';
const KOMA_NARI_GIN = 'ﾄ銀';
const OWNER_SENTE = '先手';
const OWNER_GOTE = '後手';
const SUJI_OPTIONS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const DAN_OPTIONS = SUJI_OPTIONS;

class Koma {
  label(nari) {
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

  equals(other) {
    return this.label === other.label && this.nari === other.nari;
  }
}

class KomaFu extends Koma {
  label(nari) {
    if (nari) {
      return KOMA_TOKIN;
    } else {
      return KOMA_FU;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
    if (nari) {
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
}

class KomaKyo extends Koma {
  label(nari) {
    if (nari) {
      return KOMA_NARI_KYO;
    } else {
      return KOMA_KYO;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
    if (nari) {
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
}

class KomaKei extends Koma {
  label(nari) {
    if (nari) {
      return KOMA_NARI_KEI;
    } else {
      return KOMA_KEI;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
    if (nari) {
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
}

class KomaKaku extends Koma {
  label(nari) {
    if (nari) {
      return KOMA_UMA;
    } else {
      return KOMA_KAKU;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
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
    if (nari) {
      return [...steps, [0, 1], [0, -1], [-1, 0], [1, 0]];
    } else {
      return steps;
    }
  }
}

class KomaHisha extends Koma {
  label(nari) {
    if (nari) {
      return KOMA_RYU;
    } else {
      return KOMA_HISHA;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
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
    if (nari) {
      return [...steps, [-1, 1], [1, 1], [-1, -1], [1, -1]];
    } else {
      return steps;
    }
  }
}

class KomaKin extends Koma {
  label(nari) {
    return KOMA_KIN;
  }

  get canBeNari() {
    return false;
  }

  possibleStepVectors(nari) {
    return [
      [0, 1],
      [-1, 1],
      [1, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
  }
}

class KomaGin extends Koma {
  label(nari) {
    if (nari) {
      return KOMA_NARI_GIN;
    } else {
      return KOMA_GIN;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
    if (nari) {
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
}

class KomaGyoku extends Koma {
  label(nari) {
    return KOMA_GYOKU;
  }

  get canBeNari() {
    return false;
  }

  possibleStepVectors(nari) {
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
      throw new Error(`想定外の移動パターン ${sujiD} ${danD} ${this} ${other}`);
    }
  }

  sujiDistance(other) {
    return Math.abs(this.suji - other.suji);
  }

  danDistance(other) {
    return Math.abs(this.dan - other.dan);
  }

  isTekiJinFor(side) {
    if (side.isSente) {
      return [7, 8, 9].includes(this.dan);
    } else {
      return [1, 2, 3].includes(this.dan);
    }
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
    if (this.isSente) {
      return BanSide.createGoteSide();
    } else {
      return BanSide.createSenteSide();
    }
  }

  get label() {
    return this.side;
  }

  get shortLabel() {
    if (this.isSente) {
      return '@';
    } else {
      return 'o';
    }
  }

  get isSente() {
    return this.side === OWNER_SENTE;
  }

  get isGote() {
    return !this.isSente;
  }

  static createSenteSide() {
    return new BanSide(OWNER_SENTE);
  }

  static createGoteSide() {
    return new BanSide(OWNER_GOTE);
  }
}

class BanKoma {
  constructor(koma, side, banPoint, nari) {
    this.koma = koma;
    this.side = side;
    this.banPoint = banPoint;
    this.nari = nari;

    if (!this.koma.canBeNari && nari) {
      throw new Error('nari不可');
    }
  }

  get isOnBoard() {
    return !!this.banPoint;
  }

  get isCaptured() {
    return !this.isOnBoard;
  }

  // この駒が次に移動できる先
  nextValidRangeBanPoints() {
    const stepVectors = this.koma.possibleStepVectors(this.nari);

    // 後手の場合は回転する
    if (this.side.isGote) {
      stepVectors.forEach((item) => {
        item[0] *= -1;
        item[1] *= -1;
      });
    }

    return stepVectors
      .map((stepVector) => this.banPoint.applyStepVencor(stepVector))
      .filter((item) => item);
  }

  moveOrMoveAndNariToBanPoint(toBanPoint) {
    const result = [];
    const nextBanKoma = new BanKoma(
      this.koma,
      this.side,
      toBanPoint,
      this.nari,
    );
    if (this.canBecomeNari(this.banPoint, toBanPoint)) {
      result.push(nextBanKoma.becomeNari(this.banPoint, toBanPoint));
    }
    result.push(nextBanKoma);
    return result;
  }

  canBecomeNari(fromBanPoint, toBanPoint) {
    return (
      this.koma.canBeNari &&
      !this.nari &&
      (fromBanPoint.isTekiJinFor(this.side) ||
        toBanPoint.isTekiJinFor(this.side))
    );
  }

  clone() {
    return new BanKoma(this.koma, this.side, this.banPoint, this.nari);
  }

  becomeNari(fromBanPoint, toBanPoint) {
    if (!this.canBecomeNari(fromBanPoint, toBanPoint)) {
      throw new Error('nari不可');
    }
    const cloned = this.clone();
    cloned.nari = true;
    return cloned;
  }

  toString() {
    return `${this.side.shortLabel} 筋:${this.banPoint.suji} 段:${
      this.banPoint.dan
    } ${this.koma.label(this.nari)} ${this.nari ? '成' : '不成'}`;
  }
}

class BanSnapshot {
  constructor(banKomas = []) {
    this.banKomas = banKomas;
  }

  initPutOnBoard(banPoint, koma, side, nari) {
    if (this.findBanKomaByBanPoint(banPoint)) {
      new Error('既に駒が存在');
    }
    this.banKomas.push(new BanKoma(koma, side, banPoint, nari));
    return this;
  }

  initAddCaptured(koma, side) {
    this.banKomas.push(new BanKoma(koma, side, null, false));
    return this;
  }

  // 駒を移動する
  moveKomaTo(fromBanPoint, toBanPoint, nari) {
    const cloned = this.clone();

    const targetBanKoma = cloned.findBanKomaByBanPoint(fromBanPoint);
    if (!targetBanKoma) {
      throw new Error('動かす対象の駒が存在しない');
    }

    const mySide = targetBanKoma.side;

    const existingBanKoma = cloned.findBanKomaByBanPoint(toBanPoint);
    if (existingBanKoma && existingBanKoma.side.equals(mySide)) {
      throw new Error('既に自分の駒が存在');
    }

    cloned.addOnBoardBanKoma(targetBanKoma.koma, mySide, toBanPoint, nari);
    cloned.removeOnBoardBanKoma(targetBanKoma);

    if (existingBanKoma) {
      cloned.removeOnBoardBanKoma(existingBanKoma);
      cloned.addCapturedBanKoma(existingBanKoma.koma, mySide);
    }
    return cloned;
  }

  // 駒を打つ
  putKoma(banPoint, koma, side) {
    const cloned = this.clone();
    if (cloned.findBanKomaByBanPoint(banPoint)) {
      new Error('既に駒が存在');
    }
    cloned.addOnBoardBanKoma(koma, side, banPoint, false);
    cloned.removeCapturedBanKoma(koma, side);
    return cloned;
  }

  // protected
  removeOnBoardBanKoma(banKoma) {
    const index = this.banKomas.indexOf(banKoma);
    this.banKomas.splice(index, 1);
  }

  // protected
  addOnBoardBanKoma(koma, side, banPoint, nari) {
    this.banKomas.push(new BanKoma(koma, side, banPoint, nari));
  }

  // protected
  addCapturedBanKoma(koma, side) {
    if (koma instanceof KomaGyoku) {
      throw new Error('玉を持ち駒にしている！');
    }
    this.initAddCaptured(koma, side);
  }

  // protected
  removeCapturedBanKoma(koma, side) {
    const capturedBanKoma = this.findDistictCapturedBanKomasBySide(side);
    const banKoma = capturedBanKoma.find((banKoma) =>
      banKoma.koma.equals(koma),
    );
    if (!banKoma) {
      throw new Error('持ち駒に駒がない');
    }
    const index = this.banKomas.indexOf(banKoma);
    this.banKomas.splice(index, 1);
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
  isInPownerOfMove(banKoma, otherBanPoint) {
    const gyokuInInPowerOfMove = banKoma
      .nextValidRangeBanPoints()
      .some((banPoint) => otherBanPoint.equals(banPoint));
    if (!gyokuInInPowerOfMove) {
      return false;
    }

    // 中間に邪魔する駒がないか
    const pointsBetween = banKoma.banPoint.pointsBetween(otherBanPoint);
    return pointsBetween.every(
      (pointBetween) => !this.findBanKomaByBanPoint(pointBetween),
    );
  }

  findBanKomaByBanPoint(banPoint) {
    return this.banKomas.find(
      (banKoma) => banKoma.banPoint && banKoma.banPoint.equals(banPoint),
    );
  }

  findBanKomasBySideAndSuji(side, suji) {
    return this.banKomas.filter(
      (banKoma) => banKoma.side.equals(side) && banKoma.banPoint?.suji === suji,
    );
  }

  findOnBoardBanKomasBySide(side) {
    return this.banKomas.filter(
      (banKoma) => banKoma.side.equals(side) && banKoma.isOnBoard,
    );
  }

  findCapturedBanKomasBySide(side) {
    return this.banKomas.filter(
      (banKoma) => banKoma.side.equals(side) && banKoma.isCaptured,
    );
  }

  findDistictCapturedBanKomasBySide(side) {
    const result = [];
    const banKomas = this.findCapturedBanKomasBySide(side);
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

  causingOteBanKomasTo(side) {
    const gyokuBanKoma = this.findGyokuBySide(side);
    const enemySide = side.opposite();
    const enemyBanKomas = this.findOnBoardBanKomasBySide(enemySide);
    return enemyBanKomas.filter((banKoma) => {
      return this.isInPownerOfMove(banKoma, gyokuBanKoma.banPoint);
    });
  }

  clone() {
    return new BanSnapshot([...this.banKomas]);
  }

  toString() {
    const sente = BanSide.createSenteSide();
    const gote = sente.opposite();
    let text = '';
    text += `${gote.shortLabel}:`;
    this.findCapturedBanKomasBySide(gote).forEach((banKoma) => {
      text += banKoma.koma.label(banKoma.nari);
    });
    text += '\n';
    [...DAN_OPTIONS].reverse().forEach((dan) => {
      SUJI_OPTIONS.forEach((suji) => {
        const banPoint = new BanPoint(suji, dan);
        const banKoma = this.findBanKomaByBanPoint(banPoint);
        if (banKoma) {
          text += banKoma.side.shortLabel + banKoma.koma.label(banKoma.nari);
        } else {
          text += '  　';
        }
        text += ' | ';
      });
      text += '\n';
    });
    text += `${sente.shortLabel}:`;
    this.findCapturedBanKomasBySide(sente).forEach((banKoma) => {
      text += banKoma.koma.label(banKoma.nari);
    });
    text += '\n';
    return text;
  }
}

class BanTe {
  constructor(banKoma, banKyokumen, beforeBanKoma) {
    this.banKoma = banKoma;
    this.banKyokumen = banKyokumen;
    this.beforeBanKoma = beforeBanKoma;
  }
}

class BanKyokumen {
  constructor(banSnapshot) {
    this.banSnapshot = banSnapshot;
    this.banTes = [];
    this.isNoOte = false;
    this.isTsumi = false;
  }

  addBanTe(banTe) {
    this.banTes.push(banTe);
  }

  markAsNoOte() {
    this.isNoOte = true;
  }

  markAsTsumi() {
    this.isTsumi = true;
  }

  get isToContinue() {
    return !this.isNoOte && !this.isTsumi;
  }
}

class TeResolver {
  // その駒を動かして王手にできる手の配列(BanCommand[])を返す
  findNextMovingOtesOf(banSnapshot, gyokuBanKoma, banKoma) {
    const mySide = gyokuBanKoma.side.opposite();
    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = banKoma.nextValidRangeBanPoints();

    // 自分の駒がいない点
    const notOccupyingPoints = nextValidRangeBanPoints.filter((banPoint) =>
      banSnapshot.canMoveToBanPointBySide(banKoma.banPoint, banPoint, mySide),
    );

    // 移動してみて成る場合とならない場合のBanKomaを生成してみる
    const nextPossibleBanKomas = [];
    notOccupyingPoints.forEach((banPoint) =>
      nextPossibleBanKomas.push(
        ...banKoma.moveOrMoveAndNariToBanPoint(banPoint),
      ),
    );
    // そのBanKomaの移動先の点が敵玉の点と一致すること
    const oteBanKomas = nextPossibleBanKomas.filter((nextBanKoma) =>
      banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint),
    );

    return oteBanKomas.map((oteBanKoma) => {
      const nextBanShapshot = banSnapshot.moveKomaTo(
        banKoma.banPoint,
        oteBanKoma.banPoint,
        oteBanKoma.nari,
      );
      const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
      return new BanTe(oteBanKoma, nextBanKyokumen, banKoma);
    });
  }

  findNextPuttingOtesOf(banSnapshot, gyokuBanKoma, banKoma) {
    const mySide = gyokuBanKoma.side.opposite();

    const emptyBanPoints = banSnapshot.findEmptyPoints();
    const nextOtePossibleBanKomas = [];

    emptyBanPoints.forEach((banPoint) => {
      const nextBanKoma = new BanKoma(banKoma.koma, mySide, banPoint);

      if (banKoma.koma instanceof KomaFu) {
        // 二歩のチェック
        if (
          banSnapshot
            .findBanKomasBySideAndSuji(mySide, banPoint.suji)
            .find((banKoma) => banKoma.koma.equals(banKoma.koma))
        ) {
          return false;
        }
      }

      if (banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint)) {
        nextOtePossibleBanKomas.push(nextBanKoma);
      }
    });

    return nextOtePossibleBanKomas.map((oteBanKoma) => {
      const nextBanShapshot = banSnapshot.putKoma(
        oteBanKoma.banPoint,
        oteBanKoma.koma,
        oteBanKoma.side,
      );
      const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
      return new BanTe(oteBanKoma, nextBanKyokumen, null);
    });
  }

  // 玉が逃げる・取るパターン
  findNextOteEscaping(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side;

    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = gyokuBanKoma.nextValidRangeBanPoints();

    // 駒がいない点
    const notOccupyingPoints = nextValidRangeBanPoints.filter(
      (banPoint) => !banSnapshot.findBanKomaByBanPoint(banPoint),
    );

    return notOccupyingPoints
      .map((banPoint) => {
        // 玉を移動させてみて、その状態で王手じゃないかをチェックする
        const nextBanKomas = gyokuBanKoma.moveOrMoveAndNariToBanPoint(banPoint);
        const nextBanKoma = nextBanKomas[0]; // 玉は成らない
        const nextBanSnapshot = banSnapshot.moveKomaTo(
          gyokuBanKoma.banPoint,
          banPoint,
          false,
        );
        const banKyokumen = new BanKyokumen(nextBanSnapshot);
        return new BanTe(nextBanKoma, banKyokumen, gyokuBanKoma);
      })
      .filter((nextBanTe) => {
        return !nextBanTe.banKyokumen.banSnapshot.causingOteBanKomasTo(mySide)
          .length;
      });
  }

  findNextOteRemoving(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side;
    const enemyCausingOteBanKomas = banSnapshot.causingOteBanKomasTo(mySide);
    const myBanKomas = banSnapshot.findOnBoardBanKomasBySide(mySide);

    // 王手をかけている駒を取れる駒の一覧
    const myBanKomasToRemoveEnemyBanKomas = myBanKomas.filter((myBanKoma) => {
      return enemyCausingOteBanKomas.some((enemyBanKoma) => {
        return banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint);
      });
    });

    const nextBanTes = [];
    myBanKomasToRemoveEnemyBanKomas.forEach((myBanKoma) => {
      enemyCausingOteBanKomas.forEach((enemyBanKoma) => {
        // 王手をかけている駒が複数ある場合もあるので利きの範囲内か先にチェックする
        if (
          banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint) &&
          banSnapshot.canMoveToBanPointBySide(
            myBanKoma.banPoint,
            enemyBanKoma.banPoint,
            mySide,
          )
        ) {
          myBanKoma
            .moveOrMoveAndNariToBanPoint(enemyBanKoma.banPoint)
            .forEach((nextBanKoma) => {
              const nextBanShapshot = banSnapshot.moveKomaTo(
                myBanKoma.banPoint,
                nextBanKoma.banPoint,
                nextBanKoma.nari,
              );
              const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
              nextBanTes.push(new BanTe(nextBanKoma, nextBanKyokumen, myBanKoma));
            });
        }
      });
    });

    return nextBanTes.filter((nextBanTe) => {
      return !nextBanTe.banKyokumen.banSnapshot.causingOteBanKomasTo(mySide)
        .length;
    });
  }

  findNextOteAigoma(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side;
    const enemyCausingOteBanKomas = banSnapshot.causingOteBanKomasTo(mySide);
    const myCapturedBanKomas =
      banSnapshot.findDistictCapturedBanKomasBySide(mySide);

    const nextBanTes = [];
    enemyCausingOteBanKomas.filter((enemyBanKoma) => {
      gyokuBanKoma.banPoint
        .pointsBetween(enemyBanKoma.banPoint)
        .forEach((banPoint) => {
          myCapturedBanKomas.forEach((capturedBanKoma) => {
            const nextBanKoma = new BanKoma(
              capturedBanKoma.koma,
              mySide,
              banPoint,
              false,
            );
            const nextBanShapshot = banSnapshot.putKoma(
              banPoint,
              capturedBanKoma.koma,
              mySide,
            );
            const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
            nextBanTes.push(new BanTe(nextBanKoma, nextBanKyokumen));
          });
        });
    });

    return nextBanTes.filter((nextBanTe) => {
      return !nextBanTe.banKyokumen.banSnapshot.causingOteBanKomasTo(mySide)
        .length;
    });
  }
}

function loadBanSnapshot(json) {
  const banSnapshot = new BanSnapshot();

  const sente = BanSide.createSenteSide();
  const gote = BanSide.createGoteSide();

  json['initial_koma']['on_board']['sente'].forEach((koma) => {
    banSnapshot.initPutOnBoard(
      new BanPoint(koma['suji'], koma['dan']),
      createKoma(koma['name']),
      sente,
      koma['nari'],
    );
  });

  json['initial_koma']['on_board']['gote'].forEach((koma) => {
    banSnapshot.initPutOnBoard(
      new BanPoint(koma['suji'], koma['dan']),
      createKoma(koma['name']),
      gote,
      koma['nari'],
    );
  });

  json['initial_koma']['captured']['sente'].forEach((koma) =>
    banSnapshot.initAddCaptured(createKoma(koma['name']), sente),
  );

  json['initial_koma']['captured']['gote'].forEach((koma) =>
    banSnapshot.initAddCaptured(createKoma(koma['name']), gote),
  );

  return banSnapshot;
}

function nextOte(teResolver, banKyokumen, enemySide) {
  const banSnapshot = banKyokumen.banSnapshot;
  const mySide = enemySide.opposite();
  const enemyGyoku = banSnapshot.findGyokuBySide(enemySide);

  const myOnBoardBanKomas = banSnapshot.findOnBoardBanKomasBySide(mySide);
  // 自分が王手になっていないことのチェックも入れたほうがよさそう
  myOnBoardBanKomas
    .filter((banKoma) => banKoma.koma instanceof KomaGyoku) 
    .forEach((myOnBoardBanKoma) => {
      const nextBanTes = teResolver.findNextMovingOtesOf(
        banSnapshot,
        enemyGyoku,
        myOnBoardBanKoma,
      );

      nextBanTes.forEach((banTe) => {
        banKyokumen.addBanTe(banTe);
      });
    });

  const myCapturedBanKomas =
    banSnapshot.findDistictCapturedBanKomasBySide(mySide);
  myCapturedBanKomas.forEach((myOnBoardBanKoma) => {
    const nextBanTes = teResolver.findNextPuttingOtesOf(
      banSnapshot,
      enemyGyoku,
      myOnBoardBanKoma,
    );

    nextBanTes.forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });
  });

  if (banKyokumen.banTes.length) {
    return true;
  } else {
    banKyokumen.markAsNoOte();
    return false;
  }
}

function nextSurvival(teResolver, banKyokumen, enemySide) {
  const banSnapshot = banKyokumen.banSnapshot;
  const enemyGyoku = banSnapshot.findGyokuBySide(enemySide);

  teResolver
    .findNextOteEscaping(banKyokumen.banSnapshot, enemyGyoku)
    .forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });

  teResolver
    .findNextOteRemoving(banKyokumen.banSnapshot, enemyGyoku)
    .forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });

  teResolver
    .findNextOteAigoma(banKyokumen.banSnapshot, enemyGyoku)
    .forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });

  if (banKyokumen.banTes.length) {
    return true;
  } else {
    banKyokumen.markAsTsumi();
    return false;
  }
}

function oteRecursively(depth, teResolver, banKyokumen, enemySide) {
  if (depth > 15) {
    // console.log("階層が深いため中止");
    return;
  }
  if (nextOte(teResolver, banKyokumen, enemySide)) {
    // 次の階層
    for (let banTe of banKyokumen.banTes) {
      surviveRecursively(depth + 1, teResolver, banTe.banKyokumen, enemySide);
    }
  } else {
    // 逃げられた
  }
}

function surviveRecursively(depth, teResolver, banKyokumen, enemySide) {
  if (nextSurvival(teResolver, banKyokumen, enemySide)) {
    // 次の階層
    for (let banTe of banKyokumen.banTes) {
      oteRecursively(depth + 1, teResolver, banTe.banKyokumen, enemySide);
    }
  } else {
    // 詰み
  }
}

function extractTsumiTejunAsArray(result, currentPath, banKyokumen) {
  if (banKyokumen.isNoOte) {
    return; // 逃げられた
  }
  if (banKyokumen.isTsumi) {
    result.push(currentPath);
  }
  for (let banTe of banKyokumen.banTes)  {
    extractTsumiTejunAsArray(result, [...currentPath, banTe], banTe.banKyokumen);
  }
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const initialBanSnapshot = loadBanSnapshot(json);
  const initialBanKyokumen = new BanKyokumen(initialBanSnapshot);
  console.log(initialBanSnapshot.toString());

  const enemySide = BanSide.createGoteSide();
  const teResolver = new TeResolver();

  console.log('探索を開始');
  oteRecursively(1, teResolver, initialBanKyokumen, enemySide);
  console.log('探索完了');

  const rawTsumiTejuns = [];
  extractTsumiTejunAsArray(rawTsumiTejuns, [], initialBanKyokumen);
  
  console.log(`総手順：${rawTsumiTejuns.length}`);

  const tsumiTejuns = rawTsumiTejuns.filter((tsumiTejun) => {
    const lastTe = tsumiTejun[tsumiTejun.length - 1];
    // 歩打ちで詰みは禁止
    return !(!lastTe.beforeBanKoma && lastTe.banKoma.koma instanceof KomaFu)
  });
  console.log(`歩で詰みを除く：${rawTsumiTejuns.length}`);
}
main();
