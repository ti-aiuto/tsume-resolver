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

    myCapturedBanKomas.forEach((banKoma) => {
      const emptyBanPoints = banSnapshot.findEmptyPoints();
      const nextOtePossibleBanKomas = [];

      emptyBanPoints.forEach((banPoint) => {
        const nextBanKoma = new BanKoma(banKoma.koma, tumaseSide, banPoint);

        if (banKoma.koma instanceof KomaFu) {
          // 二歩のチェック
          if (
            banSnapshot
              .findBanKomasBySideAndSuji(tumaseSide, banPoint.suji)
              .find((banKoma) => banKoma.koma.equals(banKoma.koma))
          ) {
            return false;
          }
        }

        if (banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint)) {
          nextOtePossibleBanKomas.push(nextBanKoma);
        }
      });

      result.push(
        ...nextOtePossibleBanKomas.map((oteBanKoma) => {
          const nextBanShapshot = banSnapshot.putKoma(
            oteBanKoma.banPoint,
            oteBanKoma.koma,
            oteBanKoma.side,
          );
          const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
          return new BanTe(oteBanKoma, nextBanKyokumen, null);
        }),
      );
    });

    return result;
  }

  // 玉が逃げる・取るパターン
  findNextOteEscaping(banSnapshot, tumasareSide) {
    const gyokuBanKoma = banSnapshot.findGyokuBySide(tumasareSide);

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
        return !nextBanTe.banKyokumen.banSnapshot.isOtedFor(tumasareSide);
      });
  }

  findNextOteRemoving(banSnapshot, tumasareSide) {
    const enemyCausingOteBanKomas =
      banSnapshot.causingOteBanKomasTo(tumasareSide);
    const myBanKomas = banSnapshot.findOnBoardBanKomasBySide(tumasareSide);

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
            tumasareSide,
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
      return !nextBanTe.banKyokumen.banSnapshot.isOtedFor(tumasareSide);
    });
  }

  findNextOteAigoma(banSnapshot, tumasareSide) {
    const gyokuBanKoma = banSnapshot.findGyokuBySide(tumasareSide);
    const enemyCausingOteBanKomas =
      banSnapshot.causingOteBanKomasTo(tumasareSide);
    const myCapturedBanKomas =
      banSnapshot.findDistictCapturedBanKomasBySide(tumasareSide);

    const nextBanTes = [];
    enemyCausingOteBanKomas.filter((enemyBanKoma) => {
      gyokuBanKoma.banPoint
        .pointsBetween(enemyBanKoma.banPoint)
        .forEach((banPoint) => {
          myCapturedBanKomas.forEach((capturedBanKoma) => {
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
            nextBanTes.push(new BanTe(nextBanKoma, nextBanKyokumen));
          });
        });
    });

    return nextBanTes.filter((nextBanTe) => {
      return !nextBanTe.banKyokumen.banSnapshot.isOtedFor(tumasareSide);
    });
  }
};