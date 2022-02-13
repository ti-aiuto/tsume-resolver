// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const KomaFu = require('./koma-fu.js').KomaFu;
const KomaKyo = require('./koma-kyo.js').KomaKyo;
const KomaKei = require('./koma-kei.js').KomaKei;
const KomaKaku = require('./koma-kaku.js').KomaKaku;
const KomaHisha = require('./koma-hisha.js').KomaHisha;
const KomaKin = require('./koma-kin.js').KomaKin;
const KomaGin = require('./koma-gin.js').KomaGin;
const KomaGyoku = require('./koma-gyoku.js').KomaGyoku;

const BanPoint = require('./ban-point.js').BanPoint;

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


class BanSide {
  constructor(id) {
    this.id = id;
  }

  equals(other) {
    return this.id === other.id;
  }

  opposite() {
    if (this.isSente) {
      return BanSide.createGoteSide();
    } else {
      return BanSide.createSenteSide();
    }
  }

  get label() {
    return 'TODO: 先手後手';
  }

  get shortLabel() {
    if (this.isSente) {
      return '@';
    } else {
      return 'o';
    }
  }

  get isSente() {
    return this.id === BanSide.ID_SENTE;
  }

  get isGote() {
    return !this.isSente;
  }

  static get ID_SENTE() {
    return 'SENTE';
  }

  static get ID_GOTE() {
    return 'GOTE';
  }

  static createSenteSide() {
    return new BanSide(BanSide.ID_SENTE);
  }

  static createGoteSide() {
    return new BanSide(BanSide.ID_GOTE);
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
    // 重複を除く
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
}

class BanTe {
  constructor(banKoma, banKyokumen, beforeBanKoma) {
    this.banKoma = banKoma;
    this.banKyokumen = banKyokumen;
    this.beforeBanKoma = beforeBanKoma;
  }

  toString() {
    let result = '';
    if (this.beforeBanKoma) {
      result += `${this.banKoma.toString()}\n`;
    } else {
      result += `${this.banKoma.toString()} 打ち\n`;
    }
    result += this.banKyokumen.banSnapshot.toString();
    return result;
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
              nextBanTes.push(
                new BanTe(nextBanKoma, nextBanKyokumen, myBanKoma),
              );
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

const DEPTH_LIMIT = 15;

function oteRecursively(depth, teResolver, banKyokumen, enemySide) {
  if (depth > DEPTH_LIMIT) {
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
  for (let banTe of banKyokumen.banTes) {
    extractTsumiTejunAsArray(
      result,
      [...currentPath, banTe],
      banTe.banKyokumen,
    );
  }
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const initialBanSnapshot = loadBanSnapshot(json);
  const initialBanKyokumen = new BanKyokumen(initialBanSnapshot);

  const enemySide = BanSide.createGoteSide();
  const teResolver = new TeResolver();

  console.log('探索を開始');
  console.log(`再帰上限：${DEPTH_LIMIT}`);
  oteRecursively(1, teResolver, initialBanKyokumen, enemySide);
  console.log('探索完了');

  const rawTsumiTejuns = [];
  extractTsumiTejunAsArray(rawTsumiTejuns, [], initialBanKyokumen);

  console.log(`総手順：${rawTsumiTejuns.length}`);

  const tsumiTejuns = rawTsumiTejuns.filter((tsumiTejun) => {
    const lastTe = tsumiTejun[tsumiTejun.length - 1];
    // 歩打ちで詰みは禁止
    return !(!lastTe.beforeBanKoma && lastTe.banKoma.koma instanceof KomaFu);
  });
  console.log(`歩で詰みを除く：${tsumiTejuns.length}`);

  tsumiTejuns.sort(function (a, b) {
    return Math.sign(a.length - b.length);
  });

  console.log('最良手数の場合：');

  console.log(initialBanSnapshot.toString());
  const tejunBest = tsumiTejuns[0];
  tejunBest.forEach((banTe) => {
    console.log(banTe.toString());
  });

  console.log('最悪手数（再帰制約内）の場合：');
  console.log(initialBanSnapshot.toString());
  const tejunWorst = tsumiTejuns[tsumiTejuns.length - 1];
  tejunWorst.forEach((banTe) => {
    console.log(banTe.toString());
  });
}
main();
