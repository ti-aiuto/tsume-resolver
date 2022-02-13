const BanKoma = require('./ban-koma.js').BanKoma;

const KomaFu = require('./koma-fu.js').KomaFu;
const KomaGyoku = require('./koma-gyoku.js').KomaGyoku;
const BanTe = require('./ban-te.js').BanTe;
const BanKyokumen = require('./ban-kyokumen.js').BanKyokumen;

// forEachよりfor(of)のほうが速いそうなので書き換えた
exports.TeResolver = class TeResolver {
  // 駒を動かして王手にできる手の配列(BanCommand[])を返す
  findNextMovingOtesOf(banSnapshot, tumasareSide) {
    const banTes = [];
    const gyokuBanKoma = banSnapshot.findGyokuBySide(tumasareSide);
    const tumaseSide = tumasareSide.opposite();

    const myOnBoardBanKomas = banSnapshot.findOnBoardBanKomasBySide(tumaseSide);
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
      const nextValidRangeBanPoints = banKoma.nextValidRangeBanPoints();

      // 移動してみて成る場合とならない場合のBanKomaを生成してみる
      for (let banPoint of nextValidRangeBanPoints) {
        // 自分の駒がいない点
        if (
          banSnapshot.canMoveToBanPointBySide(
            banKoma.banPoint,
            banPoint,
            tumaseSide,
          )
        ) {
          for (let nextBanKoma of banKoma.moveOrMoveAndNariToBanPoint(
            banPoint,
          )) {
            // そのBanKomaの移動先でその駒が王手をかけること
            if (
              banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint)
            ) {
              const nextBanShapshot = banSnapshot.moveKomaTo(
                banKoma.banPoint,
                nextBanKoma.banPoint,
                nextBanKoma.nari,
              );
              const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
              const banTe = new BanTe(nextBanKoma, nextBanKyokumen, banKoma);
              banTes.push(banTe);
            }
          }
        }
      }
    }

    return banTes;
  }

  findNextPuttingOtesOf(banSnapshot, tumasareSide) {
    const gyokuBanKoma = banSnapshot.findGyokuBySide(tumasareSide);
    const tumaseSide = gyokuBanKoma.side.opposite();

    const myCapturedBanKomas =
      banSnapshot.findDistictCapturedBanKomasBySide(tumaseSide);

    const result = [];
    for (let banKoma of myCapturedBanKomas) {
      const emptyBanPoints = banSnapshot.findEmptyPoints();

      for (let banPoint of emptyBanPoints) {
        const nextBanKoma = new BanKoma(banKoma.koma, tumaseSide, banPoint);

        if (banKoma.koma instanceof KomaFu) {
          // 二歩のチェック
          if (
            banSnapshot
              .findBanKomasBySideAndSuji(tumaseSide, banPoint.suji)
              .find((banKoma) => banKoma.koma.equals(banKoma.koma))
          ) {
            continue;
          }
        }

        if (banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint)) {
          // 打って王手にできる駒
          const nextBanShapshot = banSnapshot.putKoma(
            nextBanKoma.banPoint,
            nextBanKoma.koma,
            nextBanKoma.side,
          );
          const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
          const banTe = new BanTe(nextBanKoma, nextBanKyokumen, null);
          result.push(banTe);
        }
      }
    }

    return result;
  }

  // 玉が逃げる・取るパターン
  findNextOteEscaping(banSnapshot, tumasareSide) {
    const gyokuBanKoma = banSnapshot.findGyokuBySide(tumasareSide);

    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = gyokuBanKoma.nextValidRangeBanPoints();

    const result = [];
    for (let banPoint of nextValidRangeBanPoints) {
      // 駒がいない点
      if (banSnapshot.findBanKomaByBanPoint(banPoint)) {
        continue;
      }

      // 玉を移動させてみて、その状態で王手じゃないかをチェックする
      const nextBanKomas = gyokuBanKoma.moveOrMoveAndNariToBanPoint(banPoint);
      const nextBanKoma = nextBanKomas[0]; // 玉は成らない
      const nextBanSnapshot = banSnapshot.moveKomaTo(
        gyokuBanKoma.banPoint,
        banPoint,
        false,
      );
      const banKyokumen = new BanKyokumen(nextBanSnapshot);
      const nextBanTe = new BanTe(nextBanKoma, banKyokumen, gyokuBanKoma);

      // 王手を回避できる手
      if (!nextBanTe.banKyokumen.banSnapshot.isOtedFor(tumasareSide)) {
        result.push(nextBanTe);
      }
    }

    return result;
  }

  findNextOteRemoving(banSnapshot, tumasareSide) {
    const enemyCausingOteBanKomas =
      banSnapshot.causingOteBanKomasTo(tumasareSide);
    const myBanKomas = banSnapshot.findOnBoardBanKomasBySide(tumasareSide);

    if (enemyCausingOteBanKomas.length == -0) {
      throw new Error('王手がかかっていない');
    }

    const result = [];

    for (let myBanKoma of myBanKomas) {
      // 王手をかけている駒をとれる駒
      if (
        !enemyCausingOteBanKomas.some((enemyBanKoma) => {
          return banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint);
        })
      ) {
        continue;
      }

      for (let enemyBanKoma of enemyCausingOteBanKomas) {
        if (
          enemyCausingOteBanKomas.length >= 2 &&
          !banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint)
        ) {
          // 王手をかけている駒が複数ある場合は利きの範囲内か先にチェックする
          continue;
        }

        // その場所に移動できるかどうか
        if (
          !banSnapshot.canMoveToBanPointBySide(
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
          const nextBanShapshot = banSnapshot.moveKomaTo(
            myBanKoma.banPoint,
            nextBanKoma.banPoint,
            nextBanKoma.nari,
          );
          const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
          const nextBanTe = new BanTe(nextBanKoma, nextBanKyokumen, myBanKoma);

          // 王手を回避できること
          if (!nextBanTe.banKyokumen.banSnapshot.isOtedFor(tumasareSide)) {
            result.push(nextBanTe);
          }
        }
      }
    }

    return result;
  }

  findNextOteAigoma(banSnapshot, tumasareSide) {
    const gyokuBanKoma = banSnapshot.findGyokuBySide(tumasareSide);
    const enemyCausingOteBanKomas =
      banSnapshot.causingOteBanKomasTo(tumasareSide);

    if (enemyCausingOteBanKomas.length == -0) {
      throw new Error('王手がかかっていない');
    }

    const myCapturedBanKomas =
      banSnapshot.findDistictCapturedBanKomasBySide(tumasareSide);

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
          const nextBanShapshot = banSnapshot.putKoma(
            banPoint,
            capturedBanKoma.koma,
            tumasareSide,
          );
          const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
          const nextBanTe = new BanTe(nextBanKoma, nextBanKyokumen);

          // 王手を回避できること
          if (!nextBanTe.banKyokumen.banSnapshot.isOtedFor(tumasareSide)) {
            result.push(nextBanTe);
          }
        }
      }
    }

    return result;
  }
};
