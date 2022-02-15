const BanKoma = require('./ban-koma.js').BanKoma;

const KomaFu = require('./koma-fu.js').KomaFu;
const KomaGyoku = require('./koma-gyoku.js').KomaGyoku;

exports.BanTe = class BanTe {
  constructor(banKoma, banSnapshot, beforeBanKoma) {
    this.banKoma = banKoma;
    this.beforeBanKoma = beforeBanKoma;
    this.nextBanTes = [];
    this.banSnapshot = banSnapshot;
    this.isTsumi = null;
    this.isOneOfThemNoOte = null;
    this.isNoUkeAndFutureTsumi = null;
  }

  addBanTe(...banTes) {
    this.nextBanTes.push(...banTes);
  }

  markAsTsumi() {
    this.isTsumi = true;
  }

  markAsNotTsumi() {
    this.isTsumi = false;
  }

  markAsOneOfThemNoOte() {
    this.isOneOfThemNoOte = true;
  }

  markAsNoUkeAndFutureTsumi() {
    this.isNoUkeAndFutureTsumi = true;
  }

  // 駒を動かして王手にできる手の配列(BanCommand[])を返す
  findNextMovingOtesOf(tumasareSide) {
    const banTes = [];
    const gyokuBanKoma = this.banSnapshot.findGyokuBySide(tumasareSide);
    const tumaseSide = tumasareSide.opposite();

    const myOnBoardBanKomas =
      this.banSnapshot.findOnBoardBanKomasBySide(tumaseSide);
    for (let banKoma of myOnBoardBanKomas) {
      if (banKoma.koma instanceof KomaGyoku) {
        continue;
        // 玉で王手を掛けるとこちらが王手になってしまう
      }
      if (!banKoma.afterMoveNearPointOf(gyokuBanKoma.banPoint)) {
        // 遠い駒は飛ばす
        continue;
      }

      // 盤の範囲内で移動できる点
      for (let banPoint of banKoma.nextValidRangeBanPoints()) {
        // 自分の駒がいない点
        if (
          this.banSnapshot.canMoveToBanPointBySide(
            banKoma.banPoint,
            banPoint,
            tumaseSide,
          )
        ) {
          // 移動してみて成る場合とならない場合のBanKomaを生成してみる
          for (let nextBanKoma of banKoma.moveOrMoveAndNariToBanPoint(
            banPoint,
          )) {
            const nextBanShapshot = this.banSnapshot.moveKomaTo(
              banKoma.banPoint,
              nextBanKoma.banPoint,
              nextBanKoma.nari,
            );
            const banTe = new BanTe(nextBanKoma, nextBanShapshot, banKoma);

            // そのBanKomaの移動先でその駒が王手をかけること
            if (
              nextBanShapshot.isInPownerOfMove(
                nextBanKoma,
                gyokuBanKoma.banPoint,
              )
            ) {
              banTes.push(banTe);
            }
          }
        }
      }
    }

    return banTes;
  }

  findNextPuttingOtesOf(tumasareSide) {
    const gyokuBanKoma = this.banSnapshot.findGyokuBySide(tumasareSide);
    const tumaseSide = gyokuBanKoma.side.opposite();

    const myCapturedBanKomas =
      this.banSnapshot.findDistictCapturedBanKomasBySide(tumaseSide);

    const result = [];
    for (let banKoma of myCapturedBanKomas) {
      // 飛び道具の場合はある程度総当たり的な探索が必要
      // それ以外の場合は近い場所だけ対象にする
      const emptyBanPoints = this.banSnapshot.findEmptyPoints();
      for (let banPoint of emptyBanPoints) {
        const nextBanKoma = new BanKoma(banKoma.koma, tumaseSide, banPoint);

        if (banKoma.koma instanceof KomaFu) {
          // 二歩のチェック
          if (this.banSnapshot.findFuBySideAndSuji(tumaseSide, banPoint.suji)) {
            continue;
          }
        }

        if (
          this.banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint)
        ) {
          // 打って王手にできる駒
          const nextBanShapshot = this.banSnapshot.putKoma(
            nextBanKoma.banPoint,
            nextBanKoma.koma,
            nextBanKoma.side,
          );
          const banTe = new BanTe(nextBanKoma, nextBanShapshot, null);

          if (banKoma.koma instanceof KomaFu) {
            if (!banTe.findNextOteUke(tumasareSide).length) {
              // 打ち歩詰め
              continue;
            }
          }

          result.push(banTe);
        }
      }
    }

    return result;
  }

  // 玉が逃げる・取るパターン
  findNextOteEscaping(tumasareSide) {
    const gyokuBanKoma = this.banSnapshot.findGyokuBySide(tumasareSide);

    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = gyokuBanKoma.nextValidRangeBanPoints();

    const result = [];
    for (let banPoint of nextValidRangeBanPoints) {
      // 駒がいない点
      if (this.banSnapshot.findBanKomaByBanPoint(banPoint)) {
        continue;
      }

      // 玉を移動させてみて、その状態で王手じゃないかをチェックする
      const nextBanKoma = gyokuBanKoma.moveToBanPoint(banPoint);
      const nextBanSnapshot = this.banSnapshot.moveKomaTo(
        gyokuBanKoma.banPoint,
        banPoint,
        false,
      );
      const nextBanTe = new BanTe(nextBanKoma, nextBanSnapshot, gyokuBanKoma);

      // 王手を回避できる手
      if (!nextBanTe.banSnapshot.isOtedFor(tumasareSide)) {
        result.push(nextBanTe);
      }
    }

    return result;
  }

  findNextOteRemoving(tumasareSide) {
    const enemyCausingOteBanKomas =
      this.banSnapshot.causingOteBanKomasTo(tumasareSide);
    const myBanKomas = this.banSnapshot.findOnBoardBanKomasBySide(tumasareSide);

    if (enemyCausingOteBanKomas.length === 0) {
      throw new Error('王手がかかっていない');
    }

    const result = [];

    for (let myBanKoma of myBanKomas) {
      // 王手をかけている駒をとれる駒
      if (
        !enemyCausingOteBanKomas.some((enemyBanKoma) => {
          return this.banSnapshot.isInPownerOfMove(
            myBanKoma,
            enemyBanKoma.banPoint,
          );
        })
      ) {
        continue;
      }

      for (let enemyBanKoma of enemyCausingOteBanKomas) {
        if (
          enemyCausingOteBanKomas.length >= 2 &&
          !this.banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint)
        ) {
          // 王手をかけている駒が複数ある場合は利きの範囲内か先にチェックする
          continue;
        }

        // その場所に移動できるかどうか
        if (
          !this.banSnapshot.canMoveToBanPointBySide(
            myBanKoma.banPoint,
            enemyBanKoma.banPoint,
            tumasareSide,
          )
        ) {
          continue;
        }

        for (let nextBanKoma of myBanKoma.moveOrMoveAndNariToBanPoint(
          enemyBanKoma.banPoint,
        )) {
          const nextBanShapshot = this.banSnapshot.moveKomaTo(
            myBanKoma.banPoint,
            nextBanKoma.banPoint,
            nextBanKoma.nari,
          );
          const nextBanTe = new BanTe(nextBanKoma, nextBanShapshot, myBanKoma);

          // 王手を回避できること
          if (!nextBanTe.banSnapshot.isOtedFor(tumasareSide)) {
            result.push(nextBanTe);
          }
        }
      }
    }

    return result;
  }

  findNextOteAigoma(tumasareSide) {
    const gyokuBanKoma = this.banSnapshot.findGyokuBySide(tumasareSide);
    const enemyCausingOteBanKomas =
      this.banSnapshot.causingOteBanKomasTo(tumasareSide);

    if (!enemyCausingOteBanKomas.length) {
      throw new Error('王手がかかっていない');
    }

    const myCapturedBanKomas =
      this.banSnapshot.findDistictCapturedBanKomasBySide(tumasareSide);

    const result = [];
    for (let enemyBanKoma of enemyCausingOteBanKomas) {
      // 王手をかけている駒を間駒できる場所
      const aigmablePoints = gyokuBanKoma.banPoint.pointsBetween(
        enemyBanKoma.banPoint,
      );
      for (let banPoint of aigmablePoints) {
        for (let capturedBanKoma of myCapturedBanKomas) {
          const nextBanKoma = new BanKoma(
            capturedBanKoma.koma,
            tumasareSide,
            banPoint,
            false,
          );
          const nextBanShapshot = this.banSnapshot.putKoma(
            banPoint,
            capturedBanKoma.koma,
            tumasareSide,
          );
          const nextBanTe = new BanTe(nextBanKoma, nextBanShapshot);

          // 王手を回避できること
          if (!nextBanTe.banSnapshot.isOtedFor(tumasareSide)) {
            result.push(nextBanTe);
          }
        }
      }
    }

    return result;
  }

  findNextOteSeme(tumasareSide) {
    return [
      ...this.findNextMovingOtesOf(tumasareSide),
      ...this.findNextPuttingOtesOf(tumasareSide),
    ];
    // TODO: 開き王手を考慮する
  }

  findNextOteUke(tumasareSide) {
    return [
      ...this.findNextOteEscaping(tumasareSide),
      ...this.findNextOteRemoving(tumasareSide),
      ...this.findNextOteAigoma(tumasareSide),
    ];
  }

  tejunToString() {
    let result = '';
    if (this.beforeBanKoma) {
      result += `${this.banKoma.toString()}`;
    } else {
      result += `${this.banKoma.toString()} 打ち`;
    }
    return result;
  }

  toString() {
    let result = '';
    if (this.banKoma) {
      result += this.tejunToString() + '\n';
    }
    result += this.banSnapshot.toString();
    return result;
  }
};
