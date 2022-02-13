const BanKoma = require('./ban-koma.js').BanKoma;
const KomaGyoku = require('./koma-gyoku.js').KomaGyoku;
const BanPoint = require('./ban-point.js').BanPoint;
const BanSide = require('./ban-side.js').BanSide;

exports.BanSnapshot = class BanSnapshot {
  constructor(banKomas = []) {
    this.banKomas = banKomas;
  }

  initPutOnBoard(banPoint, koma, side, nari) {
    if (this.findBanKomaByBanPoint(banPoint)) {
      new Error('既に駒が存在');
    }
    this.addBanKoma(new BanKoma(koma, side, banPoint, nari));
    return this;
  }

  initAddCaptured(koma, side) {
    this.addBanKoma(new BanKoma(koma, side, null, false));
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
    cloned.removeBanKoma(targetBanKoma);

    if (existingBanKoma) {
      cloned.removeBanKoma(existingBanKoma);
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
  addOnBoardBanKoma(koma, side, banPoint, nari) {
    this.addBanKoma(new BanKoma(koma, side, banPoint, nari));
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
  }

  isNotOccupiedBySide(banPoint, banSide) {
    const occupyingBanKoma = this.findBanKomaByBanPoint(banPoint);
    return !occupyingBanKoma || !occupyingBanKoma.side.equals(banSide);
  }

  canMoveToBanPointBySide(fromBanPoint, toBanPoint, banSide) {
    // 移動先に自分の駒があったら移動不可
    const destinationPointCheck = this.isNotOccupiedBySide(toBanPoint, banSide);
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
    // 最大限移動しても利きに入っていないなら入らない
    if (!banKoma.nearPointOf(otherBanPoint)) {
      return false;
    }

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
    // 重複を除く
    for (let banKoma of banKomas) {
      if (!result.find((resultKoma) => resultKoma.koma.equals(banKoma.koma))) {
        result.push(banKoma);
      }
    }
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
    BanPoint.sujiOptions().forEach((suji) => {
      BanPoint.danOptions().forEach((dan) => {
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

  isOtedFor(tumasareSide) {
    // 王手をかけている駒があるかどうか
    return this.causingOteBanKomasTo(tumasareSide).length;
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
    [...BanPoint.danOptions()].reverse().forEach((dan) => {
      BanPoint.sujiOptions().forEach((suji) => {
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

  addBanKoma(banKoma) {
    this.banKomas.push(banKoma);
  }

  removeBanKoma(banKoma) {
    const index = this.banKomas.indexOf(banKoma);
    this.banKomas.splice(index, 1);
  }
};
